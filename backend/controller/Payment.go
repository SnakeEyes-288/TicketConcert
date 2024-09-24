package controller

import (
	"net/http"
	"path/filepath"

	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
)

type CreatePaymentRequest struct {
	Payment entity.Payment  `json:"payment"`
	Tickets []entity.Ticket `json:"tickets"` // เพิ่ม field สำหรับตั๋ว
}

func CreatePayment(c *gin.Context) {
	var request CreatePaymentRequest

	// Bind ข้อมูล JSON ที่ถูกส่งมา
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่ามีการอัพโหลดไฟล์สลิปหรือไม่
	file, err := c.FormFile("slip")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload slip"})
		return
	}

	// ตั้งค่า path ที่จะบันทึกไฟล์สลิป
    filePath := filepath.Join("uploads", file.Filename)


	// สร้างข้อมูลการชำระเงิน
	payment := request.Payment
	payment.SlipURL = filePath // เก็บ path ของสลิปที่ถูกอัพโหลด

	// บันทึกข้อมูลการชำระเงิน
	db := config.DB()
	if err := db.Create(&payment).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกตั๋วที่เกี่ยวข้อง
	tickets := request.Tickets
	for _, ticket := range tickets {
		ticket.PaymentID = &payment.ID
		if err := db.Create(&ticket).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"data": payment})
}

func UploadPaymentSlip(c *gin.Context) {
	// รับไฟล์จากฟอร์ม
	file, err := c.FormFile("slip")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบไฟล์สลิปโอนเงิน"})
		return
	}

	// ตั้งค่า path ที่จะบันทึกไฟล์
	filePath := filepath.Join("uploads", file.Filename)

	// บันทึกไฟล์ไปยัง path ที่กำหนด
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}

	// ส่ง response กลับพร้อม path ของไฟล์ที่ถูกอัปโหลด
	c.JSON(http.StatusOK, gin.H{
		"message":  "อัปโหลดสลิปสำเร็จ",
		"filePath": "/uploads/" + file.Filename, // ส่งเส้นทางไฟล์ที่สามารถเข้าถึงได้
	})
}
