package entity

import (
    "time"
    "gorm.io/gorm"
)
type Refundrequest struct {
    gorm.Model // ฝังโมเดลพื้นฐานของ GORM ที่มี ID, CreatedAt, UpdatedAt, DeletedAt
    Refund_amount    string // จำนวนเงินคืน (เก็บเป็นสตริงเพื่อให้สามารถจัดเก็บข้อมูลในรูปแบบที่ต้องการได้)
    Refund_Date      time.Time // วันที่ขอคืนเงิน (ใช้ time.Time เพื่อจัดการวันที่และเวลา)
    Refund_reason    string // สาเหตุการคืนเงิน (เก็บเป็นสตริงเพื่อให้มีความยืดหยุ่นในการจัดเก็บข้อมูล)

    PaymentID    *uint      // Foreign Key ชี้ไปที่การชำระเงิน (ใช้ *uint เพื่อให้สามารถใช้ค่า null ได้)
    Payment  Payment 

    RefundapprovalID   uint // Foreign Key ที่ชี้ไปที่การอนุมัติการคืนเงิน
    Refundapproval     Refundapproval `gorm:"foreignKey:RefundapprovalID"`
}