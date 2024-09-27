package controller

import (
	"net/http"
	"time"

	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/gin-gonic/gin"
)

// RefundApproval handles refund approval
func RefundApproval(c *gin.Context) {
    var refundRequest entity.Refundrequest
    if err := c.ShouldBindJSON(&refundRequest); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // ดึงข้อมูล refund request ที่ตรงกับ ID ที่ส่งมา
    if err := config.DB().Where("id = ?", refundRequest.ID).First(&refundRequest).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Refund request not found"})
        return
    }

    // อัปเดตสถานะบัตรคอนเสิร์ตให้เป็น "ยกเลิก" และบันทึกวันที่ทำรายการ
    if err := config.DB().Model(&refundRequest).Updates(entity.Refundapproval{
        Approval_status: "Cancelled",
        Approval_Date: time.Now(),
    }).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update refund status"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Refund status updated successfully"})
}
