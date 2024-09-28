package config

import (
	"fmt"
	"time"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("project.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}
func SetupDatabase() {

	db.AutoMigrate(
		&entity.Member{},
		&entity.Payment{},
		&entity.Sms{},
		&entity.Ticket{},
		&entity.SeatType{},
		&entity.Seat{},
		&entity.Concert{},
		&entity.ConditionRefun{},
		&entity.Refundapproval{},
		&entity.Refundrequest{},
	)

	hashedPassword, _ := HashPassword("wichitchaibas288")
	BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")

	Member := &entity.Member{
		Username:  "Sa1",
		Password:  hashedPassword,
		Email:     "B6512194@g.sut.ac.th",
		FirstName: "Sa",
		LastName:  "67",
		Birthday:  BirthDay,
		PhoneNumber: "0990399752",
	}
	db.FirstOrCreate(Member, &entity.Member{Email: "B6512194@g.sut.ac.th"})

	// เพิ่มข้อมูลเริ่มต้นสำหรับ SeatType
	seatTypes := []entity.SeatType{
		{Name: "VIP", Price: 4000, Description: "ที่นั่ง VIP ใกล้เวที"},
		{Name: "Regular", Price: 1200, Description: "ที่นั่งธรรมดา"},
		{Name: "Premium", Price: 2000, Description: "ที่นั่งระดับพรีเมียม"},
		{Name: "Economy", Price: 500, Description: "ที่นั่งราคาประหยัด"},
	}

	for i, seatType := range seatTypes {
		db.FirstOrCreate(&seatTypes[i], &entity.SeatType{Name: seatType.Name})
	}

	// เพิ่มข้อมูลเริ่มต้นสำหรับ Concert
	concerts := []entity.Concert{
		{Name: "WOOSUNG WORLD TOUR'B4 WE DIE' COMES TO BANGKOK", Date: time.Now().AddDate(0, 1, 0), Venue: "Voice Space"},
		{Name: "Bangkok Bank M Visa Present The 1st Anniversary LegeMdary Concert", Date: time.Now().AddDate(0, 2, 0), Venue: "MCC HALL ชั้น 4, เดอะมอลล์ไลฟ์สโตร์ งามวงศ์วาน"},
		{Name: "Aokhanom Festival Moon Lover", Date: time.Now().AddDate(0, 3, 0), Venue: "Hotel Villa Ao Khanom"},
		{Name: "2024 (G)I-DLE WORLD TOUR [iDOL] IN BANGKOK", Date: time.Now().AddDate(0, 4, 0), Venue: "อิมแพ็ค อารีน่า เมืองทองธานี"},
	}

	for i, concert := range concerts {
		db.FirstOrCreate(&concerts[i], &entity.Concert{Name: concert.Name})
	}
	// สร้างสไลซ์ของคำขอคืนเงิน
	refundRequests := []entity.Refundrequest{
		{// 
			Refund_amount: "500.00", // จำนวนเงินที่คืน
			Refund_Date:   time.Now(), // วันที่คืนเงิน
			// Refundapproval: 1, // ใช้เพื่อเชื่อมโยงกับการอนุมัติ
		},
	}

	// บันทึกคำขอคืนเงิน
	for _, refundRequest := range refundRequests {
		db.Create(&refundRequest)
	}

	// สร้างสไลซ์ของการอนุมัติคืนเงิน
	Refundapproval := []entity.Refundapproval{
		{
			Approval_status: "approve", // สถานะการอนุมัติ
			Approval_Date:   time.Now(), // วันที่อนุมัติ
		},
		{
			Approval_status: "reject", // สถานะการอนุมัติไม่ผ่าน
			Approval_Date:   time.Now(), // วันที่อนุมัติ
		},
	}

	// บันทึกการอนุมัติคืนเงิน
	for _, Refundapproval := range Refundapproval {
		db.Create(&Refundapproval)
	}

	for _, concert := range concerts { 
		for _, seatType := range seatTypes {
			alphabet := "ABCDEFGHIJKLMNOPQRSTUVWXYZ" // ตัวอักษรภาษาอังกฤษ 26 ตัว
			
			for i := 0; i < 10; i++ { // สร้าง 10 ที่นั่งสำหรับแต่ละประเภทที่นั่ง
				// ใช้ตัวอักษรจาก alphabet เพื่อลดความซ้ำกัน
				letter := string(alphabet[i%len(alphabet)])  // เลือกตัวอักษรตามลำดับ A, B, C, ...
				
				// สร้างหมายเลขที่นั่งที่ไม่ซ้ำกันโดยไม่มี -C
				seatNumber := fmt.Sprintf("%s%s-%d", seatType.Name[0:1], letter, i+1)
			
				seat := entity.Seat{
					SeatNumber:  seatNumber,
					ConcertID:   &concert.ID,      // กำหนด ConcertID
					IsAvailable: true,
					SeatTypeID:  &seatType.ID,     // กำหนด SeatTypeID
				}
	
				// บันทึกที่นั่งใหม่ลงในฐานข้อมูลหากไม่มีอยู่ก่อนหน้านี้
				db.FirstOrCreate(&seat, &entity.Seat{SeatNumber: seatNumber, ConcertID: &concert.ID})
			}
		}
	}
	
}


