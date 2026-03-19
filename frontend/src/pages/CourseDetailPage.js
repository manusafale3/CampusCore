import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Tabs, Tab, Chip, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, LinearProgress, Button, TextField, Alert, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material';
import { ArrowBack, Person, People, Assignment, Grading, EventNote, Add, Send, CheckCircle, Schedule } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import {
  getCourseById, getStudentsByCourse, getGradesByCourse, getAttendanceByCourse,
  getAssignmentsByCourse, createAssignment, submitAssignment, getSubmissions,
  setGrade, markBulkAttendance, getStudentSubmissions,
} from '../services/api';

function TabPanel({ value, index, children }) {
  return value === index ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>{children}</motion.div> : null;
}

// --- OVERVIEW TAB ---
function OverviewTab({ course }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 1 }}>About this Course</Typography>
          <Typography sx={{ fontSize: '0.88rem', color: parchment.inkLight, lineHeight: 1.7 }}>{course.description || 'No description available.'}</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: parchment.ink, mb: 2 }}>Details</Typography>
          {[
            ['Course ID', course.id],
            ['Department', course.department],
            ['Credits', course.credits],
            ['Semester', course.semester],
            ['Capacity', `${course.enrolledCount || 0} / ${course.capacity}`],
            ['Instructor', course.teacherName || 'TBA'],
            ['Course Fee', course.courseFee ? `₹${course.courseFee}` : '—'],
          ].map(([l, v]) => (
            <Box key={l} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: `1px solid ${parchment.border}`, '&:last-child': { borderBottom: 'none' } }}>
              <Typography sx={{ fontSize: '0.78rem', color: parchment.inkFaint }}>{l}</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: parchment.ink }}>{v}</Typography>
            </Box>
          ))}
        </Card>
      </Grid>
    </Grid>
  );
}

// --- ASSIGNMENTS TAB ---
function AssignmentsTab({ courseId, role }) {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', maxMarks: 100 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const a = await getAssignmentsByCourse(courseId);
      setAssignments(a || []);
      if (role === 'student') {
        const s = await getStudentSubmissions(currentUser.id);
        setMySubmissions(s || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async () => {
    setSaving(true); setError('');
    try {
      await createAssignment({ ...form, courseId, maxMarks: parseInt(form.maxMarks) || 100 });
      setDialog(false); setForm({ title: '', description: '', deadline: '', maxMarks: 100 });
      await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const handleSubmit = async (asgId) => {
    setError(''); setSuccess('');
    try {
      await submitAssignment(asgId);
      setSuccess('Submitted!');
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  const isSubmitted = (asgId) => mySubmissions.some(s => s.assignmentId === asgId);

  return (
    <Box>
      {(role === 'teacher' || role === 'admin') && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 15 }} />} onClick={() => setDialog(true)} sx={{ fontSize: '0.78rem' }}>
            New Assignment
          </Button>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(155,44,44,0.06)', border: '1px solid rgba(155,44,44,0.15)', color: parchment.error }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.15)', color: parchment.success }}>{success}</Alert>}

      {assignments.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 36, color: parchment.inkFaint, mb: 1 }} />
          <Typography sx={{ color: parchment.inkLight }}>No assignments yet</Typography>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {assignments.map(a => {
            const isPast = new Date(a.deadline) < new Date();
            const submitted = isSubmitted(a.id);
            return (
              <Card key={a.id} sx={{ p: 2.5, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', bgcolor: isPast ? parchment.inkFaint : parchment.accent }} />
                <Box sx={{ pl: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: parchment.ink }}>{a.title}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: parchment.inkLight, mt: 0.3, lineHeight: 1.5 }}>{a.description}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                      <Chip icon={<Schedule sx={{ fontSize: '12px !important' }} />} label={a.deadline ? new Date(a.deadline).toLocaleDateString() : '—'} size="small"
                        sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: isPast ? 'rgba(155,44,44,0.06)' : 'rgba(139,69,19,0.06)', color: isPast ? parchment.error : parchment.accent, borderRadius: '2px', '& .MuiChip-icon': { color: 'inherit' } }} />
                      <Chip label={`${a.maxMarks} marks`} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(184,134,11,0.06)', color: parchment.gold, borderRadius: '2px' }} />
                      <Chip label={a.id} size="small" sx={{ height: 22, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', fontWeight: 600, bgcolor: 'rgba(44,24,16,0.04)', color: parchment.inkFaint, borderRadius: '2px' }} />
                    </Stack>
                  </Box>
                  {role === 'student' && !isPast && (
                    submitted ? (
                      <Chip icon={<CheckCircle sx={{ fontSize: '14px !important' }} />} label="Submitted" size="small"
                        sx={{ bgcolor: 'rgba(45,106,79,0.08)', color: parchment.success, fontWeight: 700, fontSize: '0.72rem', borderRadius: '2px', '& .MuiChip-icon': { color: 'inherit' } }} />
                    ) : (
                      <Button size="small" variant="contained" startIcon={<Send sx={{ fontSize: 13 }} />} onClick={() => handleSubmit(a.id)} sx={{ fontSize: '0.73rem', py: 0.4 }}>
                        Submit
                      </Button>
                    )
                  )}
                </Box>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>New Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" size="small" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Description" size="small" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Deadline" size="small" type="date" fullWidth value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="Max Marks" size="small" type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} sx={{ maxWidth: 120 }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: parchment.inkLight }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.title}>{saving ? 'Creating...' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- STUDENTS TAB ---
function StudentsTab({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getStudentsByCourse(courseId).then(s => setStudents(s || [])).catch(() => {}).finally(() => setLoading(false)); }, [courseId]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  return students.length === 0 ? (
    <Card sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: parchment.inkLight }}>No students enrolled</Typography></Card>
  ) : (
    <Card>
      <TableContainer>
        <Table>
          <TableHead><TableRow><TableCell>Student</TableCell><TableCell>ID</TableCell><TableCell>Email</TableCell><TableCell>Department</TableCell></TableRow></TableHead>
          <TableBody>
            {students.map(s => (
              <TableRow key={s.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: parchment.accent, color: '#FDFBF7', fontSize: '0.65rem', fontWeight: 700, borderRadius: '3px' }}>
                      {(s.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink }}>{s.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Chip label={s.id} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.66rem', bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} /></TableCell>
                <TableCell><Typography sx={{ fontSize: '0.82rem', color: parchment.inkLight }}>{s.email || '—'}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: '0.82rem', color: parchment.ink }}>{s.department || '—'}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// --- GRADES TAB ---
function GradesTab({ courseId, role }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ studentId: '', midterm: '', final: '', assignment: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => { try { const g = await getGradesByCourse(courseId); setGrades(g || []); } catch {} setLoading(false); };
  useEffect(() => { load(); }, [courseId]);

  const handleSet = async () => {
    setSaving(true);
    try { await setGrade({ studentId: form.studentId, courseId, midterm: +form.midterm, final: +form.final, assignment: +form.assignment }); setDialog(false); await load(); } catch {}
    setSaving(false);
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  return (
    <Box>
      {(role === 'teacher' || role === 'admin') && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 15 }} />} onClick={() => setDialog(true)} sx={{ fontSize: '0.78rem' }}>Set Grade</Button>
        </Box>
      )}
      {grades.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: parchment.inkLight }}>No grades recorded</Typography></Card>
      ) : (
        <Card><TableContainer><Table>
          <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Midterm</TableCell><TableCell>Final</TableCell><TableCell>Assignment</TableCell><TableCell>Total</TableCell><TableCell>Grade</TableCell></TableRow></TableHead>
          <TableBody>
            {grades.map((g, i) => {
              const tc = g.total >= 85 ? parchment.success : g.total >= 70 ? parchment.warning : parchment.error;
              return (
                <TableRow key={i} hover>
                  <TableCell><Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink }}>{g.studentName || g.studentId}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem', color: parchment.ink }}>{g.midterm}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem', color: parchment.ink }}>{g.final}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem', color: parchment.ink }}>{g.assignment}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '0.95rem', color: tc }}>{g.total}</Typography></TableCell>
                  <TableCell><Chip label={g.gradeLetter} size="small" sx={{ fontWeight: 800, bgcolor: `${tc}12`, color: tc, borderRadius: '2px' }} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table></TableContainer></Card>
      )}
      <Dialog open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Set Grade</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField label="Student ID" size="small" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="STU-001" />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField label="Midterm" size="small" type="number" value={form.midterm} onChange={(e) => setForm({ ...form, midterm: e.target.value })} />
              <TextField label="Final" size="small" type="number" value={form.final} onChange={(e) => setForm({ ...form, final: e.target.value })} />
              <TextField label="Assign." size="small" type="number" value={form.assignment} onChange={(e) => setForm({ ...form, assignment: e.target.value })} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: parchment.inkLight }}>Cancel</Button>
          <Button variant="contained" onClick={handleSet} disabled={saving || !form.studentId}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- ATTENDANCE TAB ---
function AttendanceTab({ courseId, role }) {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [a, s] = await Promise.all([getAttendanceByCourse(courseId), getStudentsByCourse(courseId)]);
      setRecords(a || []); setStudents(s || []);
      const m = {}; (s || []).forEach(st => { m[st.id] = true; }); setMarks(m);
    } catch {} setLoading(false);
  };
  useEffect(() => { load(); }, [courseId]);

  const handleBulk = async () => {
    setSaving(true);
    try { await markBulkAttendance(courseId, marks); setSuccess('Marked!'); await load(); setTimeout(() => setSuccess(''), 3000); } catch {}
    setSaving(false);
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  return (
    <Box>
      {(role === 'teacher' || role === 'admin') && students.length > 0 && (
        <Card sx={{ p: 2.5, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: parchment.ink }}>Mark Today</Typography>
            <Button variant="contained" size="small" onClick={handleBulk} disabled={saving} sx={{ fontSize: '0.75rem' }}>{saving ? 'Marking...' : 'Save Attendance'}</Button>
          </Box>
          {success && <Alert severity="success" sx={{ mb: 1.5, py: 0.3, borderRadius: '3px', bgcolor: 'rgba(45,106,79,0.06)', color: parchment.success }}>{success}</Alert>}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {students.map(s => (
              <Chip key={s.id} label={`${s.name?.split(' ')[0] || s.id}`}
                onClick={() => setMarks({ ...marks, [s.id]: !marks[s.id] })}
                sx={{
                  fontWeight: 600, fontSize: '0.73rem', borderRadius: '3px', cursor: 'pointer',
                  bgcolor: marks[s.id] ? 'rgba(45,106,79,0.1)' : 'rgba(155,44,44,0.08)',
                  color: marks[s.id] ? parchment.success : parchment.error,
                  border: `1px solid ${marks[s.id] ? 'rgba(45,106,79,0.2)' : 'rgba(155,44,44,0.15)'}`,
                  transition: 'all 0.2s',
                }} />
            ))}
          </Box>
        </Card>
      )}

      {records.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: parchment.inkLight }}>No attendance records</Typography></Card>
      ) : (
        <Card><TableContainer><Table>
          <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Attended</TableCell><TableCell>Total</TableCell><TableCell>Percentage</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
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
                    <Chip label={a.percentage >= 75 ? 'Regular' : 'Shortage'} size="small" sx={{ fontWeight: 700, fontSize: '0.66rem', borderRadius: '2px', bgcolor: `${c}12`, color: c }} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table></TableContainer></Card>
      )}
    </Box>
  );
}

// === MAIN COURSE DETAIL PAGE ===
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    getCourseById(courseId).then(c => setCourse(c)).catch(() => {}).finally(() => setLoading(false));
  }, [courseId]);

  if (!currentUser) return null;
  if (loading) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;
  if (!course) return <Box><Typography sx={{ color: parchment.error }}>Course not found</Typography></Box>;

  const role = currentUser.role;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack sx={{ fontSize: 16 }} />} onClick={() => navigate('/courses')}
          sx={{ mb: 1.5, color: parchment.inkLight, fontSize: '0.78rem', '&:hover': { bgcolor: 'rgba(139,69,19,0.04)' } }}>
          Back to Courses
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
              {course.fullName || course.name}
            </Typography>
          </motion.div>
          <Chip label={course.id} sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.75rem', bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} />
        </Box>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem', mt: 0.3 }}>
          {course.department} · {course.credits} credits · {course.teacherName || 'TBA'}
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 2.5, p: 0, overflow: 'hidden' }}>
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{
            bgcolor: '#F0EBE1',
            '& .MuiTab-root': { color: parchment.inkLight, fontWeight: 600, fontSize: '0.8rem', textTransform: 'none', minHeight: 44, py: 1 },
            '& .Mui-selected': { color: parchment.accent },
            '& .MuiTabs-indicator': { bgcolor: parchment.accent, height: 2 },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Assignments" />
          <Tab label="Students" />
          <Tab label="Grades" />
          <Tab label="Attendance" />
        </Tabs>
      </Card>

      <TabPanel value={tab} index={0}><OverviewTab course={course} /></TabPanel>
      <TabPanel value={tab} index={1}><AssignmentsTab courseId={courseId} role={role} /></TabPanel>
      <TabPanel value={tab} index={2}><StudentsTab courseId={courseId} /></TabPanel>
      <TabPanel value={tab} index={3}><GradesTab courseId={courseId} role={role} /></TabPanel>
      <TabPanel value={tab} index={4}><AttendanceTab courseId={courseId} role={role} /></TabPanel>
    </Box>
  );
}
