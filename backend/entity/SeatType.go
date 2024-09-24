package entity

import (
    "gorm.io/gorm"
)

type SeatType struct {
    gorm.Model
    Name       string  // เช่น VIP, Regular, Balcony
    Price      float64 // ราคาของที่นั่งประเภทนั้น
    Description string // คำอธิบายเพิ่มเติมเกี่ยวกับที่นั่ง
	Seats []Seat
}
