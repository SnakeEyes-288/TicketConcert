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
		&entity.TicketType{},
	)

	//GenderMale := entity.Gender{Name: "Male"}
	//GenderFemale := entity.Gender{Name: "Female"}

	//db.FirstOrCreate(&GenderMale, &entity.Gender{Name: "Male"})
	//db.FirstOrCreate(&GenderFemale, &entity.Gender{Name: "Female"})

	hashedPassword, _ := HashPassword("123456")
	BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
	
	Member := &entity.Member{
		//Model:      gorm.Model{},
		Username:   "Sa1",
		Password:   hashedPassword,
		Email:      "sa@gmail.com",
		First_name: "Sa",
		Last_name:  "67",
		Birthday:   BirthDay,
		Tickets:    []entity.Ticket{},
		Smss:       []entity.Sms{},
	}
	db.FirstOrCreate(Member, &entity.Member{
		Email: "sa@gmail.com",
	})

	typeVIP := entity.TicketType{Type_name: "VIP",Description: "++"}
	typeRegular := entity.TicketType{Type_name: "Regular",Description: "--"}

	db.FirstOrCreate(&typeVIP, &entity.TicketType{Type_name: "VIP",Description: "++"})
	db.FirstOrCreate(&typeRegular, &entity.TicketType{Type_name: "Regular",Description: "--"})

	//descriptionVIP := entity.TicketType{Description: "***********************************"}
	
	//db.FirstOrCreate(&descriptionVIP,&entity.TicketType{Description: "***********************************"})
	//db.FirstOrCreate(&descriptionRegular,&entity.TicketType{Description: "+++++++++++++++++++++++++++++++++"})
}