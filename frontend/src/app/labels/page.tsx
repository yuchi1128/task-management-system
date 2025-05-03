'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getLabels, createLabel, updateLabel, deleteLabel, Label, LabelInput } from '@/lib/api';

export default function LabelsPage() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [formData, setFormData] = useState<LabelInput>({
    name: '',
    color: '#2196F3',
  });

  // ラベル一覧を取得
  const { data: labels, isLoading, error } = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  });

  // ラベル作成
  const createMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      handleCloseDialog();
    },
  });

  // ラベル更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LabelInput }) => updateLabel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      handleCloseDialog();
    },
  });

  // ラベル削除
  const deleteMutation = useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });

  const handleOpenDialog = (label?: Label) => {
    if (label) {
      setEditingLabel(label);
      setFormData({
        name: label.name,
        color: label.color,
      });
    } else {
      setEditingLabel(null);
      setFormData({
        name: '',
        color: '#2196F3',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLabel(null);
    setFormData({
      name: '',
      color: '#2196F3',
    });
  };

  const handleSubmit = () => {
    if (editingLabel) {
      updateMutation.mutate({ id: editingLabel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('このラベルを削除してもよろしいですか？')) {
      deleteMutation.mutate(id);
    }
  };

  const colorOptions = [
    '#F44336', // 赤
    '#FF9800', // オレンジ
    '#FFEB3B', // 黄色
    '#4CAF50', // 緑
    '#2196F3', // 青
    '#9C27B0', // 紫
    '#795548', // 茶色
    '#607D8B', // グレー
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ラベル管理
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#e0e0e0', color: '#171717', '&:hover': { bgcolor: '#d0d0d0' } }}
        >
          新規ラベル作成
        </Button>
      </Box>

      {isLoading ? (
        <Typography>ローディング...</Typography>
      ) : error ? (
        <Typography color="error">エラーが発生しました</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {labels && labels.map((label) => (
            <Box 
              key={label.id} 
              sx={{ 
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 10.67px)' } 
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: label.color,
                      mr: 1,
                    }}
                  />
                  <Typography>{label.name}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenDialog(label)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(label.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingLabel ? 'ラベルの編集' : 'ラベルの作成'}</DialogTitle>
        <DialogContent>
          <TextField
            label="ラベル名"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="dense"
            required
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>色の選択</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '2px solid #000' : 'none',
                  }}
                />
              ))}
            </Box>
            <TextField
              type="color"
              label="カスタムカラー"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              fullWidth
              margin="dense"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingLabel ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}