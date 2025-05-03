package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/jmoiron/sqlx"
	"github.com/yuchi1128/task-management-system/backend/api"
)

type LabelHandler struct {
	db *sqlx.DB
}

func NewLabelHandler(db *sqlx.DB) *LabelHandler {
	return &LabelHandler{db}
}

// ラベル一覧を取得
func (h *LabelHandler) GetLabels(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling GetLabels request")

	var labels []api.Label
	err := h.db.Select(&labels, "SELECT * FROM labels ORDER BY name")
	if err != nil {
		log.Printf("Error fetching labels: %v", err)
		http.Error(w, "Failed to fetch labels", http.StatusInternalServerError)
		return
	}

	response := struct {
		Labels []api.Label `json:"labels"`
	}{
		Labels: labels,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// 新しいラベルを作成
func (h *LabelHandler) CreateLabel(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling CreateLabel request")
	var input api.LabelInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var labelID int
	err := h.db.QueryRow(
		"INSERT INTO labels (name, color) VALUES ($1, $2) RETURNING id",
		input.Name, input.Color,
	).Scan(&labelID)

	if err != nil {
		log.Printf("Error creating label: %v", err)
		http.Error(w, "Failed to create label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// IDのラベルを取得
func (h *LabelHandler) GetLabel(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling GetLabel request")
	idStr := r.URL.Path[len("/labels/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid label ID: %v", err)
		http.Error(w, "Invalid label ID", http.StatusBadRequest)
		return
	}

	var label api.Label
	err = h.db.Get(&label, "SELECT * FROM labels WHERE id = $1", id)
	if err != nil {
		log.Printf("Error fetching label: %v", err)
		http.Error(w, "Label not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(label)
}

// 指定したIDのラベルを更新
func (h *LabelHandler) UpdateLabel(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling UpdateLabel request")
	idStr := r.URL.Path[len("/labels/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid label ID: %v", err)
		http.Error(w, "Invalid label ID", http.StatusBadRequest)
		return
	}

	var input api.LabelInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(
		"UPDATE labels SET name = $1, color = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		input.Name, input.Color, id,
	)
	if err != nil {
		log.Printf("Error updating label: %v", err)
		http.Error(w, "Failed to update label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// 指定したIDのラベルを削除
func (h *LabelHandler) DeleteLabel(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling DeleteLabel request")
	idStr := r.URL.Path[len("/labels/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid label ID: %v", err)
		http.Error(w, "Invalid label ID", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec("DELETE FROM labels WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting label: %v", err)
		http.Error(w, "Failed to delete label", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// タスクに関連付けられたラベルを更新
func (h *LabelHandler) UpdateTaskLabels(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling UpdateTaskLabels request")

	// タスクID取得
	pathParts := r.URL.Path[len("/tasks/"):]
	taskIDStr := pathParts[:len(pathParts)-len("/labels")]
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		log.Printf("Invalid task ID: %v", err)
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	// リクエストボディ取得
	var input struct {
		LabelIDs []int `json:"label_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// トランザクション開始
	tx, err := h.db.Beginx()
	if err != nil {
		log.Printf("Error starting transaction: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// 既存のラベル関連を削除
	_, err = tx.Exec("DELETE FROM task_labels WHERE task_id = $1", taskID)
	if err != nil {
		log.Printf("Error deleting task labels: %v", err)
		http.Error(w, "Failed to update task labels", http.StatusInternalServerError)
		return
	}

	// 新しいラベル関連を追加
	for _, labelID := range input.LabelIDs {
		_, err = tx.Exec("INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)", taskID, labelID)
		if err != nil {
			log.Printf("Error inserting task label: %v", err)
			http.Error(w, "Failed to update task labels", http.StatusInternalServerError)
			return
		}
	}

	// トランザクション確定
	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		http.Error(w, "Failed to update task labels", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
