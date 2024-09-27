package controller

import (
	"fmt"
	"net/http"

	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
)

// POST /sms
func CreateSms(c *gin.Context) {
	var sms entity.Sms

	if err := c.ShouldBindJSON(&sms); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	if err := db.Create(&sms).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": sms})
}

// GET /sms/:id
func GetSms(c *gin.Context) {
	var sms entity.Sms
	id := c.Param("id")

	db := config.DB()
	if err := db.First(&sms, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sms not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sms})
}

// GET /sms
func ListSms(c *gin.Context) {
	var smss []entity.Sms

	db := config.DB()
	if err := db.Find(&smss).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve sms"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": smss})
}

// DELETE /sms/:id
func DeleteSms(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	if tx := db.Delete(&entity.Sms{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sms not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sms deleted successfully"})
}

//func SendTicketEmail(member entity.Member, ticket entity.Ticket) error {
    //m := gomail.NewMessage()
    //m.SetHeader("From", "your-email@example.com")
    //m.SetHeader("To", member.Email)
    //m.SetHeader("Subject", "Your Concert Ticket")
    //m.SetBody("text/html", fmt.Sprintf("You have successfully purchased a ticket for the concert. Ticket details: Seat %s, Concert: %s", ticket.Seat.SeatNumber, ticket.Concert.Name))

    //d := gomail.NewDialer("smtp.example.com", 587, "your-email@example.com", "your-password")

    //if err := d.DialAndSend(m); err != nil {
    //    return err
    //}
    //return nil
//}

func SendEmail(c *gin.Context) {
    token := c.GetHeader("Authorization")
    if token == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Token is missing"})
        return
    }

    var data struct {
        To          string   `json:"to"`
        Subject     string   `json:"subject"`
        Body        string   `json:"body"`
        MemberID    int      `json:"memberID"`
        ConcertName string   `json:"concertName"`
        QRCode      string   `json:"qrCode"` // ต้องเป็น Base64
        Seats       []string `json:"seats"`
        Amount      int      `json:"amount"`
    }

    if err := c.ShouldBindJSON(&data); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if data.To == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Recipient email is required"})
        return
    }

    from := "wichitchai63@gmail.com"
    password := "ofcaklsvdrucvjjk"

    smtpHost := "smtp.gmail.com"
    smtpPort := 465

    // สร้าง message โดยใช้ gomail
    m := gomail.NewMessage()
    m.SetHeader("From", from)
    m.SetHeader("To", data.To)
    m.SetHeader("Subject", data.Subject)

    // ตรวจสอบว่า QRCode ถูกส่งมาเป็น Base64 แล้วหรือยัง
    if data.QRCode == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "QR Code is missing"})
        return
    }

    // สร้างเนื้อหาของอีเมลที่แสดงรูป QR Code
    body := fmt.Sprintf(`
        <h1>Ticket Confirmation</h1>
        <p>Concert: %s</p>
        <p>Seats: %v</p>
        <p>Amount: %d</p>
        <p><img src="data:image/png;base64,%s" alt="QR Code" /></p>
        <p>Member ID: %d</p>
    `, data.ConcertName, data.Seats, data.Amount, data.QRCode, data.MemberID)

    m.SetBody("text/html", body)

    // ส่งอีเมล
    d := gomail.NewDialer(smtpHost, smtpPort, from, password)
    d.SSL = true

    if err := d.DialAndSend(m); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to send email: %v", err),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "Email sent successfully"})
}





