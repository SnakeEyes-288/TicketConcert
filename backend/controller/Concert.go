package controller

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/SnakeEyes-288/sa-67-example/entity"
	"github.com/SnakeEyes-288/sa-67-example/config"
	//"github.com/SnakeEyes-288/sa-67-example/controller"
)

//func ListConcerts(c *gin.Context) {
    //var concerts []entity.Concert
	//DB := config.DB()
    //if err := entity.Concert().Find(&concerts).Error; err != nil {
        //c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        //return
    //}
    //c.JSON(http.StatusOK, gin.H{"data": concerts})
//}

func ListConcerts(c *gin.Context) {
	var concerts []entity.Concert

	db := config.DB()
	if err := db.Find(&concerts).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบให้แน่ใจว่าวันที่อยู่ในรูปแบบที่ถูกต้อง
	c.JSON(http.StatusOK, concerts)
}


func GetConcerts(c *gin.Context) {
    var concerts []entity.Concert
    if err := config.DB().Find(&concerts).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, concerts)
}

