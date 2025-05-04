'use client';

import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <AppBar position="static" sx={{ bgcolor: '#fff', color: '#171717', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <Typography variant="h4" sx={{ flex: 1, fontWeight: 'bold', fontSize: 27 }}>
          TODOアプリ
        </Typography>
        <Button 
          color="inherit"
          onClick={() => router.push('/')}
          sx={{ 
            mx: 1,
            fontWeight: pathname === '/' ? 'bold' : 'normal',
            borderBottom: pathname === '/' ? '2px solid #171717' : 'none'
          }}
        >
          タスク一覧
        </Button>
        <Button 
          color="inherit"
          onClick={() => router.push('/labels')}
          sx={{ 
            mx: 1,
            fontWeight: pathname === '/labels' ? 'bold' : 'normal',
            borderBottom: pathname === '/labels' ? '2px solid #171717' : 'none'
          }}
        >
          ラベル管理
        </Button>
      </Toolbar>
    </AppBar>
  );
}