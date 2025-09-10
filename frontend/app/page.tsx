'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody } from '@nextui-org/react'
import axios from 'axios'
import UploadZone from './components/UploadZone'
import UploadResult from './components/UploadResult'
import { useUpload } from './hooks/useUpload'

export default function Home() {

  const { uploadFile, isUploading, result, reset } = useUpload()



  const handleFileSelect = (file: File) => {
    uploadFile(file)
  }

  return (
    <main className="bg-background pt-8">
      <div className="container mx-auto px-4 my-8 max-w-4xl">
        <Card className="mb-8 p-4">
          <CardHeader className="pb-4">
            <h1 className="text-3xl font-bold text-center w-full">
              Media Upload & Optimization
            </h1>
          </CardHeader>
          <CardBody>
            <p className="text-center text-default-500 mb-6">
              Upload images and videos to be optimized and stored on Bunny.net CDN
            </p>
            
            {!result ? (
              <UploadZone 
                onFileSelect={handleFileSelect} 
                isUploading={isUploading} 
              />
            ) : (
              <UploadResult 
                result={result} 
                onReset={reset} 
              />
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  )
}