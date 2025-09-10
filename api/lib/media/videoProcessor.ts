import path from 'path'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'

// Set ffmpeg path dynamically
const ffmpegPath = process.env.FFMPEG_PATH
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

export const processVideo = async (inputPath: string, audioBitrate?: number): Promise<string> => {
  const outputPath = path.join('tmp', `optimized-${uuidv4()}.mp4`)
    const optAudioBitrate = Math.min(Math.floor(audioBitrate? audioBitrate/2 : 64), 64) || 64 // kbps, max 64kbps
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset fast',     // better compression
          '-crf 30',              // quality target (23 is default, 30 smaller size)
          '-ar 44100',            // audio sample rate
          '-ac 2'                 // stereo
        ])
        // .videoBitrate(videoBitrate)
        .audioBitrate(optAudioBitrate)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', async (error: any) => {
          await fs.remove(outputPath).catch(() => {})
          reject(error)
        })
        .run()
    })
}