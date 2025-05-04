'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateTask, deleteTask, Task, TaskInput, getLabels, Label, updateTaskLabels } from '@/lib/api';
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
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TaskLabelSelector from './TaskLabelSelector';
import LabelIcon from '@mui/icons-material/Label';

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
  
  // ラベル選択用の状態を追加
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(
    task.labels?.map(l => l.id) || []
  );
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  
  // ラベル一覧を取得
  const { data: labels } = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TaskInput) => {
      // タスクを更新
      await updateTask(task.id, data);
      // ラベルを更新
      await updateTaskLabels(task.id, selectedLabelIds);
    },
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
  
  const handleToggleLabel = (labelId: number) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
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

          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer' 
              }}
              onClick={() => setShowLabelSelector(!showLabelSelector)}
            >
              <LabelIcon sx={{ mr: 1, fontSize: 20 }} />
              ラベル選択 {selectedLabelIds.length > 0 && `(${selectedLabelIds.length}件選択中)`}
            </Typography>
            
            {showLabelSelector && labels && (
              <Box sx={{ mt: 1, ml: 2, maxHeight: 150, overflow: 'auto' }}>
                {labels.map((label: Label) => (
                  <FormControlLabel
                    key={label.id}
                    control={
                      <Checkbox
                        checked={selectedLabelIds.includes(label.id)}
                        onChange={() => handleToggleLabel(label.id)}
                        sx={{
                          color: label.color,
                          '&.Mui-checked': {
                            color: label.color,
                          },
                        }}
                      />
                    }
                    label={label.name}
                  />
                ))}
                {labels.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ラベルがありません
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          
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