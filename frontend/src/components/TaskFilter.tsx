'use client';

import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useQuery } from '@tanstack/react-query';
import { getLabels, Label } from '@/lib/api';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

interface SearchParams {
  name: string;
  description: string;
  priority: string;
  status: string;
  endDateFrom: Date | null;
  endDateTo: Date | null;
  labelIds?: number[];
}

interface TaskFilterProps {
  searchParams: SearchParams;
  onSearchChange: (field: string, value: string | Date | null | number[]) => void;
  onResetFilters: () => void;
}

export default function TaskFilter({ 
  searchParams, 
  onSearchChange, 
  onResetFilters 
}: TaskFilterProps) {
  const { data: labels = [] } = useQuery({ queryKey: ['labels'], queryFn: getLabels });

  const handleLabelToggle = (labelId: number) => {
    const prev = searchParams.labelIds || [];
    if (prev.includes(labelId)) {
      onSearchChange('labelIds', prev.filter(id => id !== labelId));
    } else {
      onSearchChange('labelIds', [...prev, labelId]);
    }
  };

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.7, fontSize: 15 }}>
        条件で検索
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 0.7,
          border: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
          borderRadius: 2,
          p: 1.2,
        }}
      >
        <TextField
          placeholder="タスク名"
          size="small"
          value={searchParams.name}
          onChange={(e) => onSearchChange('name', e.target.value)}
          sx={{ minWidth: 120, flex: 1 }}
        />
        <TextField
          placeholder="説明文"
          size="small"
          value={searchParams.description}
          onChange={(e) => onSearchChange('description', e.target.value)}
          sx={{ minWidth: 120, flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={searchParams.priority}
            onChange={(e) => onSearchChange('priority', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">優先度</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Middle">Middle</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={searchParams.status}
            onChange={(e) => onSearchChange('status', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">ステータス</MenuItem>
            <MenuItem value="NotStarted">未着手</MenuItem>
            <MenuItem value="InProgress">着手</MenuItem>
            <MenuItem value="Completed">完了</MenuItem>
          </Select>
        </FormControl>
        <DatePicker
          label={null}
          value={searchParams.endDateFrom}
          onChange={(date) => onSearchChange('endDateFrom', date)}
          slotProps={{
            textField: {
              size: 'small',
              placeholder: '終了日(から)',
              sx: { minWidth: 90 },
            },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#888' }}>〜</Typography>
        </Box>
        <DatePicker
          label={null}
          value={searchParams.endDateTo}
          onChange={(date) => onSearchChange('endDateTo', date)}
          slotProps={{
            textField: {
              size: 'small',
              placeholder: '終了日(まで)',
              sx: { minWidth: 90 },
            },
          }}
        />
        <FormGroup row sx={{ alignItems: 'center', minWidth: 180 }}>
          <Typography variant="body2" sx={{ mr: 1, color: '#888' }}>ラベル:</Typography>
          {labels.map((label: Label) => (
            <FormControlLabel
              key={label.id}
              control={
                <Checkbox
                  checked={searchParams.labelIds?.includes(label.id) || false}
                  onChange={() => handleLabelToggle(label.id)}
                  sx={{
                    color: label.color,
                    '&.Mui-checked': { color: label.color },
                  }}
                />
              }
              label={label.name}
            />
          ))}
        </FormGroup>
        <Button
          variant="outlined"
          size="small"
          onClick={onResetFilters}
          startIcon={<RestartAltIcon />}
          sx={{ whiteSpace: 'nowrap', px: 1.5, fontSize: 13 }}
        >
          リセット
        </Button>
      </Box>
    </Box>
  );
}