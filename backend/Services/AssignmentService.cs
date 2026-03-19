using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class AssignmentService
    {
        private readonly AppDbContext _db;

        public AssignmentService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Assignment>> GetByCourse(string courseId)
        {
            return await _db.Assignments.Where(a => a.CourseId == courseId).ToListAsync();
        }

        public async Task<List<Assignment>> GetByTeacher(string teacherId)
        {
            return await _db.Assignments.Where(a => a.CreatedBy == teacherId).ToListAsync();
        }

        public async Task<Assignment> Create(Assignment assignment)
        {
            // Generate ID
            var count = await _db.Assignments.CountAsync();
            assignment.Id = $"ASG-{(count + 1).ToString("D3")}";
            assignment.CreatedAt = DateTime.UtcNow;

            _db.Assignments.Add(assignment);
            await _db.SaveChangesAsync();
            return assignment;
        }

        // Student submits an assignment
        public async Task<object> Submit(string assignmentId, string studentId)
        {
            var existing = await _db.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

            if (existing != null)
                return new { error = "Already submitted" };

            var submission = new Submission
            {
                AssignmentId = assignmentId,
                StudentId = studentId,
                SubmittedAt = DateTime.UtcNow,
                Status = "submitted",
                Marks = null
            };

            _db.Submissions.Add(submission);
            await _db.SaveChangesAsync();
            return new { success = true, submission };
        }

        // Teacher grades a submission
        public async Task<Submission?> GradeSubmission(string assignmentId, string studentId, int marks)
        {
            var submission = await _db.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

            if (submission == null) return null;

            submission.Marks = marks;
            submission.Status = "graded";
            await _db.SaveChangesAsync();
            return submission;
        }

        // Get submissions for an assignment
        public async Task<List<Submission>> GetSubmissions(string assignmentId)
        {
            return await _db.Submissions
                .Include(s => s.Student)
                .Where(s => s.AssignmentId == assignmentId)
                .ToListAsync();
        }

        // Get a student's submissions across all assignments
        public async Task<List<Submission>> GetStudentSubmissions(string studentId)
        {
            return await _db.Submissions
                .Where(s => s.StudentId == studentId)
                .ToListAsync();
        }
    }
}