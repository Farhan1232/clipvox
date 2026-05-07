package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"clipvox/handlers"
)

func main() {
	// Create temp directory for processing
	if err := os.MkdirAll("tmp", 0755); err != nil {
		log.Fatal("Failed to create tmp dir:", err)
	}

	// Auto-clean tmp files older than 5 minutes
	go cleanupLoop()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Limit upload size to 2GB
	r.MaxMultipartMemory = 2 << 30

	// Routes
	api := r.Group("/api")
	{
		api.POST("/compress",               handlers.Compress)
		api.POST("/quality",                handlers.ChangeQuality)
		api.POST("/addmusic",               handlers.AddMusic)
		api.POST("/gif",                    handlers.VideoToGif)
		api.POST("/pdf-to-word",            handlers.PdfToWord)
		api.POST("/word-to-pdf",            handlers.WordToPdf)
		api.POST("/remove-video-watermark", handlers.RemoveVideoWatermark)
		api.GET("/health",                  func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("ClipVox backend running on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed:", err)
	}
}

func cleanupLoop() {
	ticker := time.NewTicker(2 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		entries, err := os.ReadDir("tmp")
		if err != nil {
			continue
		}
		cutoff := time.Now().Add(-5 * time.Minute)
		for _, e := range entries {
			info, err := e.Info()
			if err != nil {
				continue
			}
			if info.ModTime().Before(cutoff) {
				path := "tmp/" + e.Name()
				os.Remove(path)
				log.Printf("Cleaned up: %s", path)
			}
		}
	}
}
