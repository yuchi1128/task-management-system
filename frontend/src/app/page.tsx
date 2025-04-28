'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { getTasks, Task } from '@/lib/api';
import { Container, Typography, Button, Box, TextField, FormControl, InputLabel, Select, MenuItem, Pagination, SelectChangeEvent } from '@mui/material';
import TaskForm from '@/components/TaskForm';
import TaskActions from '@/components/TaskActions';
import { format, parseISO } from 'date-fns';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { DatePicker } from '@mui/x-date-pickers';

export default function Home() {
  const [openForm, setOpenForm] = useState(false);
  const [searchParams, setSearchParams] = useState({
    name: '',
    description: '',
    priority: '',
    status: '',
    endDateFrom: null as Date | null,
    endDateTo: null as Date | null
  });
  
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'priority', sort: 'asc' }
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
      endDateTo: null
    });
  };

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

  const filteredTasks = tasks.filter(task => {
    const basicFiltersPassed = (
      (searchParams.name === '' || task.name.toLowerCase().includes(searchParams.name.toLowerCase())) &&
      (searchParams.description === '' || 
        (task.description && task.description.toLowerCase().includes(searchParams.description.toLowerCase()))) &&
      (searchParams.priority === '' || task.priority === searchParams.priority) &&
      (searchParams.status === '' || task.status === searchParams.status)
    );
    
    let dateFilterPassed = true;
    if (searchParams.endDateFrom || searchParams.endDateTo) {
      const taskEndDate = task.end_date ? new Date(task.end_date).getTime() : null;
      
      if (taskEndDate) {
        if (searchParams.endDateFrom && searchParams.endDateTo) {
          // 両方の日付が設定されている場合
          const fromTime = searchParams.endDateFrom.getTime();
          const toTime = searchParams.endDateTo.getTime();
          dateFilterPassed = taskEndDate >= fromTime && taskEndDate <= toTime;
        } else if (searchParams.endDateFrom) {
          // 開始日のみ設定
          dateFilterPassed = taskEndDate >= searchParams.endDateFrom.getTime();
        } else if (searchParams.endDateTo) {
          // 終了日のみ設定
          dateFilterPassed = taskEndDate <= searchParams.endDateTo.getTime();
        }
      } else {
        // タスクに終了日がなく、フィルターが設定されている場合は除外
        dateFilterPassed = false;
      }
    }
    
    return basicFiltersPassed && dateFilterPassed;
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'タスク名', width: 150, sortable: true },
    { field: 'priority', headerName: '優先度', width: 100, sortable: true },
    { field: 'status', headerName: 'ステータス', width: 100, sortable: true },
    { 
      field: 'start_date', 
      headerName: '開始日', 
      width: 100,
      renderCell: (params) => formatDate(params.value),
      sortable: true,
      sortComparator: (v1, v2) => {
        if (!v1 && !v2) return 0;
        if (!v1) return -1;
        if (!v2) return 1;
        return new Date(v1).getTime() - new Date(v2).getTime();
      }
    },
    { 
      field: 'end_date', 
      headerName: '終了日', 
      width: 100,
      renderCell: (params) => formatDate(params.value),
      sortable: true,
      sortComparator: (v1, v2) => {
        if (!v1 && !v2) return 0;
        if (!v1) return -1;
        if (!v2) return 1;
        return new Date(v1).getTime() - new Date(v2).getTime();
      }
    },
    { field: 'description', headerName: '説明文', width: 300, flex: 1, sortable: true },
    {
      field: 'actions',
      headerName: 'アクション',
      width: 100,
      renderCell: (params) => <TaskActions task={params.row as Task} />,
      sortable: false,
    },
  ];

  const handleSearchChange = (field: string, value: string | Date | null) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ページネーションの変更ハンドラー
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // ページサイズを変更するための関数
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPage(1); // ページサイズ変更時には1ページ目に戻る
  };
  
  // 表示用のデータをページネーションに合わせてスライス
  const paginatedTasks = filteredTasks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <TextField 
            label="タスク名で検索" 
            variant="outlined" 
            size="small"
            value={searchParams.name}
            onChange={(e) => handleSearchChange('name', e.target.value)}
            sx={{ flexGrow: 1, minWidth: '150px' }}
          />
          <TextField 
            label="説明文で検索" 
            variant="outlined" 
            size="small"
            value={searchParams.description}
            onChange={(e) => handleSearchChange('description', e.target.value)}
            sx={{ flexGrow: 1, minWidth: '150px' }}
          />
          <FormControl sx={{ minWidth: '120px' }} size="small">
            <InputLabel>優先度</InputLabel>
            <Select
              value={searchParams.priority}
              onChange={(e) => handleSearchChange('priority', e.target.value)}
              label="優先度"
            >
              <MenuItem value="">すべて</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Middle">Middle</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: '120px' }} size="small">
            <InputLabel>ステータス</InputLabel>
            <Select
              value={searchParams.status}
              onChange={(e) => handleSearchChange('status', e.target.value)}
              label="ステータス"
            >
              <MenuItem value="">すべて</MenuItem>
              <MenuItem value="NotStarted">未着手</MenuItem>
              <MenuItem value="InProgress">着手</MenuItem>
              <MenuItem value="Completed">完了</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <DatePicker
            label="終了日（から）"
            value={searchParams.endDateFrom}
            onChange={(date) => handleSearchChange('endDateFrom', date)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: '150px' }
              }
            }}
          />
          <DatePicker
            label="終了日（まで）"
            value={searchParams.endDateTo}
            onChange={(date) => handleSearchChange('endDateTo', date)}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: '150px' }
              }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: '200px' }}>
            <InputLabel>並び替え</InputLabel>
            <Select
              value={sortModel.length > 0 ? `${sortModel[0].field}:${sortModel[0].sort}` : ''}
              onChange={(e) => {
                const [field, sort] = e.target.value.split(':');
                setSortModel([{ field, sort: sort as 'asc' | 'desc' }]);
              }}
              label="並び替え"
            >
              <MenuItem value="priority:asc">優先度（昇順）</MenuItem>
              <MenuItem value="priority:desc">優先度（降順）</MenuItem>
              <MenuItem value="end_date:asc">終了日（早い順）</MenuItem>
              <MenuItem value="end_date:desc">終了日（遅い順）</MenuItem>
              <MenuItem value="start_date:asc">開始日（早い順）</MenuItem>
              <MenuItem value="start_date:desc">開始日（遅い順）</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleResetFilters}
            startIcon={<RestartAltIcon />}
          >
            フィルターをリセット
          </Button>
        </Box>
      </Box>

      {error && <Typography color="error">Error: {error.message}</Typography>}
      {isLoading ? (
        <Typography>ローディング...</Typography>
      ) : (
        <>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={paginatedTasks}
              columns={columns}
              disableRowSelectionOnClick
              sortModel={sortModel}
              onSortModelChange={(model) => setSortModel(model)}
              hideFooter // フッターを非表示にする
            />
          </div>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: '80px' }}>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                size="small"
              >
                <MenuItem value={10}>10件</MenuItem>
                <MenuItem value={25}>25件</MenuItem>
                <MenuItem value={50}>50件</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredTasks.length / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
            
            <Box sx={{ minWidth: '80px' }}></Box>
          </Box>
        </>
      )}
      <TaskForm open={openForm} onClose={() => setOpenForm(false)} />
    </Container>
  );
}