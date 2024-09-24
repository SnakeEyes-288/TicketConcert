package controller

import (
	//"errors"

	"net/http"

	//time

	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/SnakeEyes-288/sa-67-example/config"
	//github.com/SnakeEyes-288/sa-67-example/services
	"github.com/gin-gonic/gin"

	//"golang.org/x/crypto/bcrypt"

	//"gorm.io/gorm"

	//"example.com/sa-67-example/config"

	//"example.com/sa-67-example/entity"

	//"example.com/sa-67-example/services"
)


func SelectSeat(c *gin.Context) {
    var seat entity.Seat
    seatID := c.Param("id")

    // ค้นหาที่นั่งจาก ID
    db := config.DB()
    if err := db.First(&seat, seatID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Seat not found"})
        return
    }

    // ตรวจสอบว่าที่นั่งยังว่างอยู่หรือไม่
    if !seat.IsAvailable {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Seat is already booked"})
        return
    }

    // จองที่นั่งและบันทึกข้อมูล
    seat.IsAvailable = false
    db.Save(&seat)

    c.JSON(http.StatusOK, gin.H{"message": "Seat selected", "seat": seat})
}

func GetSeatsByConcertID(c *gin.Context) {
    ID := c.Param("id")
    var seats []entity.Seat

    db := config.DB()
    // ดึงข้อมูลที่นั่งทั้งหมดของคอนเสิร์ตตาม ID ที่ส่งมา
    results := db.Where("concert_id = ?", ID).Find(&seats)
    if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
        return
    }
    if len(seats) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }
    c.JSON(http.StatusOK, seats)
}

func SelectMultipleSeats(c *gin.Context) {
    var seatNumbers []string
    var seats []entity.Seat

    if err := c.ShouldBindJSON(&seatNumbers); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()
    // ค้นหาที่นั่งตาม SeatNumbers
    if err := db.Where("seat_number IN (?)", seatNumbers).Find(&seats).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Seats not found"})
        return
    }

    // ตรวจสอบและจองที่นั่ง
    for _, seat := range seats {
        if !seat.IsAvailable {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Some seats are already booked"})
            return
        }
        seat.IsAvailable = false
        db.Save(&seat)
    }

    c.JSON(http.StatusOK, gin.H{"message": "Seats selected", "seats": seats})
}
