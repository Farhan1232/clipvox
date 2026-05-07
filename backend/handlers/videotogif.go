package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

func VideoToGif(c *gin.Context) {
	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file provided"})
		return
	}

	// Parse and validate parameters
	startSec  := parseFloatSafe(c.DefaultPostForm("start", "0"), 0, 0, 3600)
	duration  := parseFloatSafe(c.DefaultPostForm("duration", "5"), 5, 1, 30)
	fps       := parseIntSafe(c.DefaultPostForm("fps", "12"), 12, 5, 24)
	width     := parseIntSafe(c.DefaultPostForm("width", "480"), 480, 120, 1080)
	loop      := c.DefaultPostForm("loop", "0") // 0 = infinite loop, -1 = no loop

	if loop != "0" && loop != "-1" {
		loop = "0"
	}

	id := newID()
	ext := filepath.Ext(file.Filename)
	if ext == "" { ext = ".mp4" }

	inputPath   := filepath.Join("tmp", id+"_in"+ext)
	palettePath := filepath.Join("tmp", id+"_palette.png")
	outputPath  := filepath.Join("tmp", id+"_out.gif")

	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save upload"})
		return
	}
	defer os.Remove(inputPath)
	defer os.Remove(palettePath)
	defer os.Remove(outputPath)

	// Base video filter
	vf := fmt.Sprintf("fps=%d,scale=%d:-1:flags=lanczos", fps, width)

	// Pass 1: generate optimised palette
	pass1 := exec.Command("ffmpeg",
		"-ss", fmt.Sprintf("%.2f", startSec),
		"-t",  fmt.Sprintf("%.2f", duration),
		"-i",  inputPath,
		"-vf", vf+",palettegen=max_colors=256:stats_mode=diff",
		"-y",  palettePath,
	)
	if out, err := pass1.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Palette generation failed", "detail": string(out)})
		return
	}

	// Pass 2: apply palette to generate GIF
	pass2 := exec.Command("ffmpeg",
		"-ss", fmt.Sprintf("%.2f", startSec),
		"-t",  fmt.Sprintf("%.2f", duration),
		"-i",  inputPath,
		"-i",  palettePath,
		"-lavfi", vf+"[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
		"-loop", loop,
		"-y",  outputPath,
	)
	if out, err := pass2.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GIF generation failed", "detail": string(out)})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge.gif")
	c.Header("Content-Type", "image/gif")
	c.File(outputPath)
}

func parseFloatSafe(s string, def, min, max float64) float64 {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil || v < min || v > max {
		return def
	}
	return v
}

func parseIntSafe(s string, def, min, max int) int {
	v, err := strconv.Atoi(s)
	if err != nil || v < min || v > max {
		return def
	}
	return v
}
