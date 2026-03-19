import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Grid, Chip, LinearProgress, Stack, CircularProgress } from '@mui/material';
import {
  People, MenuBook, Grading, EventNote, Campaign, School, AttachMoney, EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import {
  getStudents, getCourses, getCoursesByTeacher, getCoursesByStudent,
  getGradesByStudent, getAttendanceByStudent, getAnnouncements,
  getStudentsByCourse, getMyFees, getLeaderboard,
} from '../services/api';

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

function StatCard({ icon, label, value, sub, color = parchment.accent, onClick, delay = 0 }) {
  return (
    <motion.div {...fadeUp} transition={{ delay, duration: 0.3 }}>
      <Card sx={{
        p: 2.5, position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { borderColor: parchment.borderHover, transform: 'translateY(-1px)' } : {},
        transition: 'all 0.25s ease',
      }} onClick={onClick}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', bgcolor: color }} />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ pl: 1 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: parchment.inkFaint, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, color: parchment.ink, fontSize: '1.8rem', lineHeight: 1 }}>
              {value}
            </Typography>
            {sub && <Typography sx={{ mt: 0.5, fontSize: '0.76rem', color: parchment.inkLight }}>{sub}</Typography>}
          </Box>
          <Box sx={{
            width: 42, height: 42, borderRadius: '3px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            bgcolor: `${color}12`, color: color,
          }}>
            {icon}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
}

function AnnouncementItem({ a, onClick }) {
  const colors = { high: parchment.error, medium: parchment.warning, low: parchment.success };
  const c = colors[a.priority] || colors.medium;
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', gap: 1.5, py: 1.5,
        borderBottom: `1px solid ${parchment.border}`,
        '&:last-child': { borderBottom: 'none' },
        cursor: 'pointer', '&:hover': { bgcolor: 'rgba(139,69,19,0.02)' },
        transition: 'background 0.2s',
      }}
    >
      <Box sx={{ width: 3, borderRadius: '1px', bgcolor: c, flexShrink: 0, mt: 0.5 }} />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink, mb: 0.3 }}>{a.title}</Typography>
        <Typography sx={{ fontSize: '0.76rem', color: parchment.inkLight, lineHeight: 1.5 }}>
          {a.content?.slice(0, 80)}{a.content?.length > 80 ? '...' : ''}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Chip label={a.priority} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, bgcolor: `${c}12`, color: c, borderRadius: '2px', textTransform: 'uppercase' }} />
          <Typography sx={{ fontSize: '0.65rem', color: parchment.inkFaint }}>{a.authorName || 'Admin'}</Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function CourseRow({ c, onClick }) {
  const pct = c.capacity > 0 ? Math.round(((c.enrolledCount || 0) / c.capacity) * 100) : 0;
  const color = pct > 90 ? parchment.error : pct > 60 ? parchment.warning : parchment.success;
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2, py: 0.5, px: 1,
        borderRadius: '3px', cursor: 'pointer',
        '&:hover': { bgcolor: 'rgba(139,69,19,0.03)' }, transition: 'background 0.2s',
      }}
    >
      <Chip label={c.id} size="small" sx={{
        fontFamily: '"JetBrains Mono", monospace', fontSize: '0.66rem', fontWeight: 600,
        bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px', minWidth: 65,
      }} />
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: parchment.ink, width: 180, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {c.name || c.fullName}
      </Typography>
      <LinearProgress variant="determinate" value={pct} sx={{
        flex: 1, height: 4, borderRadius: '1px', bgcolor: 'rgba(44,24,16,0.04)',
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: '1px' },
      }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color, width: 34, textAlign: 'right' }}>{pct}%</Typography>
    </Box>
  );
}

function AdminDashboard({ nav }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getCourses(), getAnnouncements()])
      .then(([s, c, a]) => { setStudents(s || []); setCourses(c || []); setAnnouncements(a || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}><StatCard icon={<People sx={{ fontSize: 22 }} />} label="Total Students" value={students.length} color={parchment.accent} onClick={() => nav('/students')} delay={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<MenuBook sx={{ fontSize: 22 }} />} label="Active Courses" value={courses.length} color={parchment.gold} onClick={() => nav('/courses')} delay={0.05} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<School sx={{ fontSize: 22 }} />} label="Departments" value={[...new Set(courses.map(c => c.department).filter(Boolean))].length || 0} color={parchment.success} delay={0.1} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<Campaign sx={{ fontSize: 22 }} />} label="Announcements" value={announcements.length} color={parchment.warning} onClick={() => nav('/announcements')} delay={0.15} /></Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.3 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 0.5 }}>Courses Overview</Typography>
              <Typography sx={{ fontSize: '0.76rem', color: parchment.inkLight, mb: 2.5 }}>Click any course for details</Typography>
              {courses.length === 0 && <Typography sx={{ color: parchment.inkFaint, fontSize: '0.85rem' }}>No courses yet</Typography>}
              {courses.slice(0, 7).map(c => <CourseRow key={c.id} c={c} onClick={() => nav(`/course/${c.id}`)} />)}
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={5}>
          <motion.div {...fadeUp} transition={{ delay: 0.25, duration: 0.3 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 2 }}>Recent Announcements</Typography>
              {announcements.length === 0 && <Typography sx={{ color: parchment.inkFaint, fontSize: '0.85rem' }}>None yet</Typography>}
              {announcements.slice(0, 4).map(a => <AnnouncementItem key={a.id} a={a} onClick={() => nav('/announcements')} />)}
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
}

function TeacherDashboard({ user, nav }) {
  const [courses, setCourses] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCoursesByTeacher(user.id), getAnnouncements()])
      .then(async ([c, a]) => {
        setCourses(c || []); setAnnouncements(a || []);
        let total = 0;
        for (const course of (c || [])) { try { const s = await getStudentsByCourse(course.id); total += (s || []).length; } catch {} }
        setStudentCount(total);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}><StatCard icon={<MenuBook sx={{ fontSize: 22 }} />} label="My Courses" value={courses.length} color={parchment.gold} onClick={() => nav('/courses')} delay={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<People sx={{ fontSize: 22 }} />} label="Total Students" value={studentCount} sub="across courses" color={parchment.accent} onClick={() => nav('/students')} delay={0.05} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<Grading sx={{ fontSize: 22 }} />} label="Grading" value="→" sub="manage grades" color={parchment.success} onClick={() => nav('/grades')} delay={0.1} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<Campaign sx={{ fontSize: 22 }} />} label="Announcements" value={announcements.length} color={parchment.warning} onClick={() => nav('/announcements')} delay={0.15} /></Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}><Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 2 }}>My Courses</Typography>
            {courses.map(c => (
              <Box key={c.id} onClick={() => nav(`/course/${c.id}`)} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.3,
                borderBottom: `1px solid ${parchment.border}`, '&:last-child': { borderBottom: 'none' },
                cursor: 'pointer', '&:hover': { bgcolor: 'rgba(139,69,19,0.02)' }, transition: 'background 0.2s',
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.86rem', color: parchment.ink }}>{c.name || c.fullName}</Typography>
                  <Typography sx={{ fontSize: '0.73rem', color: parchment.inkLight }}>{c.department} · {c.credits} credits</Typography>
                </Box>
                <Chip label={c.id} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.66rem', fontWeight: 600, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} />
              </Box>
            ))}
          </Card></motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div {...fadeUp} transition={{ delay: 0.25 }}><Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 2 }}>Announcements</Typography>
            {announcements.slice(0, 4).map(a => <AnnouncementItem key={a.id} a={a} onClick={() => nav('/announcements')} />)}
          </Card></motion.div>
        </Grid>
      </Grid>
    </>
  );
}

function StudentDashboard({ user, nav }) {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCoursesByStudent(user.id), getGradesByStudent(user.id), getAttendanceByStudent(user.id), getAnnouncements(), getMyFees()])
      .then(([c, g, a, ann, f]) => { setCourses(c || []); setGrades(g || []); setAttendance(a || []); setAnnouncements(ann || []); setFees(f); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>;

  const avgGrade = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + g.total, 0) / grades.length) : 0;
  const avgAtt = attendance.length > 0 ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length) : 0;

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}><StatCard icon={<MenuBook sx={{ fontSize: 22 }} />} label="Enrolled" value={courses.length} color={parchment.accent} onClick={() => nav('/courses')} delay={0} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<Grading sx={{ fontSize: 22 }} />} label="Avg Score" value={avgGrade || '—'} sub={grades.length > 0 ? `${grades.length} graded` : 'No grades'} color={parchment.success} onClick={() => nav('/grades')} delay={0.05} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<EventNote sx={{ fontSize: 22 }} />} label="Attendance" value={avgAtt ? `${avgAtt}%` : '—'} sub={avgAtt >= 75 ? 'On track' : avgAtt > 0 ? 'Below min' : 'No records'} color={avgAtt >= 75 ? parchment.warning : parchment.error} onClick={() => nav('/attendance')} delay={0.1} /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={<EmojiEvents sx={{ fontSize: 22 }} />} label="Leaderboard" value="→" sub="see rankings" color={parchment.gold} onClick={() => nav('/leaderboard')} delay={0.15} /></Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={5}>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}><Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 2 }}>My Courses</Typography>
            {courses.length === 0 && <Typography sx={{ color: parchment.inkFaint, fontSize: '0.85rem' }}>Not enrolled yet</Typography>}
            {courses.map(c => (
              <Box key={c.id} onClick={() => nav(`/course/${c.id}`)} sx={{
                py: 1.3, borderBottom: `1px solid ${parchment.border}`, '&:last-child': { borderBottom: 'none' },
                cursor: 'pointer', '&:hover': { bgcolor: 'rgba(139,69,19,0.02)' }, transition: 'background 0.2s',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink }}>{c.name || c.fullName}</Typography>
                  <Chip label={c.id} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.63rem', fontWeight: 600, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }} />
                </Box>
                <Typography sx={{ fontSize: '0.73rem', color: parchment.inkLight, mt: 0.3 }}>{c.teacherName || 'TBA'} · {c.credits} cr</Typography>
              </Box>
            ))}
          </Card></motion.div>
        </Grid>
        <Grid item xs={12} md={7}>
          <motion.div {...fadeUp} transition={{ delay: 0.25 }}><Card sx={{ p: 3, height: '100%' }}>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.1rem', color: parchment.ink, mb: 2 }}>Announcements</Typography>
            {announcements.length === 0 && <Typography sx={{ color: parchment.inkFaint, fontSize: '0.85rem' }}>None yet</Typography>}
            {announcements.slice(0, 4).map(a => <AnnouncementItem key={a.id} a={a} onClick={() => nav('/announcements')} />)}
          </Card></motion.div>
        </Grid>
      </Grid>
    </>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const greetings = {
    student: `Welcome back, ${(currentUser.name || 'Student').split(' ')[0]}`,
    teacher: `Good day, ${currentUser.name || 'Professor'}`,
    admin: 'Admin Dashboard',
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
            {greetings[currentUser.role] || 'Dashboard'}
          </Typography>
          <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>
            {currentUser.role === 'student' && `${currentUser.department || ''} ${currentUser.semester ? '· Semester ' + currentUser.semester : ''}`}
            {currentUser.role === 'teacher' && `${currentUser.department || ''} Department`}
            {currentUser.role === 'admin' && 'Institution overview'}
          </Typography>
        </motion.div>
      </Box>
      {currentUser.role === 'admin' && <AdminDashboard nav={navigate} />}
      {currentUser.role === 'teacher' && <TeacherDashboard user={currentUser} nav={navigate} />}
      {currentUser.role === 'student' && <StudentDashboard user={currentUser} nav={navigate} />}
    </Box>
  );
}
