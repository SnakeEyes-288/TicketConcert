package controller

import (
	"net/http"
	"time"

	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
)

// RefundApproval handles refund approval
// func RefundApproval(c *gin.Context) {
//     var refundRequest entity.Refundrequest
//     if err := c.ShouldBindJSON(&refundRequest); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
//         return
//     }

//     // ดึงข้อมูล refund request ที่ตรงกับ ID ที่ส่งมา
//     if err := config.DB().Where("id = ?", refundRequest.ID).First(&refundRequest).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "Refund request not found"})
//         return
//     }

//     // อัปเดตสถานะบัตรคอนเสิร์ตให้เป็น "ยกเลิก" และบันทึกวันที่ทำรายการ
//     if err := config.DB().Model(&refundRequest).Updates(entity.Refundapproval{
//         Approval_status: "Cancelled",
//         Approval_Date: time.Now(),
//     }).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update refund status"})
//         return
//     }

//     c.JSON(http.StatusOK, gin.H{"message": "Refund status updated successfully"})
// }

// ฟังก์ชัน GetAllRefundApproval ใช้ในการดึงข้อมูลการอนุมัติคืนเงินทั้งหมด
func GetAllRefundApproval(c *gin.Context) {
	var RefundApproval []entity.Refundapproval // ประกาศตัวแปรเก็บข้อมูลการอนุมัติคืนเงิน
	db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config

	results := db.Find(&RefundApproval) // ดึงข้อมูลการอนุมัติคืนเงินทั้งหมดจากฐานข้อมูล

	if results.Error != nil {
		// ถ้ามีข้อผิดพลาด ให้ส่งสถานะ 404
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	// ส่งคืนข้อมูลการอนุมัติคืนเงินทั้งหมดด้วยสถานะ 200
	c.JSON(http.StatusOK, RefundApproval)
}

// ฟังก์ชัน GetRefundapprovalbyId ใช้ในการดึงข้อมูลการอนุมัติคืนเงินตาม ID ที่ระบุ
func GetRefundapprovalbyId(c *gin.Context) {
    db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config
    id := c.Param("id") // รับ ID จากพารามิเตอร์ของ URL

    var Refundapproval entity.Refundapproval // ประกาศตัวแปรเก็บข้อมูลการอนุมัติคืนเงิน

    // ค้นหาการอนุมัติคืนเงินในฐานข้อมูลตาม ID
    if err := db.First(&Refundapproval, id).Error; err != nil {
        // ถ้าไม่พบข้อมูล ให้ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"message": "Refund request not found"})
        return
    }

    // ส่งคืนข้อมูลการอนุมัติคืนเงินด้วยสถานะ 200
    c.JSON(http.StatusOK, Refundapproval)
}

// ฟังก์ชัน DeleteRefundapproval ใช้ในการลบข้อมูลการอนุมัติคืนเงินตาม ID ที่ระบุ
func DeleteRefundapproval(c *gin.Context) {
	id := c.Param("id") // รับ ID จากพารามิเตอร์ของ URL
	db := config.DB()   // เรียกการเชื่อมต่อฐานข้อมูลจาก config

	// ลบข้อมูลการอนุมัติคืนเงินที่ตรงกับ ID
	if tx := db.Exec("DELETE FROM Refundapproval WHERE id = ?", id); tx.RowsAffected == 0 {
		// ถ้าจำนวนแถวที่ถูกลบคือ 0 ให้ตอบกลับด้วยสถานะ 400
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	// ส่งข้อความว่าลบสำเร็จด้วยสถานะ 200
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}

// ฟังก์ชัน CreateRefundApproval ใช้ในการสร้างการอนุมัติคืนเงินใหม่
func CreateRefundApproval(c *gin.Context) {
    var refundApproval entity.Refundapproval // ประกาศตัวแปรเก็บข้อมูลการอนุมัติคืนเงินใหม่

    // รับข้อมูล JSON ที่ส่งมา
    if err := c.ShouldBindJSON(&refundApproval); err != nil {
        // ถ้ามีข้อผิดพลาดในการแปลงข้อมูล ส่งสถานะ 400
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // กำหนดวันที่อนุมัติให้เป็นวันที่ปัจจุบันหากไม่ได้ส่งมา
    if refundApproval.Approval_Date.IsZero() {
        refundApproval.Approval_Date = time.Now()
    }

    db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config
    result := db.Create(&refundApproval) // บันทึกการอนุมัติคืนเงินใหม่ในฐานข้อมูล
    if result.Error != nil {
        // ถ้ามีข้อผิดพลาดในการบันทึก ส่งสถานะ 500
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()}) 
        return
    }

    // ส่งข้อมูลที่สร้างใหม่กลับไปด้วยสถานะ 201
    c.JSON(http.StatusCreated, gin.H{"message": "Created successfully", "data": refundApproval})
}

// ฟังก์ชัน UpdateRefundapprovalByUserID ใช้ในการอัปเดตข้อมูลการอนุมัติคืนเงินตาม User ID
func UpdateRefundapprovalByUserID(c *gin.Context) {
    var Refundapproval entity.Refundapproval // ประกาศตัวแปรเก็บข้อมูลการอนุมัติคืนเงิน
    userID := c.Param("id") // รับค่า UserID จาก URL

    db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config

    // ค้นหาข้อมูลการอนุมัติคืนเงินที่ตรงกับ UserID
    result := db.Where("id = ?", userID).First(&Refundapproval)
    if result.Error != nil {
        // ถ้าไม่พบข้อมูล ให้ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"error": "Refundapproval not found for this user"})
        return
    }

    // ตรวจสอบว่าข้อมูลที่ส่งมามีปัญหาหรือไม่
    if err := c.ShouldBindJSON(&Refundapproval); err != nil {
        // ถ้ามีข้อผิดพลาดในการแปลงข้อมูล ส่งสถานะ 400
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // อัปเดตข้อมูลการอนุมัติคืนเงิน
    result = db.Save(&Refundapproval)
    if result.Error != nil {
        // ถ้าอัปเดตไม่สำเร็จ ส่งสถานะ 400
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update Refundapproval"})
        return
    }

    // ส่งข้อความว่าอัปเดตสำเร็จด้วยสถานะ 200
    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": Refundapproval})
}

// ฟังก์ชัน UpdateRefundApproval ใช้ในการอัปเดตข้อมูลการอนุมัติคืนเงินตาม RefundApprovalID
func UpdateRefundApproval(c *gin.Context) {
    var refundApproval entity.Refundapproval // ประกาศตัวแปรเก็บข้อมูลการอนุมัติคืนเงิน

    refundApprovalID := c.Param("id") // รับ ID ของการอนุมัติคืนเงินจากพารามิเตอร์ของ URL

    db := config.DB() // เรียกการเชื่อมต่อฐานข้อมูลจาก config
    result := db.First(&refundApproval, refundApprovalID) // ค้นหาการอนุมัติคืนเงินในฐานข้อมูลตาม ID
    if result.Error != nil {
        // ถ้าไม่พบข้อมูล ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"error": "ID not found"})
        return
    }

    // รับข้อมูล JSON ที่ส่งมา
    var input struct {
        ApprovalStatus string    `json:"approval_status"` // ฟิลด์สำหรับสถานะการอนุมัติ
        ApprovalDate   time.Time `json:"approval_date"`   // ฟิลด์สำหรับวันที่อนุมัติ
    }

    // ตรวจสอบการจับคู่ข้อมูล JSON
    if err := c.ShouldBindJSON(&input); err != nil {
        // ถ้ามีข้อผิดพลาดในการแปลงข้อมูล ส่งสถานะ 400
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // อัปเดตฟิลด์ที่ต้องการ
    refundApproval.Approval_status = input.ApprovalStatus
    refundApproval.Approval_Date = input.ApprovalDate

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    result = db.Save(&refundApproval)
    if result.Error != nil {
        // ถ้ามีข้อผิดพลาดในการบันทึก ส่งสถานะ 500
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()}) 
        return
    }

    // ส่งข้อมูลที่อัปเดตกลับไปด้วยสถานะ 200
    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": refundApproval})
}