package controller

import (
	"fmt"
	"log"
	"net/http"

	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ฟังก์ชันสำหรับแปลง SeatNumber เป็น SeatID
func getSeatIDBySeatNumber(seatNumber string) (uint, error) { 
    var seat entity.Seat
    db := config.DB()
    if err := db.Where("seat_number = ?", seatNumber).First(&seat).Error; err != nil {
        return 0, fmt.Errorf("invalid SeatNumber")
    }
    return seat.ID, nil
}


// POST /tickets
func CreateTicket(c *gin.Context) {
	var ticket entity.Ticket

	// Bind JSON ข้อมูลที่ถูกส่งมา
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบว่า SeatNumber ถูกต้องหรือไม่
	if ticket.Seat.SeatNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "SeatNumber is required"})
		return
	}

	// ค้นหา SeatID โดยใช้ SeatNumber
	seatID, err := getSeatIDBySeatNumber(ticket.Seat.SeatNumber)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SeatNumber"})
		return
	}

	// กำหนด SeatID ที่ถูกต้องให้กับ ticket
	ticket.SeatID = &seatID

	// ทำการรีเซ็ตข้อมูลใน ticket.Seat เพื่อป้องกันการสร้าง Seat ใหม่
	ticket.Seat = entity.Seat{}

	// เริ่มทำธุรกรรม (transaction) เพื่อสร้าง ticket และอัปเดตสถานะของ seat
	db := config.DB()
	err = db.Transaction(func(tx *gorm.DB) error {
		// บันทึกข้อมูล ticket
		if err := tx.Create(&ticket).Error; err != nil {
			return err
		}

		// อัปเดตสถานะ is_available ของที่นั่งเป็น false
		if err := tx.Model(&entity.Seat{}).Where("id = ?", seatID).Update("is_available", false).Error; err != nil {
			return err
		}

		// หากไม่มี error ให้ทำ commit
		return nil
	})

	// ตรวจสอบว่ามีข้อผิดพลาดใน transaction หรือไม่
	if err != nil {
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
	if err := db.Preload("Seat").First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ticket})
}

// GET /tickets
func ListTickets(c *gin.Context) {
	var tickets []entity.Ticket

	db := config.DB()
	if err := db.Preload("Seat").Find(&tickets).Error; err != nil {
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

func ListTicketsByMemberID(c *gin.Context) {
    var tickets []entity.Ticket
    memberID := c.Param("memberID")
    log.Printf("Fetching tickets for memberID: %s", memberID) // เพิ่ม log นี้

    db := config.DB()

    // ดึงข้อมูลตั๋วที่มี MemberID ตรงกับที่ส่งเข้ามา
    if err := db.Preload("Seat").Preload("Payment").Where("member_id = ?", memberID).Find(&tickets).Error; err != nil {
        log.Printf("Database error: %v", err) // log ข้อผิดพลาด
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve tickets"})
        return
    }

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if len(tickets) == 0 {
        log.Println("No tickets found for the member") // log ข้อความนี้
        c.JSON(http.StatusNotFound, gin.H{"message": "No tickets found for the member"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": tickets})
}
