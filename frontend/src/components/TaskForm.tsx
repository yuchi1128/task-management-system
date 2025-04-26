'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, TaskInput } from '@/lib/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
}

export default function TaskForm({ open, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TaskInput>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'High',
    status: 'NotStarted',
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
      setFormData({ name: '', description: '', start_date: '', end_date: '', priority: 'High', status: 'NotStarted' });
    },
    onError: (error) => {
      console.error('Error creating task:', error);
    },
  });

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>タスクの作成</DialogTitle>
      <DialogContent>
        <TextField
          label="タスク名"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          margin="dense"
          required
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>優先度</InputLabel>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskInput['priority'] })}
            label="優先度"
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Middle">Middle</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>ステータス</InputLabel>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskInput['status'] })}
            label="ステータス"
          >
            <MenuItem value="NotStarted">未着手</MenuItem>
            <MenuItem value="InProgress">着手</MenuItem>
            <MenuItem value="Completed">完了</MenuItem>
          </Select>
        </FormControl>
        <DatePicker
          label="開始日"
          value={formData.start_date ? new Date(formData.start_date) : null}
          onChange={(date) => setFormData({ ...formData, start_date: date ? date.toISOString() : '' })}
          slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
        />
        <DatePicker
          label="終了日"
          value={formData.end_date ? new Date(formData.end_date) : null}
          onChange={(date) => setFormData({ ...formData, end_date: date ? date.toISOString() : '' })}
          slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
        />
        <TextField
          label="説明文"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          margin="dense"
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? '作成中...' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}