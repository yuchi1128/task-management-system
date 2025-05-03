package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
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

	// ラベルハンドラーを初期化し、ルーターに追加
	labelHandler := handlers.NewLabelHandler(db)
	router.HandleFunc("/labels", labelHandler.GetLabels).Methods("GET")
	router.HandleFunc("/labels", labelHandler.CreateLabel).Methods("POST")
	router.HandleFunc("/labels/{id:[0-9]+}", labelHandler.GetLabel).Methods("GET")
	router.HandleFunc("/labels/{id:[0-9]+}", labelHandler.UpdateLabel).Methods("PUT")
	router.HandleFunc("/labels/{id:[0-9]+}", labelHandler.DeleteLabel).Methods("DELETE")
	router.HandleFunc("/tasks/{id:[0-9]+}/labels", labelHandler.UpdateTaskLabels).Methods("PUT")

	// CORSミドルウェアを適用
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Accept", "Origin", "Authorization"},
		AllowCredentials: true,
	}).Handler(router)

	// サーバーを起動（CORSハンドラを使用）
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}
