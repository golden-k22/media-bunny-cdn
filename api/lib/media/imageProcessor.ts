import sharp from 'sharp'
import path from 'path'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'

interface ProcessImageResult {
  fullPath: string
  thumbPath: string
}

export const processImage = async (inputPath: string, fileSize: number): Promise<ProcessImageResult> => {
  const uuid = uuidv4()
  const fullPath = path.join('tmp', `optimized-${uuid}.webp`)
  const thumbPath = path.join('tmp', `optimized-${uuid}-thumb.webp`)
  
  try {
    const fileSizeMB = fileSize / (1024 * 1024)
    // Adjust quality based on file size
    let quality = 80
    if (fileSizeMB > 10) quality = 60
    else if (fileSizeMB > 5) quality = 70
    
    // Generate full size image
    await sharp(inputPath)
      .webp({ quality: quality })
      .toFile(fullPath)
    
    // Generate thumbnail
    await sharp(inputPath)
      .resize(640, 360, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: quality })
      .toFile(thumbPath)
    
    return { fullPath, thumbPath }
  } catch (error) {
    await fs.remove(fullPath).catch(() => {})
    await fs.remove(thumbPath).catch(() => {})
    throw error
  }
}