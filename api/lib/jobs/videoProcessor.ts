import fs from 'fs-extra'
import { processVideo } from '../media/videoProcessor.js'
import { getAudioBitrate } from '../media/audioAnalyzer.js'
import BunnyStreamClient from '../bunny/streamClient.js'

interface JobStatus {
  status: string
  message: string
  videoId?: string
  fileName?: string
  createdAt?: Date
  updatedAt?: Date
}

class VideoProcessorJob {
  private streamClient: BunnyStreamClient
  private jobs: Map<string, JobStatus>

  constructor() {
    this.streamClient = new BunnyStreamClient()
    this.jobs = new Map()
  }

  async processVideoInBackground(jobId: string, filePath: string, fileName: string): Promise<void> {
    try {
      // Update status to processing
      this.updateJobStatus(jobId, 'processing', 'Processing video...')

      const audiobitrate = await getAudioBitrate(filePath);
      // Process video with FFmpeg
      const optimizedPath = await processVideo(filePath, audiobitrate)
      
      // Update status to uploading
      this.updateJobStatus(jobId, 'uploading', 'Uploading to Bunny Stream...')

      // Upload to Bunny Stream
      const videoId = await this.streamClient.upload(optimizedPath, fileName)

      // Update status to completed
      this.updateJobStatus(jobId, 'completed', 'Video processing completed', videoId)

      // Clean up files
      await fs.remove(filePath).catch(() => {})
      await fs.remove(optimizedPath).catch(() => {})

    } catch (error: any) {
      console.error('Video processing error:', error)
      this.updateJobStatus(jobId, 'failed', error.message)
      
      // Clean up on error
      await fs.remove(filePath).catch(() => {})
    }
  }

  updateJobStatus(jobId: string, status: string, message: string, videoId?: string): void {
    const existingJob = this.jobs.get(jobId) || {}
    this.jobs.set(jobId, {
      ...existingJob,
      status,
      message,
      videoId,
      updatedAt: new Date()
    })
  }

  getJobStatus(jobId: string): JobStatus {
    return this.jobs.get(jobId) || { status: 'not_found', message: 'Job not found' }
  }

  createJob(jobId: string, fileName: string): void {
    this.jobs.set(jobId, {
      status: 'queued',
      message: 'Video upload completed, processing queued...',
      fileName,
      createdAt: new Date()
    })
  }
}

export default new VideoProcessorJob()