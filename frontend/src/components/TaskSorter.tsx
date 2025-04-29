'use client';

import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  Button, 
  IconButton 
} from '@mui/material';
import { GridSortModel } from '@mui/x-data-grid';

interface SortableField {
  value: string;
  label: string;
}

interface TaskSorterProps {
  sortModel: GridSortModel;
  sortableFields: SortableField[];
  onSortFieldChange: (idx: number, field: string) => void;
  onSortOrderChange: (idx: number, order: 'asc' | 'desc') => void;
  onRemoveSort: (idx: number) => void;
  onAddSort: () => void;
}

export default function TaskSorter({
  sortModel,
  sortableFields,
  onSortFieldChange,
  onSortOrderChange,
  onRemoveSort,
  onAddSort
}: TaskSorterProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.7, fontSize: 15 }}>
        並び替え（左から優先度順）
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
        {sortModel.map((sort, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', minWidth: 16 }}>
              {idx + 1}.
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={sort.field}
                onChange={(e) => onSortFieldChange(idx, e.target.value)}
              >
                {sortableFields.map((f) => (
                  <MenuItem
                    key={f.value}
                    value={f.value}
                    disabled={sortModel.some(
                      (s, i) => s.field === f.value && i !== idx
                    )}
                  >
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 60 }}>
              <Select
                value={sort.sort}
                onChange={(e) =>
                  onSortOrderChange(idx, e.target.value as 'asc' | 'desc')
                }
              >
                <MenuItem value="asc">昇順</MenuItem>
                <MenuItem value="desc">降順</MenuItem>
              </Select>
            </FormControl>
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemoveSort(idx)}
            >
              <span style={{ fontWeight: 'bold' }}>×</span>
            </IconButton>
          </Box>
        ))}
        {sortModel.length < sortableFields.length && (
          <Button size="small" variant="outlined" onClick={onAddSort} sx={{ px: 1.5, fontSize: 13 }}>
            ＋条件追加
          </Button>
        )}
      </Box>
    </Box>
  );
}