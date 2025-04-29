import { Box } from '@mui/material';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { Task } from '@/lib/api';
import TaskActions from '@/components/TaskActions';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'yyyy/M/d');
  } catch {
    return dateString;
  }
};

export const getTaskColumns = (sortModel: GridSortModel): GridColDef[] => {
  return [
    {
      field: 'name',
      headerName: 'タスク名',
      width: 150,
      sortable: false,
    },
    {
      field: 'priority',
      headerName: '優先度',
      width: 100,
      sortable: true,
      renderHeader: () => {
        const sortIdx = sortModel.findIndex((s) => s.field === 'priority');
        const sort = sortModel[sortIdx];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            優先度
            {sort && (
              sort.sort === 'asc' ? (
                <ArrowUpwardIcon
                  fontSize="small"
                  color={sortIdx === 0 ? 'primary' : 'action'}
                />
              ) : (
                <ArrowDownwardIcon
                  fontSize="small"
                  color={sortIdx === 0 ? 'primary' : 'action'}
                />
              )
            )}
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'ステータス',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        switch (params.value) {
          case 'NotStarted':
            return '未着手';
          case 'InProgress':
            return '着手';
          case 'Completed':
            return '完了';
          default:
            return params.value;
        }
      },
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
        const sortIdx = sortModel.findIndex((s) => s.field === 'start_date');
        const sort = sortModel[sortIdx];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            開始日
            {sort && (
              sort.sort === 'asc' ? (
                <ArrowUpwardIcon
                  fontSize="small"
                  color={sortIdx === 0 ? 'primary' : 'action'}
                />
              ) : (
                <ArrowDownwardIcon
                  fontSize="small"
                  color={sortIdx === 0 ? 'primary' : 'action'}
                />
              )
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
        const sortIdx = sortModel.findIndex((s) => s.field === 'end_date');
        const sort = sortModel[sortIdx];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            終了日
            {sort && (
              sort.sort === 'asc' ? (
                <ArrowUpwardIcon
                  fontSize="small"
                  color={sortIdx === 0 ? 'primary' : 'action'}
                />
              ) : (
                <ArrowDownwardIcon
                  fontSize="small"
                  color={sortIdx === 0 ? 'primary' : 'action'}
                />
              )
            )}
          </Box>
        );
      },
    },
    {
      field: 'description',
      headerName: '説明文',
      width: 300,
      flex: 1,
      sortable: false,
    },
    {
      field: 'actions',
      headerName: 'アクション',
      width: 100,
      renderCell: (params) => <TaskActions task={params.row as Task} />,
      sortable: false,
    },
  ];
};