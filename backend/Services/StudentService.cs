using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class StudentService
    {
        private readonly AppDbContext _db;

        public StudentService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<User>> GetAllStudents()
        {
            return await _db.Users.Where(u => u.Role == "student").ToListAsync();
        }

        public async Task<User?> GetStudentById(string id)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "student");
        }

        public async Task<User?> UpdateStudent(string id, User updates)
        {
            var student = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "student");
            if (student == null) return null;

            student.Name = updates.Name ?? student.Name;
            student.Email = updates.Email ?? student.Email;
            student.Phone = updates.Phone ?? student.Phone;
            student.Address = updates.Address ?? student.Address;
            student.Department = updates.Department ?? student.Department;
            student.RollNo = updates.RollNo ?? student.RollNo;
            student.Division = updates.Division ?? student.Division;
            student.Class = updates.Class ?? student.Class;
            student.Semester = updates.Semester ?? student.Semester;

            await _db.SaveChangesAsync();
            return student;
        }

        // Get students enrolled in a specific course
        public async Task<List<User>> GetStudentsByCourse(string courseId)
        {
            var studentIds = await _db.Enrollments
                .Where(e => e.CourseId == courseId)
                .Select(e => e.StudentId)
                .ToListAsync();

            return await _db.Users
                .Where(u => studentIds.Contains(u.Id))
                .ToListAsync();
        }
    }
}