const API = 'https://campuscore-afg2h9grgbf0h0gn.centralindia-01.azurewebsites.net/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    return null;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// AUTH
export const login = (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const signup = (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const getMe = () => request('/auth/me');

// STUDENTS
export const getStudents = () => request('/students');
export const getStudentById = (id) => request(`/students/${id}`);
export const updateStudent = (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const getStudentsByCourse = (courseId) => request(`/students/course/${courseId}`);

// COURSES
export const getCourses = () => request('/courses');
export const getCourseById = (id) => request(`/courses/${id}`);
export const getCoursesByTeacher = (teacherId) => request(`/courses/teacher/${teacherId}`);
export const getCoursesByStudent = (studentId) => request(`/courses/student/${studentId}`);
export const enrollCourse = (courseId) => request('/courses/enroll', { method: 'POST', body: JSON.stringify({ courseId }) });
export const unenrollCourse = (courseId) => request(`/courses/unenroll/${courseId}`, { method: 'DELETE' });

// GRADES
export const getGradesByStudent = (studentId) => request(`/grades/student/${studentId}`);
export const getGradesByCourse = (courseId) => request(`/grades/course/${courseId}`);
export const getGrade = (studentId, courseId) => request(`/grades/${studentId}/${courseId}`);
export const setGrade = (data) => request('/grades', { method: 'POST', body: JSON.stringify(data) });
export const getLeaderboard = (courseId) => request(`/grades/leaderboard${courseId ? `?courseId=${courseId}` : ''}`);

// ATTENDANCE
export const getAttendanceByStudent = (studentId) => request(`/attendance/student/${studentId}`);
export const getAttendanceByCourse = (courseId) => request(`/attendance/course/${courseId}`);
export const getAttendanceRecord = (studentId, courseId) => request(`/attendance/${studentId}/${courseId}`);
export const markAttendance = (data) => request('/attendance/mark', { method: 'POST', body: JSON.stringify(data) });
export const markBulkAttendance = (courseId, marks) => request('/attendance/bulk', { method: 'POST', body: JSON.stringify({ courseId, marks }) });
export const getAttendanceLogs = (studentId, courseId) => {
  const p = new URLSearchParams();
  if (studentId) p.append('studentId', studentId);
  if (courseId) p.append('courseId', courseId);
  return request(`/attendance/logs?${p}`);
};

// ASSIGNMENTS
export const getAssignmentsByCourse = (courseId) => request(`/assignments/course/${courseId}`);
export const getAssignmentsByTeacher = (teacherId) => request(`/assignments/teacher/${teacherId}`);
export const createAssignment = (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) });
export const submitAssignment = (assignmentId) => request(`/assignments/${assignmentId}/submit`, { method: 'POST' });
export const gradeSubmission = (data) => request('/assignments/grade', { method: 'POST', body: JSON.stringify(data) });
export const getSubmissions = (assignmentId) => request(`/assignments/${assignmentId}/submissions`);
export const getStudentSubmissions = (studentId) => request(`/assignments/student-submissions/${studentId}`);

// ANNOUNCEMENTS
export const getAnnouncements = () => request('/announcements');
export const createAnnouncement = (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) });
export const deleteAnnouncement = (id) => request(`/announcements/${id}`, { method: 'DELETE' });

// FEES
export const getMyFees = () => request('/fees/me');
export const getAllFees = () => request('/fees');
export const getFeesByStudent = (studentId) => request(`/fees/student/${studentId}`);
export const payFee = (amount) => request('/fees/pay', { method: 'POST', body: JSON.stringify({ amount }) });
