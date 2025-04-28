'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getTasks, Task } from '@/lib/api';
import { Container, Typography, Button } from '@mui/material';
import TaskForm from '@/components/TaskForm';
import TaskActions from '@/components/TaskActions';
import { format, parseISO } from 'date-fns';

export default function Home() {
  const [openForm, setOpenForm] = useState(false);

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'yyyy/M/d');
    } catch {
      return dateString;
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'タスク名', width: 150 },
    { field: 'priority', headerName: '優先度', width: 100 },
    { field: 'status', headerName: 'ステータス', width: 100 },
    { 
      field: 'start_date', 
      headerName: '開始日', 
      width: 100,
      renderCell: (params) => formatDate(params.value)
    },
    { 
      field: 'end_date', 
      headerName: '終了日', 
      width: 100,
      renderCell: (params) => formatDate(params.value)
    },
    { field: 'description', headerName: '説明文', width: 300, flex: 1 },
    {
      field: 'actions',
      headerName: 'アクション',
      width: 100,
      renderCell: (params) => <TaskActions task={params.row as Task} />,
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        TODOアプリ
      </Typography>
      <Button
        variant="contained"
        color="inherit"
        onClick={() => setOpenForm(true)}
        sx={{ mb: 2, bgcolor: '#e0e0e0' }}
      >
        タスクを作成
      </Button>
      {error && <Typography color="error">Error: {error.message}</Typography>}
      {isLoading ? (
        <Typography>ローディング...</Typography>
      ) : (
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={tasks}
            columns={columns}
            pageSizeOptions={[10]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </div>
      )}
      <TaskForm open={openForm} onClose={() => setOpenForm(false)} />
    </Container>
  );
}