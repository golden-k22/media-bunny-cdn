import axios from 'axios'
import fs from 'fs-extra'

export default class BunnyStreamClient {
  private libraryId: string
  private apiKey: string
  private videoApiEndpoint: string
  private videoCdnEndpoint: string
  private retryCount: number
  private retryInterval: number

  constructor() {
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!
    this.apiKey = process.env.BUNNY_STREAM_API_KEY!
    this.videoApiEndpoint = process.env.BUNNY_STREAM_API_HOST || 'https://video.bunnycdn.com'
    this.videoCdnEndpoint = process.env.BUNNY_STREAM_CDN_HOST || 'https://vz-8384db42-67b.b-cdn.net'
    this.retryCount = 3
    this.retryInterval = 1000

    if (!this.libraryId || !this.apiKey) {
      throw new Error('Missing Bunny Stream configuration')
    }
  }

  async upload(filePath: string, fileName: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath)
    const sanitizedTitle = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

    try {
      // Create video with retry
      const videoId = await this.createVideo(sanitizedTitle)
      
      // Upload video file
      await this.uploadVideoFile(videoId, fileBuffer)
      
      return videoId    
    } catch (error: any) {
      const sanitizedError = {
        message: error.message?.replace(/[\r\n\t]/g, ' '),
        status: error.response?.status
      }
      console.error('Bunny Stream upload error:', sanitizedError)
      throw new Error('Failed to upload to Bunny Stream')
    }
  }

  private async createVideo(title: string): Promise<string> {
    for (let i = 0; i < this.retryCount; i++) {
      try {
        const { data } = await axios.post(
          `${this.videoApiEndpoint}/library/${this.libraryId}/videos`,
          { title },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              AccessKey: this.apiKey,
            },
            timeout: 30000,
          }
        )

        return data.guid
      } catch (err) {
        if (i === this.retryCount - 1) throw err
        await new Promise(resolve => setTimeout(resolve, this.retryInterval))
      }
    }
    throw new Error('Failed to create video after retries')
  }

  private async uploadVideoFile(videoId: string, fileBuffer: Buffer): Promise<void> {
    await axios.put(
      `${this.videoApiEndpoint}/library/${this.libraryId}/videos/${videoId}`,
      fileBuffer,
      {
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': 'application/octet-stream',
          'Connection': 'keep-alive',
          'User-Agent': 'BunnyUploader/1.0'
        },
        timeout: 120000
      }
    )
  }

  async listVideos(): Promise<any[]> {
    const response = await axios.get(
      `${this.videoApiEndpoint}/library/${this.libraryId}/videos`,
      {
        headers: {
          'AccessKey': this.apiKey
        },
        timeout: 30000
      }
    )

    return response.data.items.map((video: any) => ({
      name: video.title,
      url: `${this.videoCdnEndpoint}/${video.guid}/playlist.m3u8`,
      poster: `${this.videoCdnEndpoint}/${video.guid}/thumbnail.jpg`
    }))
  }
}