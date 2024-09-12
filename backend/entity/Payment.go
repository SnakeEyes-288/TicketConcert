package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model

	Payment_method string
	Payment_date time.Time
	Payment_status string
	Total_price float64

	TicketID *uint
	Ticket Ticket

}