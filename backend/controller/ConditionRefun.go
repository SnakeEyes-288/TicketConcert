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

func ListCondition(c *gin.Context) {
	var concerts []entity.ConditionRefun

	db := config.DB()
	if err := db.Find(&concerts).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบให้แน่ใจว่าวันที่อยู่ในรูปแบบที่ถูกต้อง
	c.JSON(http.StatusOK, concerts)
}

// CreateConditionRefun สร้างเงื่อนไขการคืนเงินใหม่
func CreateConditionRefun(c *gin.Context) {
    var conditionRefun entity.ConditionRefun
    if err := c.ShouldBindJSON(&conditionRefun); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	db := config.DB()

    if err := db.Create(&conditionRefun).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": conditionRefun})
}

