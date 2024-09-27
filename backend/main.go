// main.go
package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/controller"
	"os"
)

const PORT = "8000"

func main() {
	// open connection database
	config.ConnectionDB()

	// Generate databases
	config.SetupDatabase()

	r := gin.Default()

	// ตรวจสอบว่ามีโฟลเดอร์ uploads หรือไม่ ถ้าไม่มีให้สร้างขึ้น
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	// Set static folder for serving uploaded files
	r.Static("/uploads", "./uploads") // เส้นทางสำหรับไฟล์ที่อัปโหลด

	r.Use(CORSMiddleware())

	router := r.Group("")
	{
		// Member Routes
		router.POST("/login", controller.SignIn)
		router.POST("/Member", controller.SignUp)
		router.GET("/user/:id",controller.GetUser)
		// Concert Routes
		router.GET("/concerts", controller.ListConcerts)
		router.GET("/seats/:id", controller.GetSeatsByConcertID)
		router.GET("/seatTypes", controller.GetSeatTypes)
		router.POST("/concerts/:id/seat", controller.SelectSeat)
		router.POST("/payment", controller.CreatePayment)
		router.POST("/ticket", controller.CreateTicket)
		router.GET("/payment/:id", controller.GetPaymentsByMemberID) // เส้นทางสำหรับดึงข้อมูลการชำระเงินของสมาชิก
		router.GET("/tickets/member/:memberID", controller.ListTicketsByMemberID)
		router.POST("/sendTicketEmail", controller.SendEmail)// เปลี่ยนการเรียกใช้งาน SendEmail ให้ถูกต้อง
		router.GET("/Condition",controller.ListCondition)
		router.POST("/CreateCondition",controller.CreateConditionRefun)
		router.POST("/refund-request",controller.RefundRequest)
	}

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// Run the server
	r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, Content-Disposition")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}