package entity

import (
    "time"
    "gorm.io/gorm"
)
type Concert struct {
    gorm.Model
    Name        string
    Date        time.Time
    Venue       string
    Seats       []Seat
}