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

func GetAllRefundApproval(c *gin.Context) {
	var RefundApproval []entity.Refundapproval
	db := config.DB()

	results := db.Find(&RefundApproval)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, RefundApproval)
}

func GetRefundapprovalbyId(c *gin.Context) {
    db := config.DB()
    // รับ ID จากพารามิเตอร์ของ URL
    id := c.Param("id")

    var Refundapproval entity.Refundapproval

    // ค้นหาคำขอคืนเงินในฐานข้อมูลตาม ID
    if err := db.First(&Refundapproval, id).Error; err != nil {
        // ถ้าไม่พบข้อมูล ให้ส่งสถานะ 404
        c.JSON(http.StatusNotFound, gin.H{"message": "Refund request not found"})
        return
    }

    // ส่งคืนข้อมูลคำขอคืนเงิน
    c.JSON(http.StatusOK, Refundapproval)
}

func DeleteRefundapproval(c *gin.Context) {

	id := c.Param("id")
	db := config.DB()
	if tx := db.Exec("DELETE FROM Refundapproval WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})

}

//post
func CreateRefundApproval(c *gin.Context) {
    var refundApproval entity.Refundapproval

    // รับข้อมูล JSON ที่ส่งมา
    if err := c.ShouldBindJSON(&refundApproval); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // กำหนดวันที่อนุมัติให้เป็นวันที่ปัจจุบันหากไม่ได้ส่งมา
    if refundApproval.Approval_Date.IsZero() {
        refundApproval.Approval_Date = time.Now()
    }

    // บันทึก RefundApproval ใหม่ในฐานข้อมูล
    db := config.DB()
    result := db.Create(&refundApproval)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()}) // แสดงข้อผิดพลาดจากฐานข้อมูล
        return
    }

    // ส่งข้อมูลที่สร้างใหม่กลับไป
    c.JSON(http.StatusCreated, gin.H{"message": "Created successfully", "data": refundApproval})
}

//put
func UpdateRefundapprovalByUserID(c *gin.Context) {
    var Refundapproval entity.Refundapproval
    userID := c.Param("id") // รับค่า UserID จาก URL

    db := config.DB()

    // ค้นหาข้อมูล Payment ที่ตรงกับ UserID
    result := db.Where("id = ?", userID).First(&Refundapproval)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Refundapproval not found for this user"})
        return
    }

    // ตรวจสอบว่าข้อมูลที่ส่งมามีปัญหาหรือไม่
    if err := c.ShouldBindJSON(&Refundapproval); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // อัปเดตข้อมูล Payment
    result = db.Save(&Refundapproval)
    if result.Error != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update Refundapproval"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": Refundapproval})
}

//patch
func UpdateRefundApproval(c *gin.Context) {
    var refundApproval entity.Refundapproval

    // รับ ID ของ RefundApproval จากพารามิเตอร์ของ URL
    refundApprovalID := c.Param("id")

    // ค้นหา RefundApproval ในฐานข้อมูล
    db := config.DB()
    result := db.First(&refundApproval, refundApprovalID)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ID not found"})
        return
    }

    // รับข้อมูล JSON ที่ส่งมา
    var input struct {
        ApprovalStatus string    `json:"approval_status"`
        ApprovalDate   time.Time `json:"approval_date"`
    }

    // ตรวจสอบการจับคู่ข้อมูล JSON
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
        return
    }

    // อัปเดตฟิลด์ที่ต้องการ
    refundApproval.Approval_status = input.ApprovalStatus
    refundApproval.Approval_Date = input.ApprovalDate

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    result = db.Save(&refundApproval)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()}) // แสดงข้อผิดพลาดจากฐานข้อมูล
        return
    }

    // ส่งข้อมูลที่อัปเดตกลับไป
    c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": refundApproval})
}
