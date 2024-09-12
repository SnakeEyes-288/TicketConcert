package entity

import (
	"time"

	"gorm.io/gorm"
)

type Member struct {
	gorm.Model

	Username string
	Password string
	Email string
	First_name string
	Last_name string
	Birthday time.Time

	Tickets []Ticket

	Smss []Sms

}