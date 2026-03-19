using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class GradeService
    {
        private readonly AppDbContext _db;

        public GradeService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Grade>> GetGradesByStudent(string studentId)
        {
            return await _db.Grades.Where(g => g.StudentId == studentId).ToListAsync();
        }

        public async Task<List<Grade>> GetGradesByCourse(string courseId)
        {
            return await _db.Grades.Include(g => g.Student).Where(g => g.CourseId == courseId).ToListAsync();
        }

        public async Task<Grade?> GetGrade(string studentId, string courseId)
        {
            return await _db.Grades.FirstOrDefaultAsync(g => g.StudentId == studentId && g.CourseId == courseId);
        }

        public async Task<Grade> SetGrade(string studentId, string courseId, int midterm, int final_, int assignment)
        {
            var total = (int)Math.Round((midterm + final_ + assignment) / 3.0);
            var gradeLetter = total >= 90 ? "A+" : total >= 80 ? "A" : total >= 75 ? "B+" :
                              total >= 70 ? "B" : total >= 65 ? "C+" : total >= 60 ? "C" :
                              total >= 50 ? "D+" : total >= 40 ? "D" : "F";

            var existing = await _db.Grades.FirstOrDefaultAsync(g => g.StudentId == studentId && g.CourseId == courseId);

            if (existing != null)
            {
                existing.Midterm = midterm;
                existing.Final = final_;
                existing.Assignment = assignment;
                existing.Total = total;
                existing.GradeLetter = gradeLetter;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                existing = new Grade
                {
                    StudentId = studentId,
                    CourseId = courseId,
                    Midterm = midterm,
                    Final = final_,
                    Assignment = assignment,
                    Total = total,
                    GradeLetter = gradeLetter,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Grades.Add(existing);
            }

            await _db.SaveChangesAsync();
            return existing;
        }

        // Leaderboard — all students ranked by average score
        public async Task<List<object>> GetLeaderboard(string? courseId = null)
        {
            var students = await _db.Users.Where(u => u.Role == "student").ToListAsync();
            var result = new List<object>();

            foreach (var student in students)
            {
                var grades = courseId != null
                    ? await _db.Grades.Where(g => g.StudentId == student.Id && g.CourseId == courseId).ToListAsync()
                    : await _db.Grades.Where(g => g.StudentId == student.Id).ToListAsync();

                if (grades.Count == 0) continue;

                var avg = (int)Math.Round(grades.Average(g => g.Total));
                result.Add(new
                {
                    student.Id,
                    student.Name,
                    student.RollNo,
                    avgScore = avg,
                    coursesGraded = grades.Count
                });
            }

            return result.OrderByDescending(r => ((dynamic)r).avgScore).ToList();
        }
    }
}