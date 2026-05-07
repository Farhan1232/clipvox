# ClipVox

Free · Fast · Private media toolkit — Image to PDF, Video Compressor, Quality Changer, Add Music.

## Quick Start

### Requirements
- Node.js 18+
- Go 1.21+
- FFmpeg installed (`sudo apt install ffmpeg` or `brew install ffmpeg`)

### Run Frontend
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### Run Backend
```bash
cd backend
go mod tidy
go run main.go
# Runs on http://localhost:8080
```

## Features
- Image → PDF (browser-side, 100% private)
- Video Compressor (FFmpeg, no watermarks)
- Quality Changer (480p / 720p / 1080p / 4K)
- Add Music (mix, loop, fade, volume control)
