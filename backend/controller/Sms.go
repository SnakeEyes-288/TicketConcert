package controller

import (
	"crypto/tls"
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
    //ofcaklsvdrucvjjk
//}

func SendEmail(c *gin.Context) {  
    token := c.GetHeader("Authorization")
    if token == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Token is missing"})
        return
    }

    var data struct {
        To        string  `json:"To"`
        Subject   string  `json:"Subject"`
        Body      string  `json:"Body"`
        PaymentID int     `json:"PaymentID"`
        Venue     string  `json:"Venue"`
        Seat      string  `json:"Seat"`
        Amount    float64 `json:"Amount"`
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
    password := "leewnwxjyapaoiwi" // แทนที่ด้วยรหัสผ่านจริง

    smtpHost := "smtp.gmail.com"
    smtpPort := 587 // เปลี่ยนไปใช้พอร์ต 587 สำหรับการเชื่อมต่อแบบ TLS

    // สร้าง message โดยใช้ gomail
    m := gomail.NewMessage()
    m.SetHeader("From", from)
    m.SetHeader("To", data.To)
    m.SetHeader("Subject", data.Subject)

    // สร้างเนื้อหาของอีเมล
    body := fmt.Sprintf(`
        <h1>Ticket Confirmation</h1>
        <p>หมายเลขคำสั่งซื้อที่: %d</p>
        <p>ที่นั่ง: %s</p>
        <p>สถานที่การแสดง: %s</p>
        <p>ราคาบัตร: %.2f บาท</p>`,
        data.PaymentID, data.Seat, data.Venue, data.Amount)

    m.SetBody("text/html", body)

    // สร้าง dialer สำหรับส่งอีเมล
    d := gomail.NewDialer(smtpHost, smtpPort, from, password)
    d.TLSConfig = &tls.Config{InsecureSkipVerify: true} // การตั้งค่า TLS

    // ส่งอีเมล
    if err := d.DialAndSend(m); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to send email: %v", err),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "Email sent successfully"})
}






