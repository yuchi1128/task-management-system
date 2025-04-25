import axios, { AxiosInstance } from 'axios';

// バックエンドのベースURL
const API_BASE_URL = 'http://localhost:8080';

// Axiosインスタンスを作成
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// タスクの型定義（バックエンドのapi.Taskと一致）
export interface Task {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: 'High' | 'Middle' | 'Low';
  status: 'NotStarted' | 'InProgress' | 'Completed';
  created_at: string;
  updated_at: string;
}

// タスク作成・更新用の入力型
export interface TaskInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority: 'High' | 'Middle' | 'Low';
  status: 'NotStarted' | 'InProgress' | 'Completed';
}

// APIメソッド
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data.tasks; // バックエンドは { tasks: Task[], total: number } を返す
};

export const createTask = async (task: TaskInput): Promise<void> => {
  await api.post('/tasks', task);
};

export const getTask = async (id: number): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const updateTask = async (id: number, task: TaskInput): Promise<void> => {
  await api.put(`/tasks/${id}`, task);
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};