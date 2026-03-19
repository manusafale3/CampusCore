import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Chip, CircularProgress, Avatar, FormControl,
  Select, MenuItem, InputLabel, LinearProgress,
} from '@mui/material';
import { EmojiEvents, MilitaryTech } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { parchment } from '../theme';
import { getLeaderboard, getCourses } from '../services/api';

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [board, setBoard] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(), getCourses()])
      .then(([b, c]) => { setBoard(b || []); setCourses(c || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleFilter = async (cid) => {
    setCourseFilter(cid); setLoading(true);
    try { setBoard(await getLeaderboard(cid || undefined) || []); } catch {} setLoading(false);
  };

  if (!currentUser) return null;

  const maxScore = board.length > 0 ? board[0].avgScore : 100;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, color: parchment.ink }}>
          Leaderboard
        </Typography>
        <Typography sx={{ color: parchment.inkLight, fontSize: '0.82rem' }}>Student rankings by average score</Typography>
      </Box>

      <Card sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel sx={{ color: parchment.inkLight }}>Filter by Course</InputLabel>
          <Select value={courseFilter} label="Filter by Course" onChange={(e) => handleFilter(e.target.value)}>
            <MenuItem value="">All Courses</MenuItem>
            {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.id} — {c.name || c.fullName}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: parchment.accent }} /></Box> : board.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 40, color: parchment.inkFaint, mb: 1 }} />
          <Typography sx={{ color: parchment.inkLight }}>No grades recorded yet — leaderboard is empty</Typography>
        </Card>
      ) : (
        <Card sx={{ p: 0, overflow: 'hidden' }}>
          {/* Top 3 podium */}
          {board.length >= 1 && (
            <Box sx={{ p: 3, pb: 2, bgcolor: 'rgba(184,134,11,0.03)', borderBottom: `1px solid ${parchment.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
                {board.slice(0, 3).map((s, i) => {
                  const order = [1, 0, 2]; // display as 2nd, 1st, 3rd
                  const idx = order[i];
                  if (!board[idx]) return null;
                  const entry = board[idx];
                  const isMe = entry.id === currentUser.id;
                  const sizes = [{ av: 56, h: 120 }, { av: 48, h: 90 }, { av: 44, h: 70 }];
                  const sz = sizes[idx];
                  const init = (entry.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 + 0.1, duration: 0.4 }}>
                      <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                        <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{medals[idx]}</Typography>
                        <Avatar sx={{
                          width: sz.av, height: sz.av, mx: 'auto', mb: 1, borderRadius: '3px',
                          bgcolor: isMe ? parchment.gold : parchment.accent, color: '#FDFBF7',
                          fontWeight: 800, fontFamily: '"Cormorant Garamond", serif', fontSize: sz.av * 0.35,
                          boxShadow: isMe ? '0 4px 16px rgba(184,134,11,0.3)' : '0 2px 8px rgba(44,24,16,0.1)',
                          border: isMe ? `2px solid ${parchment.gold}` : 'none',
                        }}>
                          {init}
                        </Avatar>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: parchment.ink, mb: 0.2 }}>
                          {entry.name}{isMe ? ' (You)' : ''}
                        </Typography>
                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '1rem', color: parchment.gold }}>
                          {entry.avgScore}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: parchment.inkFaint }}>{entry.coursesGraded} courses</Typography>
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Full list */}
          <Box sx={{ p: 2 }}>
            {board.map((s, i) => {
              const isMe = s.id === currentUser.id;
              const init = (s.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2);
              const barPct = maxScore > 0 ? Math.round((s.avgScore / maxScore) * 100) : 0;
              const c = s.avgScore >= 85 ? parchment.success : s.avgScore >= 70 ? parchment.warning : parchment.error;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, px: 1.5,
                    borderBottom: `1px solid ${parchment.border}`, '&:last-child': { borderBottom: 'none' },
                    bgcolor: isMe ? 'rgba(184,134,11,0.04)' : 'transparent',
                    borderRadius: '3px',
                  }}>
                    {/* Rank */}
                    <Typography sx={{
                      fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '0.82rem',
                      color: i < 3 ? parchment.gold : parchment.inkFaint, width: 28, textAlign: 'center',
                    }}>
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </Typography>

                    {/* Avatar */}
                    <Avatar sx={{
                      width: 30, height: 30, fontSize: '0.63rem', fontWeight: 700, borderRadius: '3px',
                      bgcolor: isMe ? parchment.gold : parchment.accent, color: '#FDFBF7',
                    }}>
                      {init}
                    </Avatar>

                    {/* Name */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: parchment.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </Typography>
                        {isMe && <Chip label="You" size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, bgcolor: 'rgba(184,134,11,0.1)', color: parchment.gold, borderRadius: '2px' }} />}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                        <Chip label={s.id} size="small" sx={{ height: 16, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.56rem', bgcolor: 'rgba(44,24,16,0.04)', color: parchment.inkFaint, borderRadius: '2px' }} />
                        <Typography sx={{ fontSize: '0.65rem', color: parchment.inkFaint }}>{s.coursesGraded} courses</Typography>
                      </Box>
                    </Box>

                    {/* Score bar */}
                    <Box sx={{ width: 120, display: { xs: 'none', md: 'block' } }}>
                      <LinearProgress variant="determinate" value={barPct} sx={{
                        height: 4, borderRadius: '1px', bgcolor: 'rgba(44,24,16,0.04)',
                        '& .MuiLinearProgress-bar': { bgcolor: c, borderRadius: '1px', transition: 'width 0.5s ease' },
                      }} />
                    </Box>

                    {/* Score */}
                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '0.95rem', color: c, width: 36, textAlign: 'right' }}>
                      {s.avgScore}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </Card>
      )}
    </Box>
  );
}
