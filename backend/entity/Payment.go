package entity

import (
    "gorm.io/gorm"
    "time"
)

type Payment struct {
    gorm.Model
    PaymentMethod string    // วิธีการชำระเงิน
    PaymentDate   time.Time // วันที่ชำระเงิน
    Status        string    // สถานะการชำระเงิน
    Quantity      int       // จำนวนตั๋วที่ชำระเงิน
    Amount        float64   // ยอดเงินทั้งหมด
    //AcceptedTerms bool
    //ConditionRefun string   
    SlipImage       string    // URL หรือ path ของสลิปการชำระเงิน
    Tickets       []Ticket  `gorm:"foreignKey:PaymentID"` // ความสัมพันธ์ One-to-Many กับตั๋ว

    // ความสัมพันธ์แบบ One-to-One กับเงื่อนไขการคืนเงิน
    ConditionRefunID *uint
    ConditionRefun   ConditionRefun
}
