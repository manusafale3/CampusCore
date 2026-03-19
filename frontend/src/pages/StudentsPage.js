import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TextField, InputAdornment, Avatar,
  MenuItem, Select, FormControl, CircularProgress, Dialog, DialogTitle,
  DialogContent, Stack, IconButton, Divider,
} from '@mui/material';
import { Search, Close, Email, Phone, School, Badge, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import { getStudents, getStudentsByCourse, getCoursesByTeacher, getStudentById } from '../services/api';

function StudentDetail({ studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentById(studentId).then(s => setStudent(s)).catch(() => {}).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;
  if (!student) return <Typography sx={{ p: 3, color: parchment.error }}>Student not found</Typography>;

  const initials = (student.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const rows = [
    ['Email', student.email, <Email sx={{ fontSize: 15 }} />],
    ['Phone', student.phone, <Phone sx={{ fontSize: 15 }} />],
    ['Department', student.department, <School sx={{ fontSize: 15 }} />],
    ['Roll No', student.rollNo, <Badge sx={{ fontSize: 15 }} />],
    ['Division', student.division, <Person sx={{ fontSize: 15 }} />],
    ['Class', student.class, <School sx={{ fontSize: 15 }} />],
    ['Semester', student.semester, <School sx={{ fontSize: 15 }} />],
    ['Enrollment Year', student.enrollmentYear, <School sx={{ fontSize: 15 }} />],
    ['Address', student.address, <School sx={{ fontSize: 15 }} />],
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: parchment.accent, color: '#FDFBF7', borderRadius: '3px', fontWeight: 800, fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem' }}>
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.2rem', color: parchment.ink }}>{student.name}</Typography>
            <Chip label={student.id} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.66rem', fontWeight: 600, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: parchment.inkFaint }}><Close sx={{ fontSize: 18 }} /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {rows.map(([label, value, icon]) => value ? (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.8 }}>
          <Box sx={{ color: parchment.inkFaint }}>{icon}</Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: parchment.inkFaint, width: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: parchment.ink }}>{value}</Typography>
        </Box>
      ) : null)}
    </Box>
  );
}

export default function StudentsPage() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        if (currentUser.role === 'teacher') {
          const courses = await getCoursesByTeacher(currentUser.id);
          const all = []; const seen = new Set();
          for (const c of (courses || [])) {
            const s = await getStudentsByCourse(c.id);
            for (const st of (s || [])) { if (!seen.has(st.id)) { seen.add(st.id); all.push(st); } }
          }
          setStudents(all);
        } else { setStudents(await getStudents() || []); }
      } catch {} setLoading(false);
    }
    load();
  }, [currentUser]);

  if (!currentUser || currentUser.role === 'student') return <Typography sx={{ color: parchment.inkLight }}>Access denied.</Typography>;

  const depts = ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
  const filtered = students.filter(s => {
    const m1 = (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase());
    const m2 = deptFilter === 'All' || s.department === deptFilter;
    return m1 && m2;
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
          {currentUser.role === 'admin' ? 'All Students' : 'My Students'}
        </Typography>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>Click any student for details</Typography>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 250 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: parchment.inkFaint, fontSize: 17 }} /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} displayEmpty>
              {depts.map(d => <MenuItem key={d} value={d}>{d === 'All' ? 'All Depts' : d}</MenuItem>)}
            </Select>
          </FormControl>
          <Chip label={`${filtered.length} students`} sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} />
        </Box>
      </Card>

      {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card><TableContainer><Table>
            <TableHead><TableRow>
              <TableCell>Student</TableCell><TableCell>ID</TableCell><TableCell>Department</TableCell><TableCell>Semester</TableCell><TableCell>Division</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: parchment.inkFaint }}>No students found</TableCell></TableRow>}
              {filtered.map(s => {
                const init = (s.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <TableRow key={s.id} hover onClick={() => setSelectedId(s.id)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: parchment.accent, color: '#FDFBF7', fontSize: '0.65rem', fontWeight: 700, borderRadius: '3px' }}>{init}</Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink }}>{s.name}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: parchment.inkLight }}>{s.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={s.id} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.66rem', fontWeight: 600, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} /></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.84rem', color: parchment.ink }}>{s.department || '—'}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: parchment.ink }}>{s.semester || '—'}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.84rem', color: parchment.ink }}>{s.division || '—'}</Typography></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table></TableContainer></Card>
        </motion.div>
      )}

      <Dialog open={!!selectedId} onClose={() => setSelectedId(null)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          {selectedId && <StudentDetail studentId={selectedId} onClose={() => setSelectedId(null)} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
