package entity

import (
    "gorm.io/gorm"
)

type Seat struct {
    gorm.Model
    SeatNumber  string  // หมายเลขที่นั่ง
    
    IsAvailable bool    // ระบุว่าว่างหรือไม่
    //Amount      float64 // ราคาที่นั่ง

    SeatTypeID   uint      // Foreign Key ชี้ไปที่ SeatType
    SeatType     SeatType  // ความสัมพันธ์ Many-to-One กับ SeatType
    
    ConcertID   uint    // เชื่อมกับคอนเสิร์ต
    Concert Concert
}
