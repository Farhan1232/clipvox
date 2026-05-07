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

func PdfToWord(c *gin.Context) {
	file, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No PDF file provided"})
		return
	}

	id := newID()
	inputPath := filepath.Join("tmp", id+"_in.pdf")
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save upload"})
		return
	}
	defer os.Remove(inputPath)

	// Must use --infilter and explicit export filter — LibreOffice cannot guess PDF→DOCX
	out, err := exec.Command("libreoffice",
		"--headless",
		"--infilter=writer_pdf_import",
		"--convert-to", "docx:MS Word 2007 XML",
		"--outdir", "tmp",
		inputPath,
	).CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "LibreOffice conversion failed",
			"detail": string(out),
		})
		return
	}

	base       := strings.TrimSuffix(filepath.Base(inputPath), ".pdf")
	outputPath := filepath.Join("tmp", base+".docx")
	defer os.Remove(outputPath)

	if _, err := os.Stat(outputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Conversion produced no output",
			"detail": fmt.Sprintf("LibreOffice output: %s", string(out)),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge-converted.docx")
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	c.File(outputPath)
}

func WordToPdf(c *gin.Context) {
	file, err := c.FormFile("word")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No Word file provided"})
		return
	}

	id := newID()
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".docx"
	}

	inputPath := filepath.Join("tmp", id+"_in"+ext)
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save upload"})
		return
	}
	defer os.Remove(inputPath)

	out, err := exec.Command("libreoffice",
		"--headless",
		"--convert-to", "pdf",
		"--outdir", "tmp",
		inputPath,
	).CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "LibreOffice conversion failed",
			"detail": string(out),
		})
		return
	}

	base       := strings.TrimSuffix(filepath.Base(inputPath), ext)
	outputPath := filepath.Join("tmp", base+".pdf")
	defer os.Remove(outputPath)

	if _, err := os.Stat(outputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Conversion produced no output",
			"detail": fmt.Sprintf("LibreOffice output: %s", string(out)),
		})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=mediaforge-converted.pdf")
	c.Header("Content-Type", "application/pdf")
	c.File(outputPath)
}
