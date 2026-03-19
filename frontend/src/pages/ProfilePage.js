import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, TextField, Button, Avatar, Grid, Chip,
  Alert, Divider, Stack,
} from '@mui/material';
import { Save, Person, Email, Phone, LocationOn, School, Badge } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMe, updateStudent } from '../services/api';
import { parchment } from '../theme';

export default function ProfilePage() {
  const { currentUser, refreshUser } = useAuth();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        department: currentUser.department || '',
        rollNo: currentUser.rollNo || '',
        division: currentUser.division || '',
        class: currentUser.class || '',
        semester: currentUser.semester || '',
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      await updateStudent(currentUser.id, form);
      await refreshUser();
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
    setLoading(false);
  };

  if (!currentUser) return null;

  const initials = (currentUser.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isStudent = currentUser.role === 'student';

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
      <Box sx={{ color: parchment.inkFaint, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: parchment.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 500, color: parchment.ink }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
          Profile
        </Typography>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>
          Your account information
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.15)', color: parchment.success, '& .MuiAlert-icon': { color: parchment.success } }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(155,44,44,0.06)', border: '1px solid rgba(155,44,44,0.15)', color: parchment.error, '& .MuiAlert-icon': { color: parchment.error } }}>{error}</Alert>}

      <Grid container spacing={2.5}>
        {/* Left: Info card */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{
                width: 72, height: 72, mx: 'auto', mb: 2, borderRadius: '3px',
                bgcolor: parchment.accent, color: '#FDFBF7', fontSize: '1.4rem', fontWeight: 800,
                fontFamily: '"Cormorant Garamond", serif',
                boxShadow: '0 4px 16px rgba(139,69,19,0.2)',
              }}>
                {initials}
              </Avatar>
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.3rem', color: parchment.ink, mb: 0.3 }}>
                {currentUser.name}
              </Typography>
              <Chip label={currentUser.role} size="small" sx={{
                bgcolor: 'rgba(139,69,19,0.08)', color: parchment.accent,
                fontWeight: 700, fontSize: '0.68rem', borderRadius: '2px',
                textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2,
              }} />
              <Chip label={currentUser.id} size="small" sx={{
                ml: 1, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600,
                fontSize: '0.68rem', bgcolor: 'rgba(44,24,16,0.04)', color: parchment.inkLight,
                borderRadius: '2px', mb: 2,
              }} />

              <Divider sx={{ my: 2 }} />

              <Stack spacing={0.5} sx={{ textAlign: 'left' }}>
                <InfoRow icon={<Email sx={{ fontSize: 16 }} />} label="Email" value={currentUser.email} />
                <InfoRow icon={<Phone sx={{ fontSize: 16 }} />} label="Phone" value={currentUser.phone} />
                <InfoRow icon={<LocationOn sx={{ fontSize: 16 }} />} label="Address" value={currentUser.address} />
                <InfoRow icon={<School sx={{ fontSize: 16 }} />} label="Department" value={currentUser.department} />
                {isStudent && <InfoRow icon={<Badge sx={{ fontSize: 16 }} />} label="Roll No" value={currentUser.rollNo} />}
                {isStudent && <InfoRow icon={<Person sx={{ fontSize: 16 }} />} label="Semester" value={currentUser.semester} />}
              </Stack>
            </Card>
          </motion.div>
        </Grid>

        {/* Right: Edit form */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: parchment.ink, mb: 0.5 }}>
                Edit Information
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: parchment.inkLight, mb: 3 }}>
                Update your personal details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" size="small" value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" size="small" value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" size="small" value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Department" size="small" value={form.department || ''}
                    onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" size="small" value={form.address || ''}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Grid>
                {isStudent && (
                  <>
                    <Grid item xs={6} sm={3}>
                      <TextField fullWidth label="Roll No" size="small" value={form.rollNo || ''}
                        onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField fullWidth label="Division" size="small" value={form.division || ''}
                        onChange={(e) => setForm({ ...form, division: e.target.value })} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField fullWidth label="Class" size="small" value={form.class || ''}
                        onChange={(e) => setForm({ ...form, class: e.target.value })} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField fullWidth label="Semester" size="small" type="number" value={form.semester || ''}
                        onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || '' })} />
                    </Grid>
                  </>
                )}
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained" onClick={handleSave} disabled={loading}
                  startIcon={<Save sx={{ fontSize: 16 }} />}
                  sx={{ fontSize: '0.82rem' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
