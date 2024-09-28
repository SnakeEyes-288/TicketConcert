package controller

import (
	"net/http"    
	"time"        
	"github.com/SnakeEyes-288/sa-67-example/config" 
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"                      
)

// ฟังก์ชัน GetAllRefundrequest ใช้ในการดึงข้อมูลคำขอคืนเงินทั้งหมด
func GetAllRefundrequest(c *gin.Context) {
	var Refundrequest []entity.Refundrequest // ประกาศตัวแปรเก็บข้อมูลคำขอคืนเงิน
	db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config

	results := db.Find(&Refundrequest) // ดึงข้อมูลคำขอคืนเงินทั้งหมดจากฐานข้อมูล

	if results.Error != nil {
		// ถ้ามีข้อผิดพลาด ให้ส่งสถานะ 404
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	// ส่งคืนข้อมูลคำขอคืนเงินทั้งหมดด้วยสถานะ 200
	c.JSON(http.StatusOK, Refundrequest)
}

// ฟังก์ชัน GetRefundrequestbyId ใช้ในการดึงข้อมูลคำขอคืนเงินตาม ID ที่ระบุ
func GetRefundrequestbyId(c *gin.Context) {
    db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config
    id := c.Param("id") // รับ ID จากพารามิเตอร์ของ URL

    var refundRequest entity.Refundrequest // ประกาศตัวแปรเก็บข้อมูลคำขอคืนเงิน

    // ค้นหาคำขอคืนเงินในฐานข้อมูลตาม ID
    if err := db.First(&refundRequest, id).Error; err != nil {
        // ถ้าไม่พบข้อมูล ให้ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"message": "Refund request not found"})
        return
    }

    // ส่งคืนข้อมูลคำขอคืนเงินด้วยสถานะ 200
    c.JSON(http.StatusOK, refundRequest)
}

// ฟังก์ชัน DeleteRefundrequest ใช้ในการลบข้อมูลคำขอคืนเงินตาม ID ที่ระบุ
func DeleteRefundrequest(c *gin.Context) {
	id := c.Param("id") // รับ ID จากพารามิเตอร์ของ URL
	db := config.DB()   // เรียกการเชื่อมต่อฐานข้อมูลจาก config

	// ลบข้อมูลคำขอคืนเงินที่ตรงกับ ID
	if tx := db.Exec("DELETE FROM Refundrequest WHERE id = ?", id); tx.RowsAffected == 0 {
		// ถ้าพบว่าจำนวนแถวที่ถูกลบคือ 0 ให้ตอบกลับด้วยสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	// ส่งข้อความว่าลบสำเร็จด้วยสถานะ 200
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}

// ฟังก์ชัน CreateRefundrequest ใช้ในการสร้างคำขอคืนเงินใหม่
func CreateRefundrequest(c *gin.Context) {
	var Refundrequest entity.Refundrequest // ประกาศตัวแปรเก็บข้อมูลคำขอคืนเงินใหม่

	// แปลงข้อมูลจาก JSON ที่รับเข้ามาเป็นโครงสร้าง Refundrequest
	if err := c.ShouldBindJSON(&Refundrequest); err != nil {
		// ถ้ามีข้อผิดพลาดในการแปลงข้อมูล ส่งสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config

	// สร้างข้อมูลคำขอคืนเงินใหม่พร้อมข้อมูลการคืนเงินและวันที่
	u := entity.Refundrequest{
		Refund_amount: Refundrequest.Refund_amount,
		Refund_Date:   time.Now(), // ตั้งวันที่เป็นวันปัจจุบัน
	}

	// บันทึกคำขอคืนเงินใหม่ลงในฐานข้อมูล
	if err := db.Create(&u).Error; err != nil {
		// ถ้ามีข้อผิดพลาดในการบันทึก ส่งสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ดึงข้อมูล Payment ที่เกี่ยวข้องกับคำขอคืนเงินนี้
	var payment entity.Payment
	if err := db.Preload("Tickets").Where("id = ?", Refundrequest.PaymentID).First(&payment).Error; err != nil {
		// ถ้าไม่พบข้อมูล Payment ให้ตอบกลับด้วยสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment not found"})
		return
	}

	// ส่งคำตอบกลับว่าคำขอคืนเงินถูกสร้างสำเร็จ
	c.JSON(http.StatusCreated, gin.H{"message": "Created success and Tickets deleted", "data": u})
}

// ฟังก์ชัน UpdateRefundrequestByUserID ใช้ในการอัปเดตข้อมูลคำขอคืนเงินตาม User ID
func UpdateRefundrequestByUserID(c *gin.Context) {
    var Refundrequest entity.Refundrequest // ประกาศตัวแปรเก็บข้อมูลคำขอคืนเงิน
    userID := c.Param("id") // รับค่า UserID จาก URL

    db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config

    // ค้นหาคำขอคืนเงินที่ตรงกับ UserID
    result := db.Where("id = ?", userID).First(&Refundrequest)
    if result.Error != nil {
        // ถ้าไม่พบข้อมูล ให้ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"error": "Refundrequest not found for this user"})
        return
    }

    // แปลงข้อมูลจาก JSON ที่ส่งเข้ามาเป็นโครงสร้าง Refundrequest
    if err := c.ShouldBindJSON(&Refundrequest); err != nil {
        // ถ้ามีข้อผิดพลาดในการแปลงข้อมูล ส่งสถานะ 400
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // อัปเดตข้อมูลคำขอคืนเงิน
    result = db.Save(&Refundrequest)
    if result.Error != nil {
        // ถ้าอัปเดตไม่สำเร็จ ส่งสถานะ 400
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update Refundrequest"})
        return
    }

    // ส่งข้อความว่าอัปเดตสำเร็จด้วยสถานะ 200
    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": Refundrequest})
}

// ฟังก์ชัน UpdateRefundrequest ใช้ในการอัปเดตข้อมูลคำขอคืนเงินตาม RefundrequestID
func UpdateRefundrequest(c *gin.Context) {
	var Refundrequest entity.Refundrequest // ประกาศตัวแปรเก็บข้อมูลคำขอคืนเงิน

	RefundrequestID := c.Param("id") // รับ ID ของคำขอคืนเงินจาก URL

	db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config
	result := db.First(&Refundrequest, RefundrequestID) // ค้นหาคำขอคืนเงินในฐานข้อมูลตาม ID
	if result.Error != nil {
		// ถ้าไม่พบข้อมูล ส่งสถานะ 404
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// แปลงข้อมูลจาก JSON ที่ส่งเข้ามาเป็นโครงสร้าง Refundrequest
	if err := c.ShouldBindJSON(&Refundrequest); err != nil {
		// ถ้ามีข้อผิดพลาดในการแปลงข้อมูล ส่งสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	// อัปเดตข้อมูลคำขอคืนเงิน
	result = db.Save(&Refundrequest)
	if result.Error != nil {
		// ถ้าอัปเดตไม่สำเร็จ ส่งสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// ส่งข้อความว่าอัปเดตสำเร็จด้วยสถานะ 200
	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}
