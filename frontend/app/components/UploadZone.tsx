'use client'

import { useRef, useState } from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { CloudArrowUpIcon } from './icons'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  isUploading: boolean
}

export default function UploadZone({ onFileSelect, isUploading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      isDragOver ? 'border-primary bg-primary/10' : 'border-default-300'
    }`}>
      <CardBody
        className="p-12 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-default-400" />
        <p className="text-lg mb-4">
          Drag & drop your image or video here, or click to select
        </p>
        <Button 
          color="primary" 
          size="lg"
          isLoading={isUploading}
          disabled={isUploading}
          onPress={openFileDialog}
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardBody>
    </Card>
  )
}