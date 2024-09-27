package entity

import (
    "time"
    "gorm.io/gorm"
)
type Refundrequest struct {
    gorm.Model
    Refund_amount    string
    Refund_Date      time.Time
	Refund_reason	 string
	Username   		 string
    Email      		 string
    PhoneNumber 	 string
    
    Refundapproval     []Refundapproval

	PaymentID *uint
	Payment Payment
}