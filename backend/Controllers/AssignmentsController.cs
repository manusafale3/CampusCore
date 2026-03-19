using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CampusCoreAPI.DTOs;
using CampusCoreAPI.Models;
using CampusCoreAPI.Services;

namespace CampusCoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly AssignmentService _assignments;

        public AssignmentsController(AssignmentService assignments)
        {
            _assignments = assignments;
        }

        // GET api/assignments/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourse(string courseId)
        {
            var assignments = await _assignments.GetByCourse(courseId);
            return Ok(assignments);
        }

        // GET api/assignments/teacher/{teacherId}
        [HttpGet("teacher/{teacherId}")]
        public async Task<IActionResult> GetByTeacher(string teacherId)
        {
            var assignments = await _assignments.GetByTeacher(teacherId);
            return Ok(assignments);
        }

        // POST api/assignments — teacher creates assignment
        [Authorize(Roles = "teacher,admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAssignmentRequest req)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null) return Unauthorized();

            var assignment = new Assignment
            {
                CourseId = req.CourseId,
                Title = req.Title,
                Description = req.Description,
                Deadline = req.Deadline,
                MaxMarks = req.MaxMarks,
                CreatedBy = teacherId
            };

            var result = await _assignments.Create(assignment);
            return Ok(result);
        }

        // POST api/assignments/{assignmentId}/submit — student submits
        [Authorize(Roles = "student")]
        [HttpPost("{assignmentId}/submit")]
        public async Task<IActionResult> Submit(string assignmentId)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null) return Unauthorized();

            var result = await _assignments.Submit(assignmentId, studentId);

            var errorProp = result.GetType().GetProperty("error");
            if (errorProp != null)
                return BadRequest(result);

            return Ok(result);
        }

        // POST api/assignments/grade — teacher grades a submission
        [Authorize(Roles = "teacher,admin")]
        [HttpPost("grade")]
        public async Task<IActionResult> GradeSubmission([FromBody] GradeSubmissionRequest req)
        {
            var result = await _assignments.GradeSubmission(req.AssignmentId, req.StudentId, req.Marks);
            if (result == null) return NotFound(new { error = "Submission not found" });
            return Ok(result);
        }

        // GET api/assignments/{assignmentId}/submissions
        [HttpGet("{assignmentId}/submissions")]
        public async Task<IActionResult> GetSubmissions(string assignmentId)
        {
            var submissions = await _assignments.GetSubmissions(assignmentId);
            return Ok(submissions.Select(s => new
            {
                s.Id, s.AssignmentId, s.StudentId, s.SubmittedAt,
                s.Status, s.Marks,
                StudentName = s.Student?.Name
            }));
        }

        // GET api/assignments/student-submissions/{studentId}
        [HttpGet("student-submissions/{studentId}")]
        public async Task<IActionResult> GetStudentSubmissions(string studentId)
        {
            var submissions = await _assignments.GetStudentSubmissions(studentId);
            return Ok(submissions);
        }
    }
}
