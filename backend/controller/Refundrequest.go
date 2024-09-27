package controller

import (
	// "fmt"
	"net/http"

	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RefundRequest handles refund requests
func RefundRequest(c *gin.Context) {
	var r entity.Refundrequest
    var requestData struct {
        UserID   uint   `json:"user_id"`
        ConcertID uint  `json:"concert_id"`
    }

	r = entity.Refundrequest{
		Refund_amount:	r.Refund_amount,
    	Refund_Date:	r.Refund_Date,
		Refund_reason:	r.Refund_reason,
		Username:		r.Username,
    	Email:			r.Email,
		PhoneNumber:	r.PhoneNumber,
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
	
    // ส่งข้อความไปที่ entity SMS (สมมุติว่ามีฟังก์ชัน SendSMS)
    // entity.Sms(currentUser.PhoneNumber, "Your refund of amount " + fmt.Sprintf("%.2f", totalRefund) + " has been processed.")

    // c.JSON(http.StatusOK, gin.H{"message": "Refund processed", "amount": totalRefund})
}

// CheckTicketAcceptance checks if the ticket was accepted before purchase
func CheckTicketAcceptance(c *gin.Context) {
	// รับ ticketID จาก request
	ticketID := c.Param("ticketID")

	// ตรวจสอบว่ามีข้อมูลการยอมรับบัตรในฐานข้อมูลหรือไม่
	var acceptanceRecord entity.ConditionRefun
	err := config.DB().Where("ticket_id = ? AND accepted = true", ticketID).First(&acceptanceRecord).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// ถ้าไม่พบข้อมูลการยอมรับบัตร
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket was not accepted before purchase"})
			return
		}
		// ถ้ามีข้อผิดพลาดในการดึงข้อมูล
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check ticket acceptance"})
		return
	}

	// ถ้าพบข้อมูลการยอมรับ
	c.JSON(http.StatusOK, gin.H{"message": "Ticket was accepted before purchase"})
}
