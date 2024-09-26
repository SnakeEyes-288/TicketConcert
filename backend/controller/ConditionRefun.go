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
	var condition entity.ConditionRefun // เปลี่ยนจาก []entity.ConditionRefun เป็น entity.ConditionRefun เพื่อรับค่าแถวเดียว

	db := config.DB()
	// ใช้คำสั่ง First แทน Find เพื่อดึงข้อมูลแถวแรกมาเพียงแถวเดียว
	if err := db.First(&condition).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่ได้กลับไป
	c.JSON(http.StatusOK, condition)
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

