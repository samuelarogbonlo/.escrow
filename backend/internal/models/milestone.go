package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Milestone represents a payment milestone within an escrow agreement
type Milestone struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	EscrowID    uuid.UUID `gorm:"type:uuid;not null" json:"escrowId"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	Percentage  float64   `gorm:"not null" json:"percentage"`
	Amount      string    `gorm:"not null" json:"amount"`
	Status      string    `gorm:"not null;default:'pending'" json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	DeadlineAt  time.Time `json:"deadlineAt,omitempty"`
	CompletedAt time.Time `json:"completedAt,omitempty"`
}

// BeforeCreate is a GORM hook that runs before creating a new record
func (m *Milestone) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	m.CreatedAt = time.Now()
	m.UpdatedAt = time.Now()
	return nil
} 