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
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TaskLabelSelector from './TaskLabelSelector';

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
    start_date: task.start_date,
    end_date: task.end_date,
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TaskLabelSelector 
          taskId={task.id} 
          selectedLabelIds={task.labels?.map(l => l.id) || []}
          compact
        />
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setOpenEdit(true); handleMenuClose(); }}>
          編集
        </MenuItem>
        <MenuItem onClick={() => { deleteMutation.mutate(); handleMenuClose(); }}>
          削除
        </MenuItem>
      </Menu>
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>タスクの編集</DialogTitle>
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
              <SelectMenuItem value="High">High</SelectMenuItem>
              <SelectMenuItem value="Middle">Middle</SelectMenuItem>
              <SelectMenuItem value="Low">Low</SelectMenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>ステータス</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskInput['status'] })}
              label="ステータス"
            >
              <SelectMenuItem value="NotStarted">未着手</SelectMenuItem>
              <SelectMenuItem value="InProgress">着手</SelectMenuItem>
              <SelectMenuItem value="Completed">完了</SelectMenuItem>
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
          <Button onClick={() => setOpenEdit(false)}>キャンセル</Button>
          <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? '更新中...' : '更新'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}