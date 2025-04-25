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

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
}

export default function TaskForm({ open, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TaskInput>({
    name: '',
    description: '',
    priority: 'High',
    status: 'NotStarted',
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // タスク一覧を再取得
      onClose();
      setFormData({ name: '', description: '', priority: 'High', status: 'NotStarted' });
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
      <DialogTitle>Create Task</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          margin="dense"
          required
        />
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          margin="dense"
          multiline
          rows={4}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Priority</InputLabel>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskInput['priority'] })}
            label="Priority"
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Middle">Middle</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskInput['status'] })}
            label="Status"
          >
            <MenuItem value="NotStarted">Not Started</MenuItem>
            <MenuItem value="InProgress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}