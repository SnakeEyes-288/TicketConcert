package controller

import (
	"log"
	"net/http"

	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
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

func GetSeatTypes(c *gin.Context) {
    var seatTypes []entity.SeatType

    db := config.DB()
    if err := db.Find(&seatTypes).Error; err != nil {
        log.Println("Error fetching seat types:", err) // ตรวจสอบ error ที่เกิดขึ้น
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving seat types"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": seatTypes})
}

