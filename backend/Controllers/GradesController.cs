using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CampusCoreAPI.DTOs;
using CampusCoreAPI.Services;

namespace CampusCoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GradesController : ControllerBase
    {
        private readonly GradeService _grades;

        public GradesController(GradeService grades)
        {
            _grades = grades;
        }

        // GET api/grades/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(string studentId)
        {
            var grades = await _grades.GetGradesByStudent(studentId);
            return Ok(grades);
        }

        // GET api/grades/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourse(string courseId)
        {
            var grades = await _grades.GetGradesByCourse(courseId);
            return Ok(grades.Select(g => new
            {
                g.Id, g.StudentId, g.CourseId, g.Midterm, g.Final,
                g.Assignment, g.Total, g.GradeLetter, g.UpdatedAt,
                StudentName = g.Student?.Name
            }));
        }

        // GET api/grades/{studentId}/{courseId}
        [HttpGet("{studentId}/{courseId}")]
        public async Task<IActionResult> GetGrade(string studentId, string courseId)
        {
            var grade = await _grades.GetGrade(studentId, courseId);
            if (grade == null) return NotFound(new { error = "Grade not found" });
            return Ok(grade);
        }

        // POST api/grades — teacher sets/updates a grade
        [Authorize(Roles = "teacher,admin")]
        [HttpPost]
        public async Task<IActionResult> SetGrade([FromBody] SetGradeRequest req)
        {
            var grade = await _grades.SetGrade(req.StudentId, req.CourseId, req.Midterm, req.Final, req.Assignment);
            return Ok(grade);
        }

        // GET api/grades/leaderboard?courseId=CS-101
        [HttpGet("leaderboard")]
        public async Task<IActionResult> Leaderboard([FromQuery] string? courseId)
        {
            var leaderboard = await _grades.GetLeaderboard(courseId);
            return Ok(leaderboard);
        }
    }
}
