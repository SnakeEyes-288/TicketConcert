package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
)

// POST /ticket-types
//func CreateTicketType(c *gin.Context) {
	//var ticketType entity.Ticket

	//if err := c.ShouldBindJSON(&ticketType); err != nil {
		//c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		//return
	//}

	//db := config.DB()

	//if err := db.Create(&ticketType).Error; err != nil {
		//c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		//return
	//}

	//c.JSON(http.StatusCreated, gin.H{"data": ticketType})
//}

// GET /ticket-types/:id
func GetTicketType(c *gin.Context) {
	var ticketType entity.TicketType
	id := c.Param("id")

	db := config.DB()
	if err := db.First(&ticketType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket type not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ticketType})
}

// GET /ticket-types
func ListTicketTypes(c *gin.Context) {
	var ticketTypes []entity.TicketType

	db := config.DB()
	if err := db.Find(&ticketTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve ticket types"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ticketTypes})
}

// DELETE /ticket-types/:id
//func DeleteTicketType(c *gin.Context) {
	//id := c.Param("id")

	//db := config.DB()
	//if tx := db.Delete(&entity.TicketType{}, id); tx.RowsAffected == 0 {
		//c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket type not found"})
		//return
	//}

	//c.JSON(http.StatusOK, gin.H{"message": "Ticket type deleted successfully"})
//}
