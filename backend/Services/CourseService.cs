using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class CourseService
    {
        private readonly AppDbContext _db;

        public CourseService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Course>> GetAllCourses()
        {
            return await _db.Courses.Include(c => c.Teacher).ToListAsync();
        }

        public async Task<Course?> GetCourseById(string id)
        {
            return await _db.Courses.Include(c => c.Teacher).FirstOrDefaultAsync(c => c.Id == id);
        }

        // Get courses a teacher is assigned to
        public async Task<List<Course>> GetCoursesByTeacher(string teacherId)
        {
            return await _db.Courses.Include(c => c.Teacher).Where(c => c.TeacherId == teacherId).ToListAsync();
        }

        // Get courses a student is enrolled in
        public async Task<List<Course>> GetCoursesByStudent(string studentId)
        {
            var courseIds = await _db.Enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => e.CourseId)
                .ToListAsync();

            return await _db.Courses
                .Include(c => c.Teacher)
                .Where(c => courseIds.Contains(c.Id))
                .ToListAsync();
        }

        // Enroll a student in a course
        public async Task<object> EnrollStudent(string studentId, string courseId)
        {
            var course = await _db.Courses.FindAsync(courseId);
            if (course == null)
                return new { error = "Course not found" };

            var existing = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);
            if (existing != null)
                return new { error = "Already enrolled" };

            var enrolledCount = await _db.Enrollments.CountAsync(e => e.CourseId == courseId);
            if (enrolledCount >= course.Capacity)
                return new { error = "Course is full" };

            var enrollment = new Enrollment
            {
                StudentId = studentId,
                CourseId = courseId,
                EnrolledAt = DateTime.UtcNow
            };

            _db.Enrollments.Add(enrollment);
            await _db.SaveChangesAsync();
            return new { success = true, enrollment };
        }

        // Unenroll a student
        public async Task<bool> UnenrollStudent(string studentId, string courseId)
        {
            var enrollment = await _db.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);
            if (enrollment == null) return false;

            _db.Enrollments.Remove(enrollment);
            await _db.SaveChangesAsync();
            return true;
        }

        // Get enrolled student count for a course
        public async Task<int> GetEnrolledCount(string courseId)
        {
            return await _db.Enrollments.CountAsync(e => e.CourseId == courseId);
        }
    }
}