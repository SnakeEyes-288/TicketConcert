package entity

import (
	"time"

	"gorm.io/gorm"
)

type Ticker struct {
	gorm.Model

	Price float64
	Purchase_date time.Time

	TypeID *uint
	TickerType TickerType

	MemberID *uint
	Member Member

	Payments []Payment
}