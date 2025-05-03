'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createTask, TaskInput, getLabels, Label } from '@/lib/api';
import LabelIcon from '@mui/icons-material/Label';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
}

export default function TaskForm({ open, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TaskInput>({
    name: '',
    description: '',
    priority: 'Middle',
    status: 'NotStarted',
    start_date: '',
    end_date: '',
  });
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [showLabelSelector, setShowLabelSelector] = useState(false);

  // ラベル一覧を取得
  const { data: labels } = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await createTask(formData, selectedLabelIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormData({
        name: '',
        description: '',
        priority: 'Middle',
        status: 'NotStarted',
        start_date: '',
        end_date: '',
      });
      setSelectedLabelIds([]);
      onClose();
    },
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  const handleToggleLabel = (labelId: number) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>新規タスク作成</DialogTitle>
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
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? '作成中...' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}