package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/yuchi1128/task-management-system/backend/internal/handlers"
)

func main() {
	// PostgreSQLに接続
	db, err := sqlx.Connect("postgres", "user=user password=password dbname=taskdb host=db port=5432 sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	// ルーターを設定
	router := mux.NewRouter()
	taskHandler := handlers.NewTaskHandler(db)
	router.HandleFunc("/tasks", taskHandler.GetTasks).Methods("GET")
	router.HandleFunc("/tasks", taskHandler.CreateTask).Methods("POST")
	router.HandleFunc("/tasks/{id:[0-9]+}", taskHandler.GetTask).Methods("GET")
	router.HandleFunc("/tasks/{id:[0-9]+}", taskHandler.UpdateTask).Methods("PUT")
	router.HandleFunc("/tasks/{id:[0-9]+}", taskHandler.DeleteTask).Methods("DELETE")

	// サーバーを起動
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
