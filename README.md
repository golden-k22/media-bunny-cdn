# Bunny Media Upload App

A full-stack media upload and optimization platform with AdonisJS API and Next.js frontend, integrated with Bunny.net CDN.

## Features

### 🖼️ Image Optimization
- **Format Conversion**: Automatically converts images to WebP format
- **Quality Optimization**: Dynamic quality adjustment based on file size
- **Thumbnail Generation**: Creates 640x360 thumbnails for all images
- **Size Reduction**: Reduces file sizes by 60-80% while maintaining quality

### 🎥 Video Processing
- **Background Processing**: Videos process asynchronously with real-time status updates
- **Format Optimization**: Converts videos to MP4 with H.264/AAC codecs
- **Bitrate Adjustment**: Dynamic bitrate based on original file size
- **Progress Tracking**: Real-time processing status (queued → processing → uploading → completed)

### 🚀 CDN Integration
- **Bunny Storage**: Optimized images stored on Bunny.net CDN
- **Bunny Stream**: Videos uploaded to Bunny Stream for adaptive streaming
- **Global Delivery**: Fast content delivery worldwide

## Tech Stack

- **Backend**: AdonisJS v6 (TypeScript)
- **Frontend**: Next.js 14 (TypeScript)
- **UI**: NextUI + Tailwind CSS
- **Image Processing**: Sharp
- **Video Processing**: FFmpeg
- **CDN**: Bunny.net (Storage + Stream)

## Installation

### Prerequisites
- Node.js 18+
- FFmpeg installed and accessible in PATH

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd bunny-app

# Install dependencies for both projects
npm install
npm run install

# Configure environment (see Configuration section)
# Copy .env.example to .env in both api/ and frontend/ folders

# Start both servers
npm start
```

### Manual Installation
```bash
# Install API dependencies
cd api
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

## Configuration

### API Environment (.env in api/ folder)
```env
# Server Configuration
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=your-32-character-random-string
LOG_LEVEL=info
SESSION_DRIVER=cookie

# FFmpeg Configuration
FFMPEG_PATH=ffmpeg

# Bunny.net Configuration
BUNNY_STORAGE_API_KEY=your-storage-api-key
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_STREAM_API_KEY=your-stream-api-key
BUNNY_STREAM_LIBRARY_ID=your-stream-library-id
BUNNY_CDN_HOSTNAME=your-cdn-hostname.b-cdn.net

# Optional: Custom Endpoints
BUNNY_STORAGE_HOST=https://sg.storage.bunnycdn.com
BUNNY_STREAM_API_HOST=https://video.bunnycdn.com
BUNNY_STREAM_CDN_HOST=https://vz-xxxxxxxx-xxx.b-cdn.net
```

### Frontend Environment (.env in frontend/ folder)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Bunny.net Setup
1. Create account at [bunny.net](https://bunny.net)
2. Create Storage Zone for images
3. Create Stream Library for videos
4. Get API keys from dashboard
5. Configure pull zone for CDN delivery

## Running Locally

### Development Mode
```bash
# Start both API and Frontend
npm start

# Or start individually
npm run api      # API only (http://localhost:3333)
npm run frontend # Frontend only (http://localhost:3000)
```

### Production Mode
```bash
# Build frontend
cd frontend && npm run build

# Start API in production
cd api && npm run start

# Serve frontend (use PM2 or similar)
cd frontend && npm run start
```

## API Documentation

### Endpoints

#### Upload Media
```http
POST /upload
Content-Type: multipart/form-data

Body:
- media: File (image or video)

Response:
{
  "success": true,
  "type": "image|video",
  "originalName": "filename.jpg",
  "cdnUrl": "https://cdn.example.com/optimized-uuid.webp",
  "thumbnailUrl": "https://cdn.example.com/optimized-uuid-thumb.webp",
  // For videos:
  "jobId": "uuid",
  "status": "processing",
  "message": "Video uploaded successfully, processing in background..."
}
```

#### Get Media List
```http
GET /media

Response:
{
  "items": {
    "images": [
      {
        "url": "https://cdn.example.com/image.webp",
        "thumbnailUrl": "https://cdn.example.com/image-thumb.webp",
        "name": "image.webp",
        "type": "image"
      }
    ],
    "videos": [
      {
        "url": "https://stream.example.com/video-id/playlist.m3u8",
        "name": "video.mp4",
        "poster": "https://stream.example.com/video-id/thumbnail.jpg",
        "type": "video"
      }
    ]
  }
}
```

#### Check Video Processing Status
```http
GET /job/:jobId

Response:
{
  "status": "completed|processing|uploading|failed|queued",
  "message": "Processing status message",
  "videoId": "bunny-stream-video-id",
  "fileName": "original-filename.mp4",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### File Support

#### Images
- **Formats**: JPEG, PNG, GIF, WebP
- **Max Size**: 500MB
- **Output**: WebP format with optimized quality

#### Videos
- **Formats**: MP4, AVI, MOV, WMV, FLV, WebM
- **Max Size**: 500MB
- **Output**: MP4 (H.264/AAC) optimized for streaming

## Architecture

### Image Processing Flow
1. Upload → Validation → Sharp Processing → WebP Conversion → Thumbnail Generation → Bunny Storage → CDN URL

### Video Processing Flow
1. Upload → Validation → Background Job Creation → FFmpeg Processing → Format Conversion → Bunny Stream Upload → Status Updates

### Background Jobs
- Videos process asynchronously to prevent timeouts
- Real-time status updates via polling
- Automatic cleanup of temporary files
- Error handling and retry logic

## Development

### Project Structure
```
bunny-app/
├── api/                 # AdonisJS Backend
│   ├── app/controllers/ # HTTP Controllers
│   ├── lib/            # Business Logic
│   │   ├── bunny/      # Bunny.net Clients
│   │   ├── jobs/       # Background Jobs
│   │   ├── media/      # Processing Logic
│   │   └── upload/     # File Validation
│   └── start/routes.ts # API Routes
├── frontend/           # Next.js Frontend
│   └── app/           # App Router
└── package.json       # Root Scripts
```

### Adding New Features
1. **New Media Type**: Add to file validator and create processor
2. **New CDN**: Implement client interface in `lib/bunny/`
3. **New Processing**: Add to `lib/media/` with background job support

## Troubleshooting

### Common Issues
- **FFmpeg not found**: Install FFmpeg and add to PATH
- **Upload fails**: Check Bunny.net API keys and permissions
- **Video processing stuck**: Check FFmpeg installation and file format support
- **CORS errors**: Configure frontend API URL correctly

### Logs
- API logs: Check console output or configure log files
- Processing errors: Background job errors logged to console
- Upload errors: Returned in API response

## License

MIT License - see LICENSE file for details