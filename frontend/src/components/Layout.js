import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Avatar, IconButton, Chip, Divider, Tooltip,
} from '@mui/material';
import {
  Dashboard, People, MenuBook, Grading, EventNote, Campaign,
  Logout, Menu as MenuIcon, School, EmojiEvents, Person,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';

const drawerWidth = 250;

const navItems = {
  student: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { label: 'My Courses', icon: <MenuBook />, path: '/courses' },
    { label: 'Grades', icon: <Grading />, path: '/grades' },
    { label: 'Attendance', icon: <EventNote />, path: '/attendance' },
    { label: 'Leaderboard', icon: <EmojiEvents />, path: '/leaderboard' },
    { label: 'Announcements', icon: <Campaign />, path: '/announcements' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ],
  teacher: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { label: 'My Courses', icon: <MenuBook />, path: '/courses' },
    { label: 'Students', icon: <People />, path: '/students' },
    { label: 'Grading', icon: <Grading />, path: '/grades' },
    { label: 'Attendance', icon: <EventNote />, path: '/attendance' },
    { label: 'Leaderboard', icon: <EmojiEvents />, path: '/leaderboard' },
    { label: 'Announcements', icon: <Campaign />, path: '/announcements' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ],
  admin: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { label: 'Students', icon: <People />, path: '/students' },
    { label: 'Courses', icon: <MenuBook />, path: '/courses' },
    { label: 'Grades', icon: <Grading />, path: '/grades' },
    { label: 'Attendance', icon: <EventNote />, path: '/attendance' },
    { label: 'Leaderboard', icon: <EmojiEvents />, path: '/leaderboard' },
    { label: 'Announcements', icon: <Campaign />, path: '/announcements' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ],
};

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) { navigate('/'); return null; }

  const items = navItems[currentUser.role] || [];
  const initials = (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const handleLogout = () => { logout(); navigate('/'); };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: parchment.sidebar }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '3px',
          background: parchment.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(184,134,11,0.3)',
        }}>
          <School sx={{ color: '#FDFBF7', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{
            color: '#F5F0E8', fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.1, letterSpacing: '-0.01em',
          }}>
            CampusCore
          </Typography>
          <Typography sx={{ color: 'rgba(245,240,232,0.35)', fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Management System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(245,240,232,0.06)', mx: 2 }} />

      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {items.map((item, i) => {
          const active = location.pathname === item.path || (item.path === '/courses' && location.pathname.startsWith('/course/'));
          return (
            <motion.div key={item.path} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: '3px', mb: 0.3, px: 2, py: 0.9,
                  bgcolor: active ? 'rgba(184,134,11,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid' : '2px solid transparent',
                  borderLeftColor: active ? parchment.gold : 'transparent',
                  '&:hover': { bgcolor: active ? 'rgba(184,134,11,0.15)' : 'rgba(245,240,232,0.04)' },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ color: active ? parchment.gold : 'rgba(245,240,232,0.3)', minWidth: 34 }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 19 } })}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{
                  fontWeight: active ? 700 : 500, fontSize: '0.8rem',
                  color: active ? '#F5F0E8' : 'rgba(245,240,232,0.55)', letterSpacing: '0.01em',
                }} />
              </ListItemButton>
            </motion.div>
          );
        })}
      </List>

      {/* User */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(245,240,232,0.06)', mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{
            width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700,
            bgcolor: parchment.gold, color: '#FDFBF7', borderRadius: '3px',
          }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography sx={{
              color: '#F5F0E8', fontWeight: 600, fontSize: '0.78rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {currentUser.name}
            </Typography>
            <Chip label={currentUser.role} size="small" sx={{
              height: 18, fontSize: '0.58rem', fontWeight: 700,
              bgcolor: 'rgba(184,134,11,0.15)', color: parchment.gold,
              borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.06em',
            }} />
          </Box>
        </Box>
        <Tooltip title="Sign out">
          <IconButton onClick={handleLogout} sx={{
            color: 'rgba(245,240,232,0.35)', width: '100%', borderRadius: '3px', py: 0.7,
            bgcolor: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.06)',
            '&:hover': { color: '#E8913A', borderColor: 'rgba(232,145,58,0.2)', bgcolor: 'rgba(232,145,58,0.05)' },
            transition: 'all 0.2s ease',
          }}>
            <Logout sx={{ fontSize: 15, mr: 1 }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Sign Out</Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={0} sx={{
        display: { md: 'none' }, bgcolor: parchment.sidebar,
        borderBottom: '1px solid rgba(245,240,232,0.08)',
      }}>
        <Toolbar sx={{ minHeight: 52 }}>
          <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
            <MenuIcon sx={{ color: '#F5F0E8' }} />
          </IconButton>
          <School sx={{ color: parchment.gold, fontSize: 20, mr: 1 }} />
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1rem', color: '#F5F0E8' }}>CampusCore</Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: 0 }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' },
        }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', borderRight: '1px solid rgba(44,24,16,0.06)' },
        }}>{drawer}</Drawer>
      </Box>

      <Box component="main" sx={{
        flexGrow: 1, p: { xs: 2, md: 3.5 }, mt: { xs: '52px', md: 0 },
        maxWidth: { md: `calc(100% - ${drawerWidth}px)` },
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
