package users

import (
	"errors"

	"net/http"

	"time"

	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/services"
	"github.com/gin-gonic/gin"

	"golang.org/x/crypto/bcrypt"

	"gorm.io/gorm"

	//"example.com/sa-67-example/config"

	//"example.com/sa-67-example/entity"

	//"example.com/sa-67-example/services"
)


type (

   Login struct {

       Email    string `json:"email"`

       Password string `json:"password"`

   }


   signUp struct {

	   UserName  string    `json:"user_name"`

       FirstName string    `json:"first_name"`

       LastName  string    `json:"last_name"`

       Email     string    `json:"email"`

       //Age       uint8     `json:"age"`

       Password  string    `json:"password"`

       BirthDay  time.Time `json:"birthday"`

       //GenderID  uint      `json:"gender_id"`

   }

)


func SignUp(c *gin.Context) {

   var payload signUp


   // Bind JSON payload to the struct

   if err := c.ShouldBindJSON(&payload); err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

       return

   }


   db := config.DB()

   var userCheck entity.Member


   // Check if the user with the provided email already exists

   result := db.Where("email = ?", payload.Email).First(&userCheck)

   if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {

       // If there's a database error other than "record not found"

       c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})

       return

   }


   if userCheck.ID != 0 {

       // If the user with the provided email already exists

       c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})

       return

   }


   // Hash the user's password

   hashedPassword, _ := config.HashPassword(payload.Password)


   // Create a new user

   Member := entity.Member{

	   UserName: payload.UserName,

       FirstName: payload.FirstName,

       LastName:  payload.LastName,

       Email:     payload.Email,

       //Age:       payload.Age,

       Password:  hashedPassword,

       BirthDay:  payload.BirthDay,

       //GenderID:  payload.GenderID,

   }


   // Save the Member to the database

   if err := db.Create(&Member).Error; err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

       return

   }


   c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})

}


func SignIn(c *gin.Context) {

   var payload Login

   var user entity.Member


   if err := c.ShouldBindJSON(&payload); err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

       return

   }

   // ค้นหา user ด้วย Username ที่ผู้ใช้กรอกเข้ามา

   if err := config.DB().Raw("SELECT * FROM Member WHERE email = ?", payload.Email).Scan(&user).Error; err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

       return

   }


   // ตรวจสอบรหัสผ่าน

   err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))

   if err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": "password is incerrect"})

       return

   }


   jwtWrapper := services.JwtWrapper{

       SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",

       Issuer:          "AuthService",

       ExpirationHours: 24,

   }


   signedToken, err := jwtWrapper.GenerateToken(user.Email)

   if err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})

       return

   }


   c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.ID})


}