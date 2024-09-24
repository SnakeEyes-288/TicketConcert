package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
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
