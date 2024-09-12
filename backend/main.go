/*package main

import (
	"github.com/SnakeEyes-288/sa-67-example/entity"
  //"github.com/SnakeEyes-288/sa-67-example/controller"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

//type Product struct {
//gorm.Model
//  Code  string
//  Price uint
//}

func main() {
  db, err := gorm.Open(sqlite.Open("project.db"), &gorm.Config{})
  if err != nil {
    panic("failed to connect database")
  }

  // Migrate the schema
  db.AutoMigrate(&entity.Member{},&entity.Payment{},&entity.Sms{},&entity.Ticket{},&entity.TicketType{})

  // Create
  //db.Create(&Product{Code: "D42", Price: 100})

  // Read
  //var product Product
  //db.First(&product, 1) // find product with integer primary key
  //db.First(&product, "code = ?", "D42") // find product with code D42

  // Update - update product's price to 200
  //db.Model(&product).Update("Price", 200)
  // Update - update multiple fields
  //db.Model(&product).Updates(Product{Price: 200, Code: "F42"}) // non-zero fields
  //db.Model(&product).Updates(map[string]interface{}{"Price": 200, "Code": "F42"})

  // Delete - delete product
  //db.Delete(&product, 1)
}*/

package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/controller"
)

const PORT = "8000"

func main() {

	// open connection database
	config.ConnectionDB()

	// Generate databases
	config.SetupDatabase()

	r := gin.Default()

	r.Use(CORSMiddleware())

	router := r.Group("")
	{

		// Member Routes
		router.GET("/users", controller.ListUsers)
		router.GET("/user/:id", controller.GetUser)
		router.POST("/users", controller.CreateMember)
		router.PATCH("/users", controller.UpdateUser)
		router.DELETE("/users/:id", controller.DeleteUser)
		// Gender Routes
		//router.GET("/genders", controller.ListGenders)
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
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}