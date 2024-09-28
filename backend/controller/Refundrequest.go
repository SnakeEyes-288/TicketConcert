package controller

import (
	"net/http"
    "time"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"

	"github.com/gin-gonic/gin"
)

func GetAllRefundrequest(c *gin.Context) {
	var Refundrequest []entity.Refundrequest
	db := config.DB()

	results := db.Find(&Refundrequest)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, Refundrequest)
}

func GetRefundrequestbyId(c *gin.Context) {
    db := config.DB()
    // รับ ID จากพารามิเตอร์ของ URL
    id := c.Param("id")

    var refundRequest entity.Refundrequest

    // ค้นหาคำขอคืนเงินในฐานข้อมูลตาม ID
    if err := db.First(&refundRequest, id).Error; err != nil {
        // ถ้าไม่พบข้อมูล ให้ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"message": "Refund request not found"})
        return
    }

    // ส่งคืนข้อมูลคำขอคืนเงิน
    c.JSON(http.StatusOK, refundRequest)
}

func DeleteRefundrequest(c *gin.Context) {

	id := c.Param("id")
	db := config.DB()
	if tx := db.Exec("DELETE FROM Refundrequest WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})

}

func CreateRefundrequest(c *gin.Context) {
	var Refundrequest entity.Refundrequest

	// bind เข้าตัวแปร user
	if err := c.ShouldBindJSON(&Refundrequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()


	u := entity.Refundrequest{
		Refund_amount:    Refundrequest.Refund_amount,
        Refund_Date:      time.Now(),
	}

	// บันทึก
	if err := db.Create(&u).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Created success", "data": u})
}

//put
func UpdateRefundrequestByUserID(c *gin.Context) {
    var Refundrequest entity.Refundrequest
    userID := c.Param("id") // รับค่า UserID จาก URL

    db := config.DB()

    // ค้นหาข้อมูล Payment ที่ตรงกับ UserID
    result := db.Where("id = ?", userID).First(&Refundrequest)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Refundrequest not found for this user"})
        return
    }

    // ตรวจสอบว่าข้อมูลที่ส่งมามีปัญหาหรือไม่
    if err := c.ShouldBindJSON(&Refundrequest); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // อัปเดตข้อมูล Payment
    result = db.Save(&Refundrequest)
    if result.Error != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update Refundrequest"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": Refundrequest})
}

//patch
func UpdateRefundrequest(c *gin.Context) {
	var Refundrequest entity.Refundrequest

	RefundrequestID := c.Param("id")

	db := config.DB()
	result := db.First(&Refundrequest, RefundrequestID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&Refundrequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	result = db.Save(&Refundrequest)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}