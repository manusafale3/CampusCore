using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class AttendanceService
    {
        private readonly AppDbContext _db;

        public AttendanceService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Attendance>> GetByStudent(string studentId)
        {
            return await _db.Attendances.Where(a => a.StudentId == studentId).ToListAsync();
        }

        public async Task<List<Attendance>> GetByCourse(string courseId)
        {
            return await _db.Attendances.Include(a => a.Student).Where(a => a.CourseId == courseId).ToListAsync();
        }

        public async Task<Attendance?> GetRecord(string studentId, string courseId)
        {
            return await _db.Attendances.FirstOrDefaultAsync(a => a.StudentId == studentId && a.CourseId == courseId);
        }

        // Mark attendance for one student in one course
        public async Task<Attendance> MarkAttendance(string studentId, string courseId, bool present)
        {
            // Update or create the summary record
            var record = await _db.Attendances
                .FirstOrDefaultAsync(a => a.StudentId == studentId && a.CourseId == courseId);

            if (record == null)
            {
                record = new Attendance
                {
                    StudentId = studentId,
                    CourseId = courseId,
                    TotalClasses = 0,
                    Attended = 0,
                    Percentage = 0
                };
                _db.Attendances.Add(record);
            }

            record.TotalClasses++;
            if (present) record.Attended++;
            record.Percentage = (int)Math.Round((double)record.Attended / record.TotalClasses * 100);

            // Also add a daily log entry
            var log = new AttendanceLog
            {
                StudentId = studentId,
                CourseId = courseId,
                Date = DateTime.UtcNow,
                Present = present
            };
            _db.AttendanceLogs.Add(log);

            await _db.SaveChangesAsync();
            return record;
        }

        // Mark attendance for multiple students at once (teacher marks whole class)
        public async Task<List<Attendance>> MarkBulkAttendance(string courseId, Dictionary<string, bool> marks)
        {
            var results = new List<Attendance>();

            foreach (var entry in marks)
            {
                var result = await MarkAttendance(entry.Key, courseId, entry.Value);
                results.Add(result);
            }

            return results;
        }

        // Get daily logs for calendar view
        public async Task<List<AttendanceLog>> GetLogs(string? studentId = null, string? courseId = null)
        {
            var query = _db.AttendanceLogs.AsQueryable();
            if (studentId != null) query = query.Where(l => l.StudentId == studentId);
            if (courseId != null) query = query.Where(l => l.CourseId == courseId);
            return await query.OrderByDescending(l => l.Date).ToListAsync();
        }

        // Check if attendance was already marked today for a course
        public async Task<bool> IsMarkedToday(string courseId)
        {
            var today = DateTime.UtcNow.Date;
            return await _db.AttendanceLogs.AnyAsync(l => l.CourseId == courseId && l.Date.Date == today);
        }
    }
}