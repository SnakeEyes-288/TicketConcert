package entity

import (
    "time"
    "gorm.io/gorm"
)
type Refundrequest struct {
    gorm.Model
    Refund_amount    string
    Refund_Date      time.Time
	
    
    Refundapproval     []Refundapproval

	PaymentID *uint
	Payment Payment
}