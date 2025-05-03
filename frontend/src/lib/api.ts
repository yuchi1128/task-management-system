import axios, { AxiosInstance } from 'axios';

// バックエンドのベースURL
const API_BASE_URL = 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface LabelInput {
  name: string;
  color: string;
}

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
  labels?: Label[];
}

export interface TaskInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority: 'High' | 'Middle' | 'Low';
  status: 'NotStarted' | 'InProgress' | 'Completed';
}

// タスクのAPIメソッド
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data.tasks;
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

// ラベルのAPIメソッド
export const getLabels = async (): Promise<Label[]> => {
  const response = await api.get('/labels');
  return response.data.labels;
};

export const createLabel = async (label: LabelInput): Promise<void> => {
  await api.post('/labels', label);
};

export const getLabel = async (id: number): Promise<Label> => {
  const response = await api.get(`/labels/${id}`);
  return response.data;
};

export const updateLabel = async (id: number, label: LabelInput): Promise<void> => {
  await api.put(`/labels/${id}`, label);
};

export const deleteLabel = async (id: number): Promise<void> => {
  await api.delete(`/labels/${id}`);
};

// タスクにラベルを関連付ける
export const updateTaskLabels = async (taskId: number, labelIds: number[]): Promise<void> => {
  await api.put(`/tasks/${taskId}/labels`, { label_ids: labelIds });
};