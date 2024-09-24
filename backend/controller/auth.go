package controller

import (
	//"errors"

	"net/http"

	"time"

	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/services"
	"github.com/gin-gonic/gin"

	"golang.org/x/crypto/bcrypt"

	//"gorm.io/gorm"

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

    Username  string    `json:"username"`
    Password  string    `json:"password"`
    Email     string    `json:"email"`
    FirstName string    `json:"first_name"`
    LastName  string    `json:"last_name"`
    BirthDay  string    `json:"birthday"`

   }

)


func HashPassword(password string) (string, error) {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    return string(hashedPassword), nil
}

func SignUp(c *gin.Context) {
    var payload signUp

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Hash password
    hashedPassword, err := HashPassword(payload.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    // Convert birthday from string to time.Time
    birthday, err := time.Parse("2006-01-02", payload.BirthDay)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format for birthday"})
        return
    }

    // Create member
    Member := entity.Member{
        Username:  payload.Username,
        Password:  hashedPassword,
        Email:     payload.Email,
        FirstName: payload.FirstName, // ใช้ฟิลด์ FirstName
        LastName:  payload.LastName,  // ใช้ฟิลด์ LastName
        Birthday:  birthday,
    }

    // Get DB instance
    db := config.DB()

    // Save member to the database
    if err := db.Create(&Member).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed. Please try again."})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Registration successful!"})
}


func SignIn(c *gin.Context) {

   var payload Login

   var user entity.Member


   if err := c.ShouldBindJSON(&payload); err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

       return

   }

   // ค้นหา user ด้วย Username ที่ผู้ใช้กรอกเข้ามา

   if err := config.DB().Raw("SELECT * FROM members WHERE email = ?", payload.Email).Scan(&user).Error; err != nil {

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