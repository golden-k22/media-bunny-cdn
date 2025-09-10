# Bunny Upload Frontend

Modern Next.js frontend with NextUI dark theme for the media upload application.

## Features

- **Next.js 14** with App Router
- **NextUI** components with dark theme
- **TypeScript** for type safety
- **Modular architecture** with custom hooks and components
- **Responsive design** with Tailwind CSS
- **API proxy** to Express backend

## Components

- `UploadZone` - Drag & drop file upload area
- `UploadResult` - Display upload results with preview
- `useUpload` - Custom hook for upload logic

## Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000 and proxies API calls to the Express backend on port 3333.

## Architecture

- **Modular components** - Each UI component is separate and reusable
- **Custom hooks** - Business logic separated from UI components  
- **TypeScript interfaces** - Type-safe data handling
- **Dark theme** - NextUI default dark theme
- **Responsive** - Mobile-friendly design