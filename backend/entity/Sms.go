package entity

import (
	"time"

	"gorm.io/gorm"
)

type Sms struct {
	gorm.Model

	PhoneNumber string
	MessageContent string
	SentDate time.Time

	MemberID *uint
	Member Member

}