'use client';

import { Box, FormControl, MenuItem, Pagination, Select, SelectChangeEvent } from '@mui/material';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { Task } from '@/lib/api';

interface TaskTableProps {
  tasks: Task[];
  columns: GridColDef[];
  sortModel: GridSortModel;
  pageSize: number;
  page: number;
  totalCount: number;
  onSortModelChange: (model: GridSortModel) => void;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onPageSizeChange: (event: SelectChangeEvent<number>) => void;
}

export default function TaskTable({
  tasks,
  columns,
  sortModel,
  pageSize,
  page,
  totalCount,
  onSortModelChange,
  onPageChange,
  onPageSizeChange
}: TaskTableProps) {
  return (
    <>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          disableRowSelectionOnClick
          sortModel={sortModel.length > 0 ? [sortModel[0]] : []}
          onSortModelChange={onSortModelChange}
          hideFooter
          disableColumnMenu
        />
      </div>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: '80px' }}>
          <Select value={pageSize} onChange={onPageSizeChange} size="small">
            <MenuItem value={10}>10件</MenuItem>
            <MenuItem value={25}>25件</MenuItem>
            <MenuItem value={50}>50件</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(totalCount / pageSize)}
            page={page}
            onChange={onPageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>

        <Box sx={{ minWidth: '80px' }}></Box>
      </Box>
    </>
  );
}