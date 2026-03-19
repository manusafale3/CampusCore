import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Chip, Stack, Button, TextField, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  Select, MenuItem, InputLabel, IconButton, Tooltip,
} from '@mui/material';
import { Campaign, Add, Delete, PriorityHigh, Info, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../services/api';

const pConfig = {
  high: { icon: <PriorityHigh sx={{ fontSize: 15 }} />, color: parchment.error, label: 'Urgent' },
  medium: { icon: <Info sx={{ fontSize: 15 }} />, color: parchment.warning, label: 'Important' },
  low: { icon: <CheckCircle sx={{ fontSize: 15 }} />, color: parchment.success, label: 'Info' },
};

export default function AnnouncementsPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialog, setDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium', targetRole: 'all' });

  const load = async () => { try { setItems(await getAnnouncements() || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError(''); setSaving(true);
    try { await createAnnouncement(form); setDialog(false); setForm({ title: '', content: '', priority: 'medium', targetRole: 'all' }); setSuccess('Posted'); await load(); setTimeout(() => setSuccess(''), 3000); }
    catch (e) { setError(e.message); } setSaving(false);
  };

  const handleDelete = async (id) => { setError(''); try { await deleteAnnouncement(id); await load(); } catch (e) { setError(e.message); } };

  if (!currentUser) return null;
  const canCreate = currentUser.role === 'teacher' || currentUser.role === 'admin';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>Announcements</Typography>
          <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>Campus notices and updates</Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 15 }} />} onClick={() => setDialog(true)} sx={{ fontSize: '0.78rem' }}>
            New Announcement
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.15)', color: parchment.success }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(155,44,44,0.06)', border: '1px solid rgba(155,44,44,0.15)', color: parchment.error }}>{error}</Alert>}

      {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box> : items.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}><Campaign sx={{ fontSize: 36, color: parchment.inkFaint, mb: 1 }} /><Typography sx={{ color: parchment.inkLight }}>No announcements</Typography></Card>
      ) : (
        <Stack spacing={1.5}>
          {items.map((a, i) => {
            const p = pConfig[a.priority] || pConfig.medium;
            const isAuthor = a.authorId === currentUser.id || currentUser.role === 'admin';
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
                <Card sx={{ p: 0, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ width: 4, bgcolor: p.color, flexShrink: 0 }} />
                    <Box sx={{ p: 2.5, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: parchment.ink, mb: 0.5, lineHeight: 1.3 }}>{a.title}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <Chip icon={p.icon} label={p.label} size="small" sx={{
                              height: 22, fontSize: '0.63rem', fontWeight: 700, bgcolor: `${p.color}12`, color: p.color,
                              borderRadius: '2px', '& .MuiChip-icon': { color: 'inherit' },
                            }} />
                            {a.targetRole !== 'all' && (
                              <Chip label={`For ${a.targetRole}s`} size="small" sx={{ height: 22, fontSize: '0.63rem', fontWeight: 600, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} />
                            )}
                            <Typography sx={{ fontSize: '0.68rem', color: parchment.inkFaint }}>{a.date ? new Date(a.date).toLocaleDateString() : ''}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: '0.85rem', color: parchment.inkLight, lineHeight: 1.6 }}>{a.content}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: parchment.inkFaint, mt: 1, fontStyle: 'italic' }}>— {a.authorName || 'Admin'}</Typography>
                        </Box>
                        {canCreate && isAuthor && (
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(a.id)} sx={{ color: parchment.inkFaint, borderRadius: '3px', '&:hover': { color: parchment.error, bgcolor: 'rgba(155,44,44,0.06)' } }}>
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            );
          })}
        </Stack>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>New Announcement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" size="small" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Content" size="small" fullWidth multiline rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <MenuItem value="high">High — Urgent</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="low">Low — Info</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Target</InputLabel>
                <Select value={form.targetRole} label="Target" onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                  <MenuItem value="all">Everyone</MenuItem><MenuItem value="student">Students</MenuItem><MenuItem value="teacher">Teachers</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: parchment.inkLight }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.title}>{saving ? 'Posting...' : 'Post'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
