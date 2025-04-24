// package handlers

// import (
// 	"encoding/json"
// 	"fmt"
// 	"net/http"
// 	"strconv"

// 	"github.com/jmoiron/sqlx"
// 	"github.com/yuchi1128/task-management-system/backend/api"
// )

// type TaskHandler struct {
// 	db *sqlx.DB
// }

// func NewTaskHandler(db *sqlx.DB) *TaskHandler {
// 	return &TaskHandler{db: db}
// }

// // GetTasks はタスク一覧を取得します
// func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
// 	query := r.URL.Query()
// 	status := query.Get("status")
// 	name := query.Get("name")
// 	description := query.Get("description")
// 	page, _ := strconv.Atoi(query.Get("page"))
// 	if page < 1 {
// 		page = 1
// 	}
// 	limit := 10
// 	offset := (page - 1) * limit

// 	// SQLクエリを動的に構築
// 	sqlQuery := "SELECT * FROM tasks WHERE 1=1"
// 	var args []interface{}
// 	if status != "" {
// 		sqlQuery += fmt.Sprintf(" AND status = $%d", len(args)+1)
// 		args = append(args, status)
// 	}
// 	if name != "" {
// 		sqlQuery += fmt.Sprintf(" AND name ILIKE $%d", len(args)+1)
// 		args = append(args, "%"+name+"%")
// 	}
// 	if description != "" {
// 		sqlQuery += fmt.Sprintf(" AND description ILIKE $%d", len(args)+1)
// 		args = append(args, "%"+description+"%")
// 	}
// 	sqlQuery += fmt.Sprintf(" ORDER BY priority, end_date LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
// 	args = append(args, limit, offset)

// 	var tasks []api.Task
// 	err := h.db.Select(&tasks, sqlQuery, args...)
// 	if err != nil {
// 		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
// 		return
// 	}

// 	response := struct {
// 		Tasks []api.Task `json:"tasks"`
// 		Total int        `json:"total"`
// 	}{
// 		Tasks: tasks,
// 		Total: len(tasks),
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(response)
// }

// // CreateTask は新しいタスクを作成します
// func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
// 	var input api.TaskInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		http.Error(w, "Invalid request body", http.StatusBadRequest)
// 		return
// 	}

// 	_, err := h.db.Exec(
// 		"INSERT INTO tasks (name, description, start_date, end_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6)",
// 		input.Name, input.Description, input.StartDate, input.EndDate, input.Priority, input.Status,
// 	)
// 	if err != nil {
// 		http.Error(w, "Failed to create task", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusCreated)
// }

// // GetTask は指定したIDのタスクを取得します
// func (h *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
// 	idStr := r.URL.Path[len("/tasks/"):]
// 	id, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		http.Error(w, "Invalid task ID", http.StatusBadRequest)
// 		return
// 	}

// 	var task api.Task
// 	err = h.db.Get(&task, "SELECT * FROM tasks WHERE id = $1", id)
// 	if err != nil {
// 		http.Error(w, "Task not found", http.StatusNotFound)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(task)
// }

// // UpdateTask は指定したIDのタスクを更新します
// func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
// 	idStr := r.URL.Path[len("/tasks/"):]
// 	id, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		http.Error(w, "Invalid task ID", http.StatusBadRequest)
// 		return
// 	}

// 	var input api.TaskInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		http.Error(w, "Invalid request body", http.StatusBadRequest)
// 		return
// 	}

// 	_, err = h.db.Exec(
// 		"UPDATE tasks SET name = $1, description = $2, start_date = $3, end_date = $4, priority = $5, status = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7",
// 		input.Name, input.Description, input.StartDate, input.EndDate, input.Priority, input.Status, id,
// 	)
// 	if err != nil {
// 		http.Error(w, "Failed to update task", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// }

// // DeleteTask は指定したIDのタスクを削除します
// func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
// 	idStr := r.URL.Path[len("/tasks/"):]
// 	id, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		http.Error(w, "Invalid task ID", http.StatusBadRequest)
// 		return
// 	}

// 	_, err = h.db.Exec("DELETE FROM tasks WHERE id = $1", id)
// 	if err != nil {
// 		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
// 		return
// 	}

// 	w.WriteHeader(http.StatusNoContent)
// }

package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/jmoiron/sqlx"
	"github.com/yuchi1128/task-management-system/backend/api"
)

type TaskHandler struct {
	db *sqlx.DB
}

func NewTaskHandler(db *sqlx.DB) *TaskHandler {
	return &TaskHandler{db: db}
}

// GetTasks はタスク一覧を取得します
func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling GetTasks request")
	query := r.URL.Query()
	status := query.Get("status")
	name := query.Get("name")
	description := query.Get("description")
	page, _ := strconv.Atoi(query.Get("page"))
	if page < 1 {
		page = 1
	}
	limit := 10
	offset := (page - 1) * limit

	sqlQuery := "SELECT * FROM tasks WHERE 1=1"
	var args []interface{}
	if status != "" {
		sqlQuery += fmt.Sprintf(" AND status = $%d", len(args)+1)
		args = append(args, status)
	}
	if name != "" {
		sqlQuery += fmt.Sprintf(" AND name ILIKE $%d", len(args)+1)
		args = append(args, "%"+name+"%")
	}
	if description != "" {
		sqlQuery += fmt.Sprintf(" AND description ILIKE $%d", len(args)+1)
		args = append(args, "%"+description+"%")
	}
	sqlQuery += fmt.Sprintf(" ORDER BY priority, end_date LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	log.Printf("Executing query: %s with args: %v", sqlQuery, args)
	var tasks []api.Task
	err := h.db.Select(&tasks, sqlQuery, args...)
	if err != nil {
		log.Printf("Error fetching tasks: %v", err)
		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
		return
	}

	log.Printf("Fetched %d tasks", len(tasks))
	response := struct {
		Tasks []api.Task `json:"tasks"`
		Total int        `json:"total"`
	}{
		Tasks: tasks,
		Total: len(tasks),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CreateTask は新しいタスクを作成します
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling CreateTask request")
	var input api.TaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("Creating task: %+v", input)
	_, err := h.db.Exec(
		"INSERT INTO tasks (name, description, start_date, end_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6)",
		input.Name, input.Description, input.StartDate, input.EndDate, input.Priority, input.Status,
	)
	if err != nil {
		log.Printf("Error creating task: %v", err)
		http.Error(w, "Failed to create task", http.StatusInternalServerError)
		return
	}

	log.Println("Task created successfully")
	w.WriteHeader(http.StatusCreated)
}

// GetTask は指定したIDのタスクを取得します
func (h *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling GetTask request")
	idStr := r.URL.Path[len("/tasks/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid task ID: %v", err)
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	var task api.Task
	err = h.db.Get(&task, "SELECT * FROM tasks WHERE id = $1", id)
	if err != nil {
		log.Printf("Error fetching task: %v", err)
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// UpdateTask は指定したIDのタスクを更新します
func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling UpdateTask request")
	idStr := r.URL.Path[len("/tasks/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid task ID: %v", err)
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	var input api.TaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(
		"UPDATE tasks SET name = $1, description = $2, start_date = $3, end_date = $4, priority = $5, status = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7",
		input.Name, input.Description, input.StartDate, input.EndDate, input.Priority, input.Status, id,
	)
	if err != nil {
		log.Printf("Error updating task: %v", err)
		http.Error(w, "Failed to update task", http.StatusInternalServerError)
		return
	}

	log.Println("Task updated successfully")
	w.WriteHeader(http.StatusOK)
}

// DeleteTask は指定したIDのタスクを削除します
func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling DeleteTask request")
	idStr := r.URL.Path[len("/tasks/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid task ID: %v", err)
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec("DELETE FROM tasks WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting task: %v", err)
		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
		return
	}

	log.Println("Task deleted successfully")
	w.WriteHeader(http.StatusNoContent)
}
