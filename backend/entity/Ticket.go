package entity

import (
    "gorm.io/gorm"
    "time"
)

type Ticket struct {
    gorm.Model
    Price        float64   // ราคาตั๋ว
    PurchaseDate time.Time // วันที่ซื้อ

    SeatID       *uint     // Foreign Key ชี้ไปที่ที่นั่ง
    Seat         Seat      // ความสัมพันธ์ One-to-One กับที่นั่ง
    
    MemberID     *uint     // Foreign Key ชี้ไปที่สมาชิกที่ซื้อ
    Member Member

    PaymentID    *uint      // Foreign Key ชี้ไปที่การชำระเงิน
    Payment  Payment
}
