package entity

import (
    "gorm.io/gorm"
    
)

type ConditionRefun struct {
    gorm.Model
    AcceptedTerms bool
    Description string
	
}
