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
		router.POST("/login", controller.SignIn)//ลงชื่อเข้า
		router.POST("/Member", controller.SignUp)//สมัครสมาชิก
		router.GET("/user/:id",controller.GetUser)//ดึงข้อมูลสมาชิก
		
		// Concert Routes
		router.GET("/concerts", controller.ListConcerts)//ดึงข้อมูลคอนเสิร์ต
		router.GET("/seats/:id", controller.GetSeatsByConcertID)//ดึงข้อมูลที่นั่งจากแต่ล่ะคอนเสิร์ต
		router.GET("/seatTypes", controller.GetSeatTypes)//ดึงข้อมูลประเภทที่นั่ง
		router.POST("/payment", controller.CreatePayment)//สร้างข้อมูลการจ่ายเงิน
		router.POST("/ticket", controller.CreateTicket)//สร้างข้อมูลตั้ว
		//router.GET("/payment/:id", controller.GetPaymentsByMemberID)
		router.GET("/tickets/:id", controller.ListTicketsByPaymentID)
		router.GET("/tickets/payment/:id", controller.ListTicketsByPaymentID)
		router.POST("/sendTicketEmail", controller.SendEmail)//ส่งข้อมูลของตั้วที่ผู้ใช้ได้ทำการซื้อไปยังอีเมลของผู้ใช้
		router.POST("/CreateCondition",controller.CreateConditionRefun)//สร้างการกดยอมรับเงื่อนไข/ไม่ยอมรับเงื่อนไข
		
		
		//Refundrequest
		router.GET("/refundrequest", controller.GetAllRefundrequest)
		router.GET("/refundrequest/:id", controller.GetRefundrequestbyId)
		router.POST("/refundrequest", controller.CreateRefundrequest)
		router.DELETE("/refundrequest/:id", controller.DeleteRefundrequest)
		router.PUT("/refundrequest/:id",controller.UpdateRefundrequestByUserID)
		router.PATCH("/refundrequest/:id",controller.UpdateRefundrequest)
		
		
		//Refundapproval
		router.GET("/refundapproval", controller.GetAllRefundApproval)
		router.GET("/refundapproval/:id", controller.GetRefundapprovalbyId)
		router.POST("/refundapproval", controller.CreateRefundApproval)
		router.DELETE("/refundapproval/:id", controller.DeleteRefundapproval)
		router.PUT("/refundapproval/:id",controller.UpdateRefundapprovalByUserID)
		router.PATCH("/refundapproval/:id",controller.UpdateRefundApproval)
		
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