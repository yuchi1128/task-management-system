'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Popover,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import LabelIcon from '@mui/icons-material/Label';
import { getLabels, updateTaskLabels, Label } from '@/lib/api';

interface TaskLabelSelectorProps {
  taskId: number;
  selectedLabelIds: number[];
  compact?: boolean;
}

export default function TaskLabelSelector({ taskId, selectedLabelIds, compact = false }: TaskLabelSelectorProps) {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedLabelIds || []);
  
  const { data: labels, isLoading } = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  });
  
  const updateMutation = useMutation({
    mutationFn: (labelIds: number[]) => updateTaskLabels(taskId, labelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handleClose();
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (labelId: number) => {
    setSelectedIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSave = () => {
    updateMutation.mutate(selectedIds);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'label-popover' : undefined;

  return (
    <>
      <Button
        variant={compact ? "text" : "outlined"}
        startIcon={<LabelIcon />}
        onClick={handleClick}
        size={compact ? "small" : "medium"}
        sx={compact ? { minWidth: 0, p: 0.5 } : {}}
      >
        {compact ? '' : 'ラベル'}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>ラベルを選択</Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : labels && labels.length > 0 ? (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {labels.map((label: Label) => (
                <FormControlLabel
                  key={label.id}
                  control={
                    <Checkbox
                      checked={selectedIds.includes(label.id)}
                      onChange={() => handleToggle(label.id)}
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
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ラベルがありません
            </Typography>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>
              キャンセル
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              保存
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}