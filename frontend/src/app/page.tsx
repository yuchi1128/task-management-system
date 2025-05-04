'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GridSortModel } from '@mui/x-data-grid';
import { getTasks } from '@/lib/api';
import {
  Container,
  Typography,
  Button,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import TaskForm from '@/components/TaskForm';
import TaskFilter from '@/components/TaskFilter';
import TaskSorter from '@/components/TaskSorter';
import TaskTable from '@/components/TaskTable';
import { getTaskColumns } from '@/lib/columns';
import { multiSort, filterTasks } from '@/lib/taskUtils';

export default function Home() {
  const [openForm, setOpenForm] = useState(false);
  const [searchParams, setSearchParams] = useState({
    name: '',
    description: '',
    priority: '',
    status: '',
    endDateFrom: null as Date | null,
    endDateTo: null as Date | null,
    labelIds: [] as number[],
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'priority', sort: 'asc' },
  ]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleResetFilters = () => {
    setSearchParams({
      name: '',
      description: '',
      priority: '',
      status: '',
      endDateFrom: null,
      endDateTo: null,
      labelIds: [],
    });
  };

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const handleSearchChange = (field: string, value: string | Date | null | number[]) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const sortableFields = [
    { value: 'priority', label: '優先度' },
    { value: 'end_date', label: '終了日' },
    { value: 'start_date', label: '開始日' },
  ];

  const handleAddSort = () => {
    const unused = sortableFields.find(
      (f) => !sortModel.some((s) => s.field === f.value)
    );
    if (unused) {
      setSortModel([...sortModel, { field: unused.value, sort: 'asc' }]);
    }
  };

  const handleRemoveSort = (idx: number) => {
    setSortModel(sortModel.filter((_, i) => i !== idx));
  };

  const handleSortFieldChange = (idx: number, field: string) => {
    const newModel = [...sortModel];
    newModel[idx].field = field;
    setSortModel(newModel);
  };

  const handleSortOrderChange = (idx: number, order: 'asc' | 'desc') => {
    const newModel = [...sortModel];
    newModel[idx].sort = order;
    setSortModel(newModel);
  };

  const filteredTasks = filterTasks(tasks, searchParams);
  const sortedTasks = multiSort(filteredTasks, sortModel);
  const paginatedTasks = sortedTasks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns = getTaskColumns(sortModel);

  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flex: 1, fontWeight: 'bold', fontSize: 25 }}>
          タスク一覧
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => setOpenForm(true)}
          sx={{ bgcolor: '#e0e0e0', fontSize: 14, py: 0.7, px: 2.5, minWidth: 0 }}
        >
          タスクを作成
        </Button>
      </Box>

      <TaskFilter 
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
        onResetFilters={handleResetFilters}
      />

      <TaskSorter
        sortModel={sortModel}
        sortableFields={sortableFields}
        onSortFieldChange={handleSortFieldChange}
        onSortOrderChange={handleSortOrderChange}
        onRemoveSort={handleRemoveSort}
        onAddSort={handleAddSort}
      />

      {error && <Typography color="error">Error: {error.message}</Typography>}
      {isLoading ? (
        <Typography>ローディング...</Typography>
      ) : (
        <TaskTable
          tasks={paginatedTasks}
          columns={columns}
          sortModel={sortModel}
          pageSize={pageSize}
          page={page}
          totalCount={filteredTasks.length}
          onSortModelChange={setSortModel}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      <TaskForm open={openForm} onClose={() => setOpenForm(false)} />
    </Container>
  );
}