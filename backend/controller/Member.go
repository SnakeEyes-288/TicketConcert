package controller

import (
	"net/http"
	//"time"
	//"gorm.io/gorm"
	"github.com/SnakeEyes-288/sa-67-example/config"
	"github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/gin-gonic/gin"
	//example.com/sa-67-example/entity
)


func CreateMember(c *gin.Context) {
    var user entity.Member

    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()

    hashedPassword, err := config.HashPassword(user.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    u := entity.Member{
        Username:  user.Username,
        Password:  hashedPassword,
        Email:     user.Email,
        FirstName: user.FirstName,
        LastName:  user.LastName,
        Birthday:  user.Birthday,
		PhoneNumber: user.PhoneNumber,
    }

    if err := db.Create(&u).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "Created success", "data": u})
}


// GET /users
// GET /user/:id
func GetUser(c *gin.Context) {
	ID := c.Param("id")
	var user entity.Member

	db := config.DB()
	results := db.First(&user, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GET /users
func ListUsers(c *gin.Context) {
	var users []entity.Member

	db := config.DB()
	results := db.Find(&users)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// DELETE /users/:id
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	if tx := db.Delete(&entity.Member{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}

// PATCH /users/:id
func UpdateUser(c *gin.Context) {
	var user entity.Member
	UserID := c.Param("id")

	db := config.DB()
	result := db.First(&user, UserID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	result = db.Save(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}
