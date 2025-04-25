'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask, deleteTask, Task, TaskInput } from '@/lib/api';
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem as SelectMenuItem,
  InputLabel,
  FormControl,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface TaskActionsProps {
  task: Task;
}

export default function TaskActions({ task }: TaskActionsProps) {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [formData, setFormData] = useState<TaskInput>({
    name: task.name,
    description: task.description,
    priority: task.priority,
    status: task.status,
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskInput) => updateTask(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setOpenEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditSubmit = () => {
    updateMutation.mutate(formData);
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setOpenEdit(true); handleMenuClose(); }}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { deleteMutation.mutate(); handleMenuClose(); }}>
          Delete
        </MenuItem>
      </Menu>
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Task</DialogTitle>
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
              <SelectMenuItem value="High">High</SelectMenuItem>
              <SelectMenuItem value="Middle">Middle</SelectMenuItem>
              <SelectMenuItem value="Low">Low</SelectMenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskInput['status'] })}
              label="Status"
            >
              <SelectMenuItem value="NotStarted">Not Started</SelectMenuItem>
              <SelectMenuItem value="InProgress">In Progress</SelectMenuItem>
              <SelectMenuItem value="Completed">Completed</SelectMenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}