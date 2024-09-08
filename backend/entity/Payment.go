package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model

	Payment_method string
	Payment_date time.Time
	Amount float64

	TickerID *uint
	Ticker Ticker

}