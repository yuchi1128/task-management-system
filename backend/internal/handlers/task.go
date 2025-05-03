package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/yuchi1128/task-management-system/backend/api"
)

type TaskEntity struct {
	ID          int       `db:"id"`
	Name        string    `db:"name"`
	Description string    `db:"description"`
	StartDate   time.Time `db:"start_date"`
	EndDate     time.Time `db:"end_date"`
	Priority    string    `db:"priority"`
	Status      string    `db:"status"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

func (e TaskEntity) ToAPITask() api.Task {
	id := int(e.ID)
	return api.Task{
		Id:          &id,
		Name:        &e.Name,
		Description: &e.Description,
		StartDate:   &e.StartDate,
		EndDate:     &e.EndDate,
		Priority:    (*api.TaskPriority)(&e.Priority),
		Status:      (*api.TaskStatus)(&e.Status),
		CreatedAt:   &e.CreatedAt,
		UpdatedAt:   &e.UpdatedAt,
	}
}

type TaskHandler struct {
	db *sqlx.DB
}

func NewTaskHandler(db *sqlx.DB) *TaskHandler {
	return &TaskHandler{db: db}
}

// タスク一覧を取得
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
	limit := 1000
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

	var taskEntities []TaskEntity
	err := h.db.Select(&taskEntities, sqlQuery, args...)
	if err != nil {
		log.Printf("Error fetching tasks: %v", err)
		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
		return
	}

	var tasks []api.Task
	for _, entity := range taskEntities {
		task := entity.ToAPITask()

		var labels []api.Label
		query := `
			SELECT l.* FROM labels l
			JOIN task_labels tl ON l.id = tl.label_id
			WHERE tl.task_id = $1
			ORDER BY l.name
		`
		err := h.db.Select(&labels, query, *task.Id)
		if err != nil {
			log.Printf("Error fetching labels for task %d: %v", *task.Id, err)
		} else {
			task.Labels = labels
		}

		tasks = append(tasks, task)
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

// タスクを作成
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling CreateTask request")
	var input api.TaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("Creating task: %+v", input)

	var taskID int
	err := h.db.QueryRow(
		"INSERT INTO tasks (name, description, start_date, end_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
		input.Name, input.Description, input.StartDate, input.EndDate, input.Priority, input.Status,
	).Scan(&taskID)

	if err != nil {
		log.Printf("Error creating task: %v", err)
		http.Error(w, "Failed to create task", http.StatusInternalServerError)
		return
	}

	log.Printf("Task created successfully with ID: %d", taskID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": taskID,
	})
}

// タスクのラベルを更新
func (h *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling GetTask request")
	idStr := r.URL.Path[len("/tasks/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid task ID: %v", err)
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	var taskEntity TaskEntity
	err = h.db.Get(&taskEntity, "SELECT * FROM tasks WHERE id = $1", id)
	if err != nil {
		log.Printf("Error fetching task: %v", err)
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	task := taskEntity.ToAPITask()

	// タスク取得後、ラベル情報も取得
	var labels []api.Label
	query := `
        SELECT l.* FROM labels l
        JOIN task_labels tl ON l.id = tl.label_id
        WHERE tl.task_id = $1
        ORDER BY l.name
    `
	err = h.db.Select(&labels, query, id)
	if err == nil {
		task.Labels = labels
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

// タスクを削除
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
