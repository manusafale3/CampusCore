import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Grid, Chip, LinearProgress, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, Select, MenuItem, InputLabel,
} from '@mui/material';
import { EventNote, CheckCircle, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import { getAttendanceByStudent, getAttendanceByCourse, getCoursesByTeacher, getCoursesByStudent, getCourses } from '../services/api';

function Ring({ pct, size = 88 }) {
  const c = pct >= 85 ? parchment.success : pct >= 75 ? parchment.warning : parchment.error;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(44,24,16,0.05)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="butt"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '1rem', color: c, lineHeight: 1 }}>{pct}%</Typography>
      </Box>
    </Box>
  );
}

function StudentView({ user }) {
  const [att, setAtt] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAttendanceByStudent(user.id), getCoursesByStudent(user.id)])
      .then(([a, c]) => { setAtt(a || []); setCourses(c || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  const avg = att.length > 0 ? Math.round(att.reduce((s, a) => s + a.percentage, 0) / att.length) : 0;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: parchment.inkFaint, mb: 2 }}>Overall</Typography>
            <Ring pct={avg} />
            <Chip label={avg >= 75 ? 'Eligible for Exams' : 'Below Minimum'} size="small" sx={{
              mt: 2, fontWeight: 700, fontSize: '0.66rem', borderRadius: '2px',
              bgcolor: avg >= 75 ? 'rgba(45,106,79,0.08)' : 'rgba(155,44,44,0.08)',
              color: avg >= 75 ? parchment.success : parchment.error,
            }} />
          </Card>
        </motion.div>
      </Grid>
      {att.map((a, i) => {
        const course = courses.find(c => c.id === a.courseId);
        return (
          <Grid item xs={12} sm={4} key={a.courseId}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i + 1) * 0.08, duration: 0.3 }}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: parchment.inkFaint, mb: 2 }}>
                  {course?.name || course?.fullName || a.courseId}
                </Typography>
                <Ring pct={a.percentage} />
                <Typography sx={{ mt: 2, fontSize: '0.76rem', color: parchment.inkLight, fontFamily: '"JetBrains Mono", monospace' }}>{a.attended} / {a.totalClasses}</Typography>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
      {att.length === 0 && (
        <Grid item xs={12} sm={8}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <EventNote sx={{ fontSize: 36, color: parchment.inkFaint, mb: 1 }} />
            <Typography sx={{ color: parchment.inkLight }}>No attendance records</Typography>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

function TeacherView({ user }) {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = user.role === 'teacher' ? await getCoursesByTeacher(user.id) : await getCourses();
      setCourses(c || []);
      if ((c || []).length > 0) { setSelected(c[0].id); }
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getAttendanceByCourse(selected).then(a => setRecords(a || [])).catch(() => {}).finally(() => setLoading(false));
  }, [selected]);

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel sx={{ color: parchment.inkLight }}>Course</InputLabel>
          <Select value={selected} label="Course" onChange={(e) => setSelected(e.target.value)}>
            {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.id} — {c.name || c.fullName}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: parchment.accent }} /></Box> : records.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: parchment.inkLight }}>No records for this course</Typography></Card>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card><TableContainer><Table>
            <TableHead><TableRow>
              <TableCell>Student</TableCell><TableCell>Attended</TableCell><TableCell>Total</TableCell><TableCell>Percentage</TableCell><TableCell>Status</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {records.map((a, i) => {
                const c = a.percentage >= 85 ? parchment.success : a.percentage >= 75 ? parchment.warning : parchment.error;
                return (
                  <TableRow key={i} hover>
                    <TableCell><Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink }}>{a.studentName || a.studentId}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.84rem' }}>{a.attended}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.84rem', color: parchment.inkLight }}>{a.totalClasses}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 100 }}>
                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.82rem', color: c, width: 34 }}>{a.percentage}%</Typography>
                        <LinearProgress variant="determinate" value={a.percentage} sx={{ flex: 1, height: 4, borderRadius: '1px', bgcolor: 'rgba(44,24,16,0.04)', '& .MuiLinearProgress-bar': { bgcolor: c } }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={a.percentage >= 75 ? <CheckCircle sx={{ fontSize: '12px !important' }} /> : <Cancel sx={{ fontSize: '12px !important' }} />}
                        label={a.percentage >= 75 ? 'Regular' : 'Shortage'} size="small"
                        sx={{ fontWeight: 700, fontSize: '0.66rem', borderRadius: '2px', bgcolor: `${c}12`, color: c, '& .MuiChip-icon': { color: 'inherit' } }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table></TableContainer></Card>
        </motion.div>
      )}
    </Box>
  );
}

export default function AttendancePage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
          {currentUser.role === 'student' ? 'My Attendance' : 'Attendance'}
        </Typography>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>
          {currentUser.role === 'student' ? 'Across enrolled courses' : 'View by course'}
        </Typography>
      </Box>
      {currentUser.role === 'student' ? <StudentView user={currentUser} /> : <TeacherView user={currentUser} />}
    </Box>
  );
}
