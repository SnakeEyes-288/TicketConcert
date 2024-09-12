package entity

import "gorm.io/gorm"

type TicketType struct {
	gorm.Model

	Type_name string
	Description string

	Tickets []Ticket `gorm:"foreignKey:TicketTypeID"`
}