'use client'

import { useState } from 'react'
import { Card, CardBody, Button, Link, Image } from '@nextui-org/react'
import { CheckCircleIcon, XCircleIcon } from './icons'
import VideoProcessingStatus from './VideoProcessingStatus'
import VideoPlayer from './VideoPlayer'

interface UploadResultProps {
  result: {
    success: boolean
    cdnUrl?: string
    thumbnailUrl?: string
    type?: string
    originalName?: string
    error?: string
    jobId?: string
    status?: string
    message?: string
  }
  onReset: () => void
}

export default function UploadResult({ result, onReset }: UploadResultProps) {
  const [videoId, setVideoId] = useState<string | null>(null)

  const videoCdnUrl = videoId ? `${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST}/${videoId}/playlist.m3u8` : null
  const videoThumbnail = videoId ? `${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST}/${videoId}/thumbnail.jpg` : null

  if (!result) return null

  // Show video processing status for videos
  if (result.success && result.type === 'video' && result.jobId && !videoId) {
    return (
      <div className="space-y-4">
        <VideoProcessingStatus
          jobId={result.jobId}
          fileName={result.originalName || 'Video'}
          onComplete={(videoId) => {
            setTimeout(() => setVideoId(videoId), 1500)            
          }}
        />
        <div className="text-center">
          <Button color="default" variant="light" onPress={onReset}>
            Upload Another File
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className={result.success ? 'border-success' : 'border-danger'}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {result.success ? (
            <CheckCircleIcon className="w-6 h-6 text-success" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-danger" />
          )}
          <h3 className="text-xl font-semibold">
            {result.success ? 'Upload Successful!' : 'Upload Failed'}
          </h3>
        </div>

        {result.success && (result.cdnUrl || videoId) ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-default-500 mb-1">CDN URL:</p>
              <Link href={videoCdnUrl || result.cdnUrl} target="_blank" className="break-all">
                {videoCdnUrl || result.cdnUrl}
              </Link>
            </div>

            { 
              result.thumbnailUrl && <div>
                <p className="text-sm text-default-500 mb-1">CDN URL(thumb):</p>
                <Link href={result.thumbnailUrl} target="_blank" className="break-all">
                  {result.thumbnailUrl}
                </Link>
              </div> 
            }
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-default-500">Type:</p>
                <p className="capitalize">{result.type}</p>
              </div>
              <div>
                <p className="text-default-500">Original Name:</p>
                <p className="truncate">{result.originalName}</p>
              </div>
            </div>

            {result.type === 'image' ? (
              <Image
                src={result.cdnUrl}
                alt="Uploaded image"
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <VideoPlayer
                src={videoCdnUrl}
                poster={videoThumbnail}
                className="w-full h-80 rounded-lg"
              />
            )}
          </div>
        ) : (
          <p className="text-danger">{result.error}</p>
        )}

        <Button
          color="primary"
          variant="flat"
          className="mt-4"
          onPress={onReset}
        >
          Upload Another File
        </Button>
      </CardBody>
    </Card>
  )
}