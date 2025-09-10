import path from 'path'

const ALLOWED_MIMES = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'video/mp4', 
  'video/avi', 
  'video/quicktime', 
  'video/x-ms-wmv', 
  'video/x-flv', 
  'video/webm'
]

const ALLOWED_EXTS = [
  '.jpg', 
  '.jpeg', 
  '.png', 
  '.gif', 
  '.webp', 
  '.mp4', 
  '.avi', 
  '.mov', 
  '.wmv', 
  '.flv', 
  '.webm'
]

interface FileObject {
  originalname: string
  mimetype: string
}

export const validateFileAfterUpload = (file: FileObject): boolean => {
  if (!file || !file.originalname) {
    throw new Error('Invalid file')
  }
  
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_MIMES.includes(file.mimetype) || !ALLOWED_EXTS.includes(ext)) {
    throw new Error('Invalid file type')
  }
  
  return true
}

export const sanitizeFilename = (filename: string): string => {
  return path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_')
}