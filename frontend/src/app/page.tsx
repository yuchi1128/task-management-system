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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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
          const fromTime = searchParams.endDateFrom.getTime();
          const toTime = searchParams.endDateTo.getTime();
          dateFilterPassed = taskEndDate >= fromTime && taskEndDate <= toTime;
        } else if (searchParams.endDateFrom) {
          dateFilterPassed = taskEndDate >= searchParams.endDateFrom.getTime();
        } else if (searchParams.endDateTo) {
          dateFilterPassed = taskEndDate <= searchParams.endDateTo.getTime();
        }
      } else {
        dateFilterPassed = false;
      }
    }
    
    return basicFiltersPassed && dateFilterPassed;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'タスク名',
      width: 150,
      sortable: true,
    },
    {
      field: 'priority',
      headerName: '優先度',
      width: 100,
      sortable: true,
      renderHeader: () => {
        const sortIdx = sortModel.findIndex(s => s.field === 'priority');
        const sort = sortModel[sortIdx];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            優先度
            {sort && (
              sort.sort === 'asc'
                ? <ArrowUpwardIcon fontSize="small" color={sortIdx === 0 ? "primary" : "action"} />
                : <ArrowDownwardIcon fontSize="small" color={sortIdx === 0 ? "primary" : "action"} />
            )}
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'ステータス',
      width: 100,
      sortable: true,
    },
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
      },
      renderHeader: () => {
        const sortIdx = sortModel.findIndex(s => s.field === 'start_date');
        const sort = sortModel[sortIdx];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            開始日
            {sort && (
              sort.sort === 'asc'
                ? <ArrowUpwardIcon fontSize="small" color={sortIdx === 0 ? "primary" : "action"} />
                : <ArrowDownwardIcon fontSize="small" color={sortIdx === 0 ? "primary" : "action"} />
            )}
          </Box>
        );
      },
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
      },
      renderHeader: () => {
        const sortIdx = sortModel.findIndex(s => s.field === 'end_date');
        const sort = sortModel[sortIdx];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            終了日
            {sort && (
              sort.sort === 'asc'
                ? <ArrowUpwardIcon fontSize="small" color={sortIdx === 0 ? "primary" : "action"} />
                : <ArrowDownwardIcon fontSize="small" color={sortIdx === 0 ? "primary" : "action"} />
            )}
          </Box>
        );
      },
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  // ソート可能なカラム
  const sortableFields = [
    { value: 'priority', label: '優先度' },
    { value: 'end_date', label: '終了日' },
    { value: 'start_date', label: '開始日' },
  ];

  // ソート条件を追加
  const handleAddSort = () => {
    // 未選択のフィールドを追加
    const unused = sortableFields.find(f => !sortModel.some(s => s.field === f.value));
    if (unused) {
      setSortModel([...sortModel, { field: unused.value, sort: 'asc' }]);
    }
  };

  // ソート条件を削除
  const handleRemoveSort = (idx: number) => {
    setSortModel(sortModel.filter((_, i) => i !== idx));
  };

  // ソート条件の順序を変更
  const handleMoveSort = (idx: number, dir: 'up' | 'down') => {
    const newModel = [...sortModel];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newModel.length) return;
    [newModel[idx], newModel[swapIdx]] = [newModel[swapIdx], newModel[idx]];
    setSortModel(newModel);
  };

  // ソート条件の変更
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

  // 多段ソート関数
  function multiSort(tasks: Task[], sortModel: GridSortModel) {
    return [...tasks].sort((a, b) => {
      for (const sort of sortModel) {
        let aValue = a[sort.field as keyof Task];
        let bValue = b[sort.field as keyof Task];

        // 日付フィールドはDateで比較
        if (sort.field === 'start_date' || sort.field === 'end_date') {
          aValue = aValue ? new Date(aValue as string).getTime() : 0;
          bValue = bValue ? new Date(bValue as string).getTime() : 0;
        }

        // 優先度はHigh > Middle > Lowで比較
        if (sort.field === 'priority') {
          const priorityOrder: Record<string, number> = { High: 3, Middle: 2, Low: 1 };
          aValue = priorityOrder[aValue as string] || 0;
          bValue = priorityOrder[bValue as string] || 0;
        }

        if (aValue < bValue) return sort.sort === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.sort === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // 表示用のデータをページネーションに合わせてスライス
  const sortedTasks = multiSort(filteredTasks, sortModel);
  const paginatedTasks = sortedTasks.slice(
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

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>並び替え条件</Typography>
        {sortModel.map((sort, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>カラム</InputLabel>
              <Select
                value={sort.field}
                label="カラム"
                onChange={e => handleSortFieldChange(idx, e.target.value)}
              >
                {sortableFields.map(f => (
                  <MenuItem
                    key={f.value}
                    value={f.value}
                    disabled={sortModel.some((s, i) => s.field === f.value && i !== idx)}
                  >
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>順序</InputLabel>
              <Select
                value={sort.sort}
                label="順序"
                onChange={e => handleSortOrderChange(idx, e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="asc">昇順</MenuItem>
                <MenuItem value="desc">降順</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" onClick={() => handleMoveSort(idx, 'up')} disabled={idx === 0}><ArrowUpwardIcon fontSize="small" /></Button>
            <Button size="small" onClick={() => handleMoveSort(idx, 'down')} disabled={idx === sortModel.length - 1}><ArrowDownwardIcon fontSize="small" /></Button>
            <Button size="small" color="error" onClick={() => handleRemoveSort(idx)}>削除</Button>
          </Box>
        ))}
        {sortModel.length < sortableFields.length && (
          <Button size="small" variant="outlined" onClick={handleAddSort}>条件を追加</Button>
        )}
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
              sortModel={sortModel.length > 0 ? [sortModel[0]] : []}
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