package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func AddMusic(c *gin.Context) {
	videoFile, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file provided"})
		return
	}
	audioFile, err := c.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No audio file provided"})
		return
	}

	mode := c.DefaultPostForm("mode", "overlay")      // overlay | replace | mute_orig
	videoVol := c.DefaultPostForm("video_volume", "1.0")
	musicVol := c.DefaultPostForm("music_volume", "0.8")
	fadeIn := c.DefaultPostForm("fade_in", "0")
	fadeOut := c.DefaultPostForm("fade_out", "2")
	loopMode := c.DefaultPostForm("loop_mode", "loop")
	startOffset := c.DefaultPostForm("start_offset", "0")

	// Validate float values
	vv, _ := strconv.ParseFloat(videoVol, 64)
	mv, _ := strconv.ParseFloat(musicVol, 64)
	if vv < 0 || vv > 3 { vv = 1.0 }
	if mv < 0 || mv > 3 { mv = 0.8 }

	fi, _ := strconv.ParseFloat(fadeIn, 64)
	fo, _ := strconv.ParseFloat(fadeOut, 64)
	if fi < 0 || fi > 30 { fi = 0 }
	if fo < 0 || fo > 30 { fo = 2 }

	so, _ := strconv.ParseFloat(startOffset, 64)
	if so < 0 { so = 0 }

	id := newID()
	videoExt := filepath.Ext(videoFile.Filename)
	if videoExt == "" { videoExt = ".mp4" }
	audioExt := filepath.Ext(audioFile.Filename)
	if audioExt == "" { audioExt = ".mp3" }

	videoPath  := filepath.Join("tmp", id+"_vid"+videoExt)
	audioPath  := filepath.Join("tmp", id+"_aud"+audioExt)
	outputPath := filepath.Join("tmp", id+"_music.mp4")

	if err := c.SaveUploadedFile(videoFile, videoPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save video"})
		return
	}
	if err := c.SaveUploadedFile(audioFile, audioPath); err != nil {
		os.Remove(videoPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save audio"})
		return
	}
	defer os.Remove(videoPath)
	defer os.Remove(audioPath)
	defer os.Remove(outputPath)

	var args []string

	switch mode {
	case "replace":
		// Replace original audio entirely with music
		args = buildReplaceArgs(videoPath, audioPath, mv, fi, fo, so, loopMode, outputPath)
	case "mute_orig":
		// Keep video, mute original, add music
		args = buildMuteOrigArgs(videoPath, audioPath, mv, fi, fo, so, loopMode, outputPath)
	default:
		// Overlay: mix both audio tracks
		args = buildOverlayArgs(videoPath, audioPath, vv, mv, fi, fo, so, loopMode, outputPath)
	}

	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "FFmpeg audio mixing failed",
			"detail": string(out),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge-with-music.mp4")
	c.Header("Content-Type", "video/mp4")
	c.File(outputPath)
}

func buildOverlayArgs(video, audio string, vv, mv, fi, fo, so float64, loop, out string) []string {
	audioInput := buildAudioInput(audio, so, loop)
	musicFilter := buildMusicFilter(mv, fi, fo)
	videoFilter := fmt.Sprintf("volume=%.2f", vv)

	args := []string{"-i", video}
	args = append(args, audioInput...)
	args = append(args,
		"-filter_complex",
		fmt.Sprintf("[0:a]%s[va];[1:a]%s[ma];[va][ma]amix=inputs=2:duration=first:dropout_transition=2[aout]", videoFilter, musicFilter),
		"-map", "0:v",
		"-map", "[aout]",
		"-c:v", "copy",
		"-c:a", "aac",
		"-b:a", "192k",
		"-movflags", "+faststart",
		"-y", out,
	)
	return args
}

func buildReplaceArgs(video, audio string, mv, fi, fo, so float64, loop, out string) []string {
	audioInput := buildAudioInput(audio, so, loop)
	musicFilter := buildMusicFilter(mv, fi, fo)

	args := []string{"-i", video}
	args = append(args, audioInput...)
	args = append(args,
		"-filter_complex",
		fmt.Sprintf("[1:a]%s[aout]", musicFilter),
		"-map", "0:v",
		"-map", "[aout]",
		"-c:v", "copy",
		"-c:a", "aac",
		"-b:a", "192k",
		"-movflags", "+faststart",
		"-y", out,
	)
	return args
}

func buildMuteOrigArgs(video, audio string, mv, fi, fo, so float64, loop, out string) []string {
	audioInput := buildAudioInput(audio, so, loop)
	musicFilter := buildMusicFilter(mv, fi, fo)

	args := []string{"-i", video}
	args = append(args, audioInput...)
	args = append(args,
		"-filter_complex",
		fmt.Sprintf("[1:a]%s[aout]", musicFilter),
		"-map", "0:v",
		"-map", "[aout]",
		"-c:v", "copy",
		"-c:a", "aac",
		"-b:a", "192k",
		"-movflags", "+faststart",
		"-y", out,
	)
	return args
}

func buildAudioInput(audio string, so float64, loop string) []string {
	args := []string{}
	if so > 0 {
		args = append(args, "-ss", fmt.Sprintf("%.2f", so))
	}
	if loop == "loop" {
		args = append(args, "-stream_loop", "-1")
	}
	args = append(args, "-i", audio)
	return args
}

func buildMusicFilter(mv, fi, fo float64) string {
	filters := []string{fmt.Sprintf("volume=%.2f", mv)}
	if fi > 0 {
		filters = append(filters, fmt.Sprintf("afade=t=in:st=0:d=%.1f", fi))
	}
	if fo > 0 {
		filters = append(filters, fmt.Sprintf("afade=t=out:st=999:d=%.1f", fo))
	}
	return strings.Join(filters, ",")
}
