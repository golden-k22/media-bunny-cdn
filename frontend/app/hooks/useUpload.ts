import { useState } from 'react'
import axios from 'axios'

interface UploadResult {
  success: boolean
  cdnUrl?: string
  type?: string
  originalName?: string
  error?: string
}

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('media', file)

      
      const response = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutes
      })

      setResult(response.data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Upload failed'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setResult(null)
  }

  return { uploadFile, isUploading, result, reset }
}