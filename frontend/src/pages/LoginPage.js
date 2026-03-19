import React, { useState } from 'react';
import {
  Box, Card, Typography, TextField, Button, Alert, Tabs, Tab,
  InputAdornment, IconButton, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, School, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, signup as apiSignup } from '../services/api';
import { parchment } from '../theme';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    username: '', password: '', role: 'student', name: '', email: '', phone: '', department: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await apiLogin(loginForm.username, loginForm.password);
      loginUser(data.user, data.token);
      navigate('/dashboard');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await apiSignup(signupForm);
      loginUser(data.user, data.token);
      navigate('/dashboard');
    } catch (err) { setError(err.message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: parchment.bg, p: 2,
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"),
        radial-gradient(ellipse at 50% 30%, rgba(184,134,11,0.06) 0%, transparent 60%)
      `,
    }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
              <Box sx={{
                width: 52, height: 52, mx: 'auto', mb: 2, borderRadius: '3px',
                background: parchment.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 24px rgba(139,69,19,0.25)',
              }}>
                <School sx={{ color: '#FDFBF7', fontSize: 26 }} />
              </Box>
            </motion.div>
            <Typography variant="h3" sx={{ color: parchment.ink, fontSize: '2rem', mb: 0.5 }}>
              CampusCore
            </Typography>
            <Typography sx={{ color: parchment.inkLight, fontSize: '0.85rem' }}>
              College Management System
            </Typography>
          </Box>

          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} variant="fullWidth" sx={{
              bgcolor: '#F0EBE1',
              '& .MuiTab-root': { color: parchment.inkLight, fontWeight: 600, fontSize: '0.82rem', textTransform: 'none', py: 1.5 },
              '& .Mui-selected': { color: parchment.accent },
              '& .MuiTabs-indicator': { bgcolor: parchment.accent, height: 2 },
            }}>
              <Tab label="Sign In" />
              <Tab label="Create Account" />
            </Tabs>

            <Box sx={{ p: 3.5 }}>
              {error && (
                <Alert severity="error" sx={{
                  mb: 2, borderRadius: '3px', bgcolor: 'rgba(155,44,44,0.06)',
                  border: '1px solid rgba(155,44,44,0.15)', color: parchment.error,
                  '& .MuiAlert-icon': { color: parchment.error },
                }}>
                  {error}
                </Alert>
              )}

              {tab === 0 ? (
                <Box component="form" onSubmit={handleLogin}>
                  <TextField fullWidth label="Username" size="small" sx={{ mb: 2.5 }}
                    value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} autoComplete="username" />
                  <TextField fullWidth label="Password" size="small" sx={{ mb: 3 }}
                    type={showPass ? 'text' : 'password'}
                    value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: parchment.inkFaint }}>
                            {showPass ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }} />
                  <Button type="submit" fullWidth variant="contained" disabled={loading}
                    endIcon={<ArrowForward sx={{ fontSize: 15 }} />} sx={{ py: 1.2, fontSize: '0.88rem' }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSignup}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    <TextField fullWidth label="Full Name" size="small" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select value={signupForm.role} label="Role" onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="teacher">Teacher</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField fullWidth label="Username" size="small" sx={{ mb: 2.5 }}
                    value={signupForm.username} onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })} />
                  <TextField fullWidth label="Password" size="small" sx={{ mb: 2.5 }}
                    type={showPass ? 'text' : 'password'} value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: parchment.inkFaint }}>
                            {showPass ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }} />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    <TextField fullWidth label="Email" size="small" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
                    <TextField fullWidth label="Phone" size="small" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
                  </Box>
                  <TextField fullWidth label="Department" size="small" sx={{ mb: 3 }} value={signupForm.department} onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })} />
                  <Button type="submit" fullWidth variant="contained" disabled={loading}
                    endIcon={<ArrowForward sx={{ fontSize: 15 }} />} sx={{ py: 1.2, fontSize: '0.88rem' }}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </Box>
              )}
            </Box>
          </Card>

          <Typography sx={{ textAlign: 'center', mt: 3, color: parchment.inkFaint, fontSize: '0.7rem', fontStyle: 'italic' }}>
            CampusCore v3 · .NET + React
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
