package entity

import (
    "time"
    "gorm.io/gorm"
)
type Refundapproval struct {
    gorm.Model
    Approval_status        string // สถานะการอนุมัติ (เก็บเป็นสตริงเพื่อให้สามารถแสดงสถานะต่างๆ ได้)
    Approval_Date          time.Time // วันที่อนุมัติการคืนเงิน (ใช้ time.Time เพื่อจัดการวันที่และเวลาอย่างถูกต้อง)
    
    //(เป็นความสัมพันธ์แบบ One-to-Many)ช่วยให้สามารถเชื่อมโยงคำขอคืนเงินหลายรายการกับการอนุมัติการคืนเงินรายการเดียวได้
    Refundrequest  []Refundrequest `gorm:"foreignKey:RefundapprovalID"` 
}