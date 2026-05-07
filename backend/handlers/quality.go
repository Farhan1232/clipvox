package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

var allowedCodecs = map[string]bool{
	"libx264":    true,
	"libx265":    true,
	"libvpx-vp9": true,
}

var allowedFPS = map[string]bool{
	"24": true, "25": true, "30": true,
	"48": true, "60": true, "120": true,
}

var resolutionMap = map[string]string{
	"360":  "640:360",
	"480":  "854:480",
	"720":  "1280:720",
	"1080": "1920:1080",
	"1440": "2560:1440",
	"2160": "3840:2160",
}

func ChangeQuality(c *gin.Context) {
	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file provided"})
		return
	}

	resolution := c.DefaultPostForm("resolution", "1080")
	codec := c.DefaultPostForm("codec", "libx264")
	fps := c.DefaultPostForm("fps", "30")
	bitrate := c.PostForm("bitrate")

	// Validate inputs
	scaleFilter, ok := resolutionMap[resolution]
	if !ok {
		scaleFilter = resolutionMap["1080"]
	}
	if !allowedCodecs[codec] {
		codec = "libx264"
	}
	if !allowedFPS[fps] {
		fps = "30"
	}
	// Validate bitrate format (e.g. "2M", "500k")
	if bitrate != "" {
		bitrate = strings.TrimSpace(bitrate)
		valid := false
		for _, suffix := range []string{"k", "K", "m", "M"} {
			if strings.HasSuffix(bitrate, suffix) {
				var n int
				if _, e := fmt.Sscanf(bitrate[:len(bitrate)-1], "%d", &n); e == nil && n > 0 {
					valid = true
					break
				}
			}
		}
		if !valid {
			bitrate = ""
		}
	}

	id := newID()
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".mp4"
	}
	inputPath  := filepath.Join("tmp", id+"_in"+ext)
	outputPath := filepath.Join("tmp", id+"_quality.mp4")

	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save upload"})
		return
	}
	defer os.Remove(inputPath)
	defer os.Remove(outputPath)

	args := []string{
		"-i", inputPath,
		"-vf", fmt.Sprintf("scale=%s:force_original_aspect_ratio=decrease,pad=%s:(ow-iw)/2:(oh-ih)/2", scaleFilter, scaleFilter),
		"-c:v", codec,
		"-r", fps,
		"-c:a", "aac",
		"-b:a", "128k",
		"-movflags", "+faststart",
		"-y",
	}
	if bitrate != "" {
		args = append(args, "-b:v", bitrate)
	}
	args = append(args, outputPath)

	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "FFmpeg quality change failed",
			"detail": string(out),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge-quality.mp4")
	c.Header("Content-Type", "video/mp4")
	c.File(outputPath)
}
