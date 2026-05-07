package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func Compress(c *gin.Context) {
	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file provided"})
		return
	}

	crf := c.DefaultPostForm("crf", "23")
	preset := c.DefaultPostForm("preset", "medium")

	// Validate crf is numeric and in range
	var crfInt int
	if _, err := fmt.Sscanf(crf, "%d", &crfInt); err != nil || crfInt < 10 || crfInt > 51 {
		crf = "23"
	}

	id := newID()
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".mp4"
	}
	inputPath  := filepath.Join("tmp", id+"_in"+ext)
	outputPath := filepath.Join("tmp", id+"_out.mp4")

	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save upload"})
		return
	}
	defer os.Remove(inputPath)
	defer os.Remove(outputPath)

	cmd := exec.Command("ffmpeg",
		"-i", inputPath,
		"-c:v", "libx264",
		"-crf", crf,
		"-preset", preset,
		"-c:a", "aac",
		"-b:a", "128k",
		"-movflags", "+faststart",
		"-y",
		outputPath,
	)

	if out, err := cmd.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "FFmpeg compression failed",
			"detail": string(out),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge-compressed.mp4")
	c.Header("Content-Type", "video/mp4")
	c.File(outputPath)
}
