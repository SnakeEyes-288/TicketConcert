package controller

import (
	"net/http"

	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/gin-gonic/gin"
)

// RefundRequest handles refund requests
func RefundRequest(c *gin.Context) {
    var requestData struct {
        UserID   uint   `json:"user_id"`
        ConcertID uint   `json:"concert_id"`
    }

    // Bind JSON to requestData
    if err := c.ShouldBindJSON(&requestData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // เช็คว่าผู้ใช้ที่กำลังล็อกอินอยู่ตรงกับข้อมูลที่กรอกหรือไม่
    currentUser := c.MustGet("user").(entity.Member) // สมมติว่ามีการจัดเก็บข้อมูลผู้ใช้ใน context
    if currentUser.ID != requestData.UserID {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not match"})
        return
    }

    // ดึงข้อมูล historypayment เพื่อเช็คจำนวนเงินที่ผู้ใช้นี้จ่ายไป
    var Payment []entity.Payment
    if err := config.DB().Where("user_id = ? AND concert_id = ?", requestData.UserID, requestData.ConcertID).Find(&Payment).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment history not found"})
        return
    }

    // ทำการคืนเงิน (สมมุติว่ามีฟังก์ชัน RefundPayment)
    totalRefund := 0.0
    for _, payment := range Payment {
        totalRefund += payment.Amount
    }
	
    /*// ส่งข้อความไปที่ entity SMS (สมมุติว่ามีฟังก์ชัน SendSMS)
    entity.Sms(currentUser.Phone, "Your refund of amount " + fmt.Sprintf("%.2f", totalRefund) + " has been processed.")

    c.JSON(http.StatusOK, gin.H{"message": "Refund processed", "amount": totalRefund})*/
}
