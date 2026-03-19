import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel,
  CircularProgress,
} from '@mui/material';
import { Grading } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import { getGradesByStudent, getGradesByCourse, getCourses, getCoursesByTeacher, getCoursesByStudent } from '../services/api';

function ScoreBar({ value }) {
  const c = value >= 85 ? parchment.success : value >= 70 ? parchment.warning : parchment.error;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.8rem', width: 26, textAlign: 'right', color: c }}>{value}</Typography>
      <Box sx={{ flex: 1, height: 4, borderRadius: '1px', bgcolor: 'rgba(44,24,16,0.04)', minWidth: 40 }}>
        <Box sx={{ height: '100%', borderRadius: '1px', bgcolor: c, width: `${value}%`, transition: 'width 0.4s' }} />
      </Box>
    </Box>
  );
}

export default function GradesPage() {
  const { currentUser } = useAuth();
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let c = [];
        if (currentUser.role === 'teacher') c = await getCoursesByTeacher(currentUser.id);
        else if (currentUser.role === 'student') c = await getCoursesByStudent(currentUser.id);
        else c = await getCourses();
        setCourses(c || []);

        if (currentUser.role === 'student') {
          setGrades(await getGradesByStudent(currentUser.id) || []);
        } else if ((c || []).length > 0) {
          setCourseFilter(c[0].id);
          setGrades(await getGradesByCourse(c[0].id) || []);
        }
      } catch {} setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleCourseChange = async (cid) => {
    setCourseFilter(cid); setLoading(true);
    try { setGrades(await getGradesByCourse(cid) || []); } catch {} setLoading(false);
  };

  if (!currentUser) return null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
          {currentUser.role === 'student' ? 'My Grades' : 'Grades'}
        </Typography>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>
          {currentUser.role === 'student' ? 'Your academic performance' : 'View grades by course'}
        </Typography>
      </Box>

      {currentUser.role !== 'student' && courses.length > 0 && (
        <Card sx={{ p: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel sx={{ color: parchment.inkLight }}>Course</InputLabel>
            <Select value={courseFilter} label="Course" onChange={(e) => handleCourseChange(e.target.value)}>
              {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.id} — {c.name || c.fullName}</MenuItem>)}
            </Select>
          </FormControl>
        </Card>
      )}

      {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box> : grades.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Grading sx={{ fontSize: 36, color: parchment.inkFaint, mb: 1 }} />
          <Typography sx={{ color: parchment.inkLight }}>No grades recorded</Typography>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card><TableContainer><Table>
            <TableHead><TableRow>
              {currentUser.role !== 'student' && <TableCell>Student</TableCell>}
              {currentUser.role === 'student' && <TableCell>Course</TableCell>}
              <TableCell>Midterm</TableCell><TableCell>Final</TableCell><TableCell>Assignment</TableCell><TableCell>Total</TableCell><TableCell>Grade</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {grades.map((g, i) => {
                const tc = g.total >= 85 ? parchment.success : g.total >= 70 ? parchment.warning : parchment.error;
                return (
                  <TableRow key={i} hover>
                    {currentUser.role !== 'student' && (
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink }}>{g.studentName || g.studentId}</Typography>
                        <Chip label={g.studentId} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', height: 18, bgcolor: 'rgba(44,24,16,0.04)', color: parchment.inkFaint, borderRadius: '2px', mt: 0.3 }} />
                      </TableCell>
                    )}
                    {currentUser.role === 'student' && (
                      <TableCell><Chip label={g.courseId} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.66rem', fontWeight: 600, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} /></TableCell>
                    )}
                    <TableCell><ScoreBar value={g.midterm} /></TableCell>
                    <TableCell><ScoreBar value={g.final} /></TableCell>
                    <TableCell><ScoreBar value={g.assignment} /></TableCell>
                    <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '0.95rem', color: tc }}>{g.total}</Typography></TableCell>
                    <TableCell><Chip label={g.gradeLetter} size="small" sx={{ fontWeight: 800, fontSize: '0.78rem', bgcolor: `${tc}12`, color: tc, borderRadius: '2px', minWidth: 38 }} /></TableCell>
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
