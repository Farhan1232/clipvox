package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func RemoveVideoWatermark(c *gin.Context) {
	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file provided"})
		return
	}

	x      := parseIntSafe(c.DefaultPostForm("x", "0"),   0,   0, 9999)
	y      := parseIntSafe(c.DefaultPostForm("y", "0"),   0,   0, 9999)
	w      := parseIntSafe(c.DefaultPostForm("w", "100"), 100, 1, 9999)
	h      := parseIntSafe(c.DefaultPostForm("h", "50"),  50,  1, 9999)
	method := c.DefaultPostForm("method", "blur")

	if method != "blur" && method != "delogo" {
		method = "blur"
	}

	id := newID()
	ext := filepath.Ext(file.Filename)
	if ext == "" { ext = ".mp4" }

	inputPath  := filepath.Join("tmp", id+"_in"+ext)
	outputPath := filepath.Join("tmp", id+"_nowm.mp4")

	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save upload"})
		return
	}
	defer os.Remove(inputPath)
	defer os.Remove(outputPath)

	var args []string

	switch method {
	case "delogo":
		// FFmpeg delogo filter — blends watermark area with surrounding edges
		args = []string{
			"-i", inputPath,
			"-vf", fmt.Sprintf("delogo=x=%d:y=%d:w=%d:h=%d:show=0", x, y, w, h),
			"-c:a", "copy",
			"-movflags", "+faststart",
			"-y", outputPath,
		}
	default:
		// Blur approach: crop the watermark region, apply heavy blur, overlay back
		blurFilter := fmt.Sprintf(
			"[0:v]crop=%d:%d:%d:%d,boxblur=30:5[blurred];[0:v][blurred]overlay=%d:%d[v]",
			w, h, x, y, x, y,
		)
		args = []string{
			"-i", inputPath,
			"-filter_complex", blurFilter,
			"-map", "[v]",
			"-map", "0:a?",
			"-c:a", "copy",
			"-movflags", "+faststart",
			"-y", outputPath,
		}
	}

	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "FFmpeg watermark removal failed",
			"detail": string(out),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge-clean-video.mp4")
	c.Header("Content-Type", "video/mp4")
	c.File(outputPath)
}
