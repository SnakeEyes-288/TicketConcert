package entity

import "gorm.io/gorm"

type TickerType struct {
	gorm.Model

	Type_name string
	Description string

	Tickers []Ticker

}