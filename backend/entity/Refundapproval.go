package entity

import (
    "time"
    "gorm.io/gorm"
)
type Refundapproval struct {
    gorm.Model
    Approval_status        string
    Approval_Date        time.Time
    
	RefundrequestID *uint
    Refundrequest Refundrequest
}