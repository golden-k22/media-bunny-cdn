'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, Image, Tabs, Tab } from '@nextui-org/react'
import VideoPlayer from '../components/VideoPlayer'

interface MediaItem {
  url: string
  thumbnailUrl?: string
  name: string
  type: 'image' | 'video',
  poster?: string
}

export default function PreviewPage() {
  const [images, setImages] = useState<MediaItem[]>([])
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await axios.get('/api/media')
      const mediaItems = response.data.items || {}

      setImages(mediaItems.images || [])
      setVideos(mediaItems.videos || [])
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8 p-4">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center w-full">
              Media Gallery
            </h1>
          </CardHeader>
          <CardBody>
            <Tabs aria-label="Media categories">
              <Tab key="images" title={`Images (${images.length})`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {images.map((item, index) => (
                    <Card key={index} className="p-2">
                      <CardBody>
                        <Image
                          src={item.thumbnailUrl || item.url}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(item.url)}
                        />
                        <p className="text-sm text-center mt-2 truncate">{item.name}</p>
                      </CardBody>
                    </Card>
                  ))}
                  {images.length === 0 && !loading && (
                    <p className="text-center text-default-500 col-span-full">No images uploaded yet</p>
                  )}
                </div>
              </Tab>
              
              <Tab key="videos" title={`Videos (${videos.length})`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {videos.map((item, index) => (
                    <Card key={index} className="p-2">
                      <CardBody>
                        <VideoPlayer
                          src={item.url}
                          poster={item.poster}
                          className="w-full h-60 rounded-lg"
                        />
                        <p className="text-sm text-center mt-2 truncate">{item.name}</p>
                      </CardBody>
                    </Card>
                  ))}
                  {videos.length === 0 && !loading && (
                    <p className="text-center text-default-500 col-span-full">No videos uploaded yet</p>
                  )}
                </div>
              </Tab>
            </Tabs>
            
            {loading && (
              <p className="text-center text-default-500 mt-8">Loading media...</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Image Popup Dialog */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <Image
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  )
}