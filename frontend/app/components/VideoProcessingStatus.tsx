'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody, Progress } from '@nextui-org/react'
import axios from 'axios'

interface VideoProcessingStatusProps {
  jobId: string
  fileName: string
  onComplete: (cdnUrl: string) => void
}

export default function VideoProcessingStatus({ jobId, fileName, onComplete }: VideoProcessingStatusProps) {
  const [status, setStatus] = useState('queued')
  const [message, setMessage] = useState('Processing...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`/api/job/${jobId}`)
        const jobStatus = response.data
        
        setStatus(jobStatus.status)
        setMessage(jobStatus.message)
        
        // Set progress based on status
        switch (jobStatus.status) {
          case 'queued':
            setProgress(10)
            break
          case 'processing':
            setProgress(50)
            break
          case 'uploading':
            setProgress(80)
            break
          case 'completed':
            setProgress(100)
            if (jobStatus.videoId && onComplete) {
              onComplete(jobStatus.videoId)
            }
            return // Stop polling
          case 'failed':
            setProgress(0)
            return // Stop polling
        }
        
        // Continue polling if not completed or failed
        if (jobStatus.status !== 'completed' && jobStatus.status !== 'failed') {
          setTimeout(checkStatus, 4000) // Poll every 4 seconds
        }
      } catch (error) {
        console.error('Failed to check job status:', error)
        setStatus('failed')
        setMessage('Failed to check processing status')
      }
    }

    checkStatus()
  }, [jobId, onComplete])

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'danger'
      case 'processing':
      case 'uploading':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">{fileName}</h4>
            <span className={`text-sm px-2 py-1 rounded-full ${
              status === 'completed' ? 'bg-green-100 text-green-800' :
              status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <Progress 
            value={progress} 
            color={getStatusColor()}
            className="w-full"
          />
          
          <p className="text-sm text-gray-600">{message}</p>
          
          {status === 'failed' && (
            <p className="text-sm text-red-600">
              Video processing failed. Please try uploading again.
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}