package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
)

// POST /tickets
func CreateTicket(c *gin.Context) {
	var ticket entity.Ticket

	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	if err := db.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": ticket})
}

// GET /tickets/:id
func GetTicket(c *gin.Context) {
	var ticket entity.Ticket
	id := c.Param("id")

	db := config.DB()
	if err := db.First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ticket})
}

// GET /tickets
func ListTickets(c *gin.Context) {
	var tickets []entity.Ticket

	db := config.DB()
	if err := db.Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve tickets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tickets})
}

// DELETE /tickets/:id
func DeleteTicket(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	if tx := db.Delete(&entity.Ticket{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket deleted successfully"})
}
