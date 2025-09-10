import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'

export default class BunnyStorageClient {
  private storageZone: string
  private apiKey: string
  private hostname: string
  private storageEndpoint: string

  constructor() {
    this.storageZone = process.env.BUNNY_STORAGE_ZONE!
    this.apiKey = process.env.BUNNY_STORAGE_API_KEY!
    this.hostname = process.env.BUNNY_CDN_HOSTNAME!
    this.storageEndpoint = process.env.BUNNY_STORAGE_HOST || 'https://sg.storage.bunnycdn.com'

    if (!this.storageZone || !this.apiKey || !this.hostname) {
      throw new Error('Missing Bunny Storage configuration')
    }
  }

  async upload(filePath: string, fileName: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath)
    const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9.-]/g, '_')

    const response = await axios.put(
      `${this.storageEndpoint}/${this.storageZone}/${sanitizedFileName}`,
      fileBuffer,
      {
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000
      }
    )

    if (response.status === 201) {
      return `https://${this.hostname}/${sanitizedFileName}`
    }
    throw new Error('Failed to upload to Bunny Storage')
  }

  async listFiles(): Promise<any[]> {
    const response = await axios.get(
      `${this.storageEndpoint}/${this.storageZone}/`,
      {
        headers: {
          'AccessKey': this.apiKey
        },
        timeout: 30000
      }
    )

    const fileNames = response.data.map((f: any) => f.ObjectName)
    
    return response.data
      .filter((file: any) => file.ObjectName.includes('.webp') && !file.ObjectName.includes('-thumb.webp'))
      .map((file: any) => ({
        name: file.ObjectName,
        url: `https://${this.hostname}/${file.ObjectName}`,
        thumbnailUrl: fileNames.includes(file.ObjectName.replace('.webp', '-thumb.webp')) 
          ? `https://${this.hostname}/${file.ObjectName.replace('.webp', '-thumb.webp')}` 
          : null
      }))
  }
}