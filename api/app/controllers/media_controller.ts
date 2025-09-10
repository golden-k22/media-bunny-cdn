import path from 'path'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import { HttpContext } from '@adonisjs/core/http'

import { processImage } from '../../lib/media/imageProcessor.js'
import BunnyStorageClient from '../../lib/bunny/storageClient.js'
import BunnyStreamClient from '../../lib/bunny/streamClient.js'
import { validateFileAfterUpload } from '../../lib/upload/fileValidator.js'
import videoProcessor from '../../lib/jobs/videoProcessor.js'

export default class MediaController {
  private storageClient: any
  private streamClient: any

  constructor() {
    this.storageClient = new BunnyStorageClient()
    this.streamClient = new BunnyStreamClient()
  }

  public async upload({ request, response }: HttpContext) {
    try {
      const media = request.file('media', {
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
        size: '500mb'
      })

      if (!media) {
        return response.status(400).json({ error: 'No file uploaded' })
      }

      // Generate unique filename
      const fileName = `${uuidv4()}-${media.clientName}`
      await media.move('tmp', { name: fileName, overwrite: true })

      if (!media.isValid) {
        return response.status(400).json({ error: 'File upload failed' })
      }

      // Create file object for compatibility
      const file = {
        originalname: media.clientName,
        mimetype: `${media.type}/${media.subtype}`,
        path: media.filePath!,
        size: media.size
      }

      // Validate file
      try {
        validateFileAfterUpload(file)
      } catch (validationError) {
        await fs.remove(file.path).catch(() => {})
        return response.status(400).json({ error: validationError.message })
      }

      const isImage = file.mimetype.startsWith('image/')
      const isVideo = file.mimetype.startsWith('video/')
      
      if (!isImage && !isVideo) {
        await fs.remove(file.path).catch(() => {})
        return response.status(400).json({ error: 'Unsupported file type' })
      }
      
      let result
      if (isImage) {
        const { fullUrl, thumbUrl } = await this.handleImageUpload(file)
        result = { cdnUrl: fullUrl, thumbnailUrl: thumbUrl }
        await fs.remove(file.path)
      } else {
        // For videos, return immediately and process in background
        const jobId = uuidv4()
        videoProcessor.createJob(jobId, file.originalname)
        
        // Start background processing
        videoProcessor.processVideoInBackground(jobId, file.path, file.originalname)
        
        result = { 
          jobId,
          status: 'processing',
          message: 'Video uploaded successfully, processing in background...'
        }
      }

      return response.json({
        success: true,
        ...result,
        type: isImage ? 'image' : 'video',
        originalName: file.originalname
      })
    } catch (error) {
      console.error('Upload error:', error)
      return response.status(500).json({ error: error.message || 'Processing failed' })
    }
  }

  private async handleImageUpload(file: any) {
    const { fullPath, thumbPath } = await processImage(file.path, file.size)
    
    try {
      const fullFileName = `images/${path.basename(fullPath)}`
      const thumbFileName = `images/${path.basename(thumbPath)}`
      
      const [fullUrl, thumbUrl] = await Promise.all([
        this.storageClient.upload(fullPath, fullFileName),
        this.storageClient.upload(thumbPath, thumbFileName)
      ])
      
      return { fullUrl, thumbUrl }
    } finally {
      await fs.remove(fullPath).catch(() => {})
      await fs.remove(thumbPath).catch(() => {})
    }
  }

  public async jobStatus({ params, response }: HttpContext) {
    const { jobId } = params
    const status = videoProcessor.getJobStatus(jobId)
    return response.json(status)
  }

  public async list({ response }: HttpContext) {
    try {
      const [storageFiles, streamVideos] = await Promise.all([
        this.storageClient.listFiles(),
        this.streamClient.listVideos()
      ])

      const items = {
        images: storageFiles.map((file: any) => ({
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          name: file.name,
          type: 'image'
        })),
        videos: streamVideos.map((video: any) => ({
          url: video.url,
          name: video.name,
          poster: video.poster,
          type: 'video'
        }))
      }

      return response.json({ items })
    } catch (error) {
      console.error('List media error:', error)
      return response.status(500).json({ error: 'Failed to fetch media' })
    }
  }
}