package entity

import (
    "time"
    "gorm.io/gorm"
)
type Refundrequest struct {
    gorm.Model
    Refund_amount    string
    Refund_Date      time.Time
    Refund_reason    string

    PaymentID    *uint      // Foreign Key ชี้ไปที่การชำระเงิน
    Payment  Payment
    
    RefundapprovalID   uint
    Refundapproval     Refundapproval `gorm:"foreignKey:RefundapprovalID"`
}