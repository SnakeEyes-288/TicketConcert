package entity

import (
	"time"

	"gorm.io/gorm"
)

type Ticket struct {
	gorm.Model

	Price float64
	Purchase_date time.Time
	Quantity int

	TicketTypeID *uint
    TicketType  TicketType

	MemberID *uint
	Member Member

	Payments []Payment
}