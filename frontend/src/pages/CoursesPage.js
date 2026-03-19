import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Grid, Chip, LinearProgress, Avatar, Stack,
  Button, CircularProgress, Alert,
} from '@mui/material';
import { Person, Add, Remove, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import { getCourses, getCoursesByTeacher, getCoursesByStudent, enrollCourse, unenrollCourse } from '../services/api';

function CourseCard({ course, isEnrolled, onEnroll, onUnenroll, role, onClick, delay }) {
  const [actionLoading, setActionLoading] = useState(false);
  const fillPct = course.capacity > 0 ? Math.round(((course.enrolledCount || 0) / course.capacity) * 100) : 0;
  const fillColor = fillPct > 90 ? parchment.error : fillPct > 70 ? parchment.warning : parchment.success;

  const handleEnroll = async (e) => { e.stopPropagation(); setActionLoading(true); try { await onEnroll(course.id); } catch {} finally { setActionLoading(false); } };
  const handleUnenroll = async (e) => { e.stopPropagation(); setActionLoading(true); try { await onUnenroll(course.id); } catch {} finally { setActionLoading(false); } };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}>
      <Card
        onClick={onClick}
        sx={{
          p: 2.5, height: '100%', display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          '&:hover': { borderColor: parchment.borderHover, transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(44,24,16,0.08)' },
          transition: 'all 0.25s ease',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: isEnrolled ? parchment.success : parchment.accent }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, mt: 0.5 }}>
          <Chip label={course.id} size="small" sx={{
            fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.7rem',
            bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px',
          }} />
          <Chip label={`${course.credits} cr`} size="small" sx={{
            fontWeight: 700, fontSize: '0.66rem', bgcolor: 'rgba(184,134,11,0.08)', color: parchment.gold, borderRadius: '2px',
          }} />
        </Box>

        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.05rem', color: parchment.ink, mb: 0.3, lineHeight: 1.2 }}>
          {course.fullName || course.name}
        </Typography>
        <Typography sx={{ fontSize: '0.76rem', color: parchment.inkLight, mb: 2 }}>
          {course.department} {course.semester ? `· Sem ${course.semester}` : ''}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Stack spacing={1.2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 22, height: 22, bgcolor: 'rgba(139,69,19,0.06)', color: parchment.accent, borderRadius: '2px' }}>
              <Person sx={{ fontSize: 13 }} />
            </Avatar>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 500, color: parchment.ink }}>{course.teacherName || 'TBA'}</Typography>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: parchment.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Enrollment</Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: fillColor }}>{course.enrolledCount || 0}/{course.capacity}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={fillPct} sx={{
              height: 4, borderRadius: '1px', bgcolor: 'rgba(44,24,16,0.04)',
              '& .MuiLinearProgress-bar': { bgcolor: fillColor, borderRadius: '1px' },
            }} />
          </Box>

          {/* Enroll/Unenroll for students */}
          {role === 'student' && (
            <Button
              size="small"
              variant={isEnrolled ? 'outlined' : 'contained'}
              onClick={isEnrolled ? handleUnenroll : handleEnroll}
              disabled={actionLoading}
              startIcon={isEnrolled ? <Remove sx={{ fontSize: 13 }} /> : <Add sx={{ fontSize: 13 }} />}
              sx={{
                mt: 0.5, fontSize: '0.73rem', py: 0.4,
                ...(isEnrolled ? {
                  borderColor: 'rgba(155,44,44,0.2)', color: parchment.error,
                  '&:hover': { borderColor: parchment.error, bgcolor: 'rgba(155,44,44,0.04)' },
                } : {}),
              }}
            >
              {actionLoading ? '...' : isEnrolled ? 'Unenroll' : 'Enroll'}
            </Button>
          )}

          {/* View details hint */}
          {(role !== 'student' || isEnrolled) && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.68rem', color: parchment.inkFaint, mr: 0.3 }}>Details</Typography>
              <ArrowForward sx={{ fontSize: 12, color: parchment.inkFaint }} />
            </Box>
          )}
        </Stack>
      </Card>
    </motion.div>
  );
}

export default function CoursesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [myCourseIds, setMyCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourses = async () => {
    try {
      if (currentUser.role === 'student') {
        const [all, mine] = await Promise.all([getCourses(), getCoursesByStudent(currentUser.id)]);
        setAllCourses(all || []); setMyCourseIds(new Set((mine || []).map(c => c.id)));
      } else if (currentUser.role === 'teacher') {
        const c = await getCoursesByTeacher(currentUser.id); setAllCourses(c || []);
      } else {
        const c = await getCourses(); setAllCourses(c || []);
      }
    } catch { setError('Failed to load courses'); }
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, [currentUser]);

  const handleEnroll = async (cid) => { setError(''); try { await enrollCourse(cid); await loadCourses(); } catch (e) { setError(e.message); } };
  const handleUnenroll = async (cid) => { setError(''); try { await unenrollCourse(cid); await loadCourses(); } catch (e) { setError(e.message); } };

  if (!currentUser) return null;

  let displayCourses = allCourses;
  if (currentUser.role === 'student') {
    const enrolled = allCourses.filter(c => myCourseIds.has(c.id));
    const available = allCourses.filter(c => !myCourseIds.has(c.id));
    displayCourses = [...enrolled, ...available];
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
          {currentUser.role === 'admin' ? 'All Courses' : currentUser.role === 'teacher' ? 'My Courses' : 'Courses'}
        </Typography>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>
          {currentUser.role === 'student' && `${myCourseIds.size} enrolled · Click any course for details`}
          {currentUser.role === 'teacher' && 'Click a course to view details, assignments, and students'}
          {currentUser.role === 'admin' && `${allCourses.length} total courses`}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '3px', bgcolor: 'rgba(155,44,44,0.06)', border: '1px solid rgba(155,44,44,0.15)', color: parchment.error }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box>
      ) : (
        <>
          {currentUser.role === 'student' && myCourseIds.size > 0 && (
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: parchment.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
              Enrolled Courses
            </Typography>
          )}
          <Grid container spacing={2}>
            {displayCourses.map((course, i) => {
              const isEnrolled = myCourseIds.has(course.id);
              const showLabel = currentUser.role === 'student' && i > 0 && myCourseIds.has(displayCourses[i - 1]?.id) && !isEnrolled;
              return (
                <React.Fragment key={course.id}>
                  {showLabel && (
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: parchment.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 1 }}>Available Courses</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={4}>
                    <CourseCard
                      course={course} isEnrolled={isEnrolled}
                      onEnroll={handleEnroll} onUnenroll={handleUnenroll}
                      role={currentUser.role}
                      onClick={() => navigate(`/course/${course.id}`)}
                      delay={i * 0.04}
                    />
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
}
