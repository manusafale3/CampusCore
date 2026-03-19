using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusCoreAPI.DTOs;
using CampusCoreAPI.Services;

namespace CampusCoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendance;

        public AttendanceController(AttendanceService attendance)
        {
            _attendance = attendance;
        }

        // GET api/attendance/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(string studentId)
        {
            var records = await _attendance.GetByStudent(studentId);
            return Ok(records);
        }

        // GET api/attendance/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourse(string courseId)
        {
            var records = await _attendance.GetByCourse(courseId);
            return Ok(records.Select(a => new
            {
                a.Id, a.StudentId, a.CourseId, a.TotalClasses,
                a.Attended, a.Percentage,
                StudentName = a.Student?.Name
            }));
        }

        // GET api/attendance/{studentId}/{courseId}
        [HttpGet("{studentId}/{courseId}")]
        public async Task<IActionResult> GetRecord(string studentId, string courseId)
        {
            var record = await _attendance.GetRecord(studentId, courseId);
            if (record == null) return NotFound(new { error = "No attendance record" });
            return Ok(record);
        }

        // POST api/attendance/mark — mark single student
        [Authorize(Roles = "teacher,admin")]
        [HttpPost("mark")]
        public async Task<IActionResult> Mark([FromBody] MarkAttendanceRequest req)
        {
            var result = await _attendance.MarkAttendance(req.StudentId, req.CourseId, req.Present);
            return Ok(result);
        }

        // POST api/attendance/bulk — mark whole class at once
        [Authorize(Roles = "teacher,admin")]
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkMark([FromBody] BulkAttendanceRequest req)
        {
            var results = await _attendance.MarkBulkAttendance(req.CourseId, req.Marks);
            return Ok(results);
        }

        // GET api/attendance/logs?studentId=STU-001&courseId=CS-101
        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] string? studentId, [FromQuery] string? courseId)
        {
            var logs = await _attendance.GetLogs(studentId, courseId);
            return Ok(logs);
        }

        // GET api/attendance/check-today/{courseId}
        [HttpGet("check-today/{courseId}")]
        public async Task<IActionResult> CheckToday(string courseId)
        {
            var marked = await _attendance.IsMarkedToday(courseId);
            return Ok(new { courseId, markedToday = marked });
        }
    }
}
