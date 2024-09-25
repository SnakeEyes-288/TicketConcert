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
		{Name: "VIP", Price: 50, Description: "ที่นั่ง VIP ใกล้เวที"},
		{Name: "Regular", Price: 20, Description: "ที่นั่งธรรมดา"},
		{Name: "Premium", Price: 35, Description: "ที่นั่งระดับพรีเมียม"},
		{Name: "Economy", Price: 10, Description: "ที่นั่งราคาประหยัด"},
	}

	for i, seatType := range seatTypes {
		db.FirstOrCreate(&seatTypes[i], &entity.SeatType{Name: seatType.Name})
	}

	// เพิ่มข้อมูลเริ่มต้นสำหรับ Concert
	concerts := []entity.Concert{
		{Name: "Concert One", Date: time.Now().AddDate(0, 1, 0), Venue: "สยาม"},
		{Name: "Concert Two", Date: time.Now().AddDate(0, 2, 0), Venue: "อิมแพ็คอารีน่า"},
		{Name: "Concert Three", Date: time.Now().AddDate(0, 3, 0), Venue: "เซ็นทรัลเวิลด์"},
		{Name: "Concert Four", Date: time.Now().AddDate(0, 4, 0), Venue: "สนามราชมังคลากีฬาสถาน"},
	}

	for i, concert := range concerts {
		db.FirstOrCreate(&concerts[i], &entity.Concert{Name: concert.Name})
	}


	for _, concert := range concerts {
		for _, seatType := range seatTypes {
			for i := 1; i <= 10; i++ { // สร้าง 10 ที่นั่งสำหรับแต่ละประเภทที่นั่ง
				// seatNumber จะรวม ConcertID เพื่อให้มั่นใจว่า SeatNumber ไม่ซ้ำกันในแต่ละคอนเสิร์ต
				seatNumber := fmt.Sprintf("%s%d-C%d", seatType.Name[0:1], i, concert.ID)
			
				seat := entity.Seat{
					SeatNumber:  seatNumber,
					ConcertID:   &concert.ID,      // กำหนด ConcertID
					IsAvailable: true,
					SeatTypeID:  &seatType.ID,     // กำหนด SeatTypeID
				}
			
				db.FirstOrCreate(&seat, &entity.Seat{SeatNumber: seatNumber, ConcertID: &concert.ID})
			}
		}
	}
	
}


