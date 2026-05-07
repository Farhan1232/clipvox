### Stage 1 — build Go binary ###
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

### Stage 2 — runtime with ffmpeg + libreoffice ###
FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libreoffice \
    fonts-liberation \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/server .
RUN mkdir -p tmp

ENV GIN_MODE=release
EXPOSE 10000

CMD ["./server"]
