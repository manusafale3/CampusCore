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
    public class CoursesController : ControllerBase
    {
        private readonly CourseService _courses;

        public CoursesController(CourseService courses)
        {
            _courses = courses;
        }

        // GET api/courses
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _courses.GetAllCourses();
            return Ok(courses.Select(c => new
            {
                c.Id, c.Name, c.FullName, c.Department, c.Credits,
                c.Capacity, c.CourseFee, c.Semester, c.Description,
                c.TeacherId,
                TeacherName = c.Teacher?.Name
            }));
        }

        // GET api/courses/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var course = await _courses.GetCourseById(id);
            if (course == null) return NotFound(new { error = "Course not found" });

            var enrolled = await _courses.GetEnrolledCount(id);
            return Ok(new
            {
                course.Id, course.Name, course.FullName, course.Department,
                course.Credits, course.Capacity, course.CourseFee,
                course.Semester, course.Description, course.TeacherId,
                TeacherName = course.Teacher?.Name,
                EnrolledCount = enrolled
            });
        }

        // GET api/courses/teacher/{teacherId}
        [HttpGet("teacher/{teacherId}")]
        public async Task<IActionResult> GetByTeacher(string teacherId)
        {
            var courses = await _courses.GetCoursesByTeacher(teacherId);
            return Ok(courses);
        }

        // GET api/courses/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(string studentId)
        {
            var courses = await _courses.GetCoursesByStudent(studentId);
            return Ok(courses);
        }

        // POST api/courses/enroll
        [HttpPost("enroll")]
        public async Task<IActionResult> Enroll([FromBody] EnrollRequest req)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null) return Unauthorized();

            var result = await _courses.EnrollStudent(studentId, req.CourseId);

            var errorProp = result.GetType().GetProperty("error");
            if (errorProp != null)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE api/courses/unenroll/{courseId}
        [HttpDelete("unenroll/{courseId}")]
        public async Task<IActionResult> Unenroll(string courseId)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null) return Unauthorized();

            var success = await _courses.UnenrollStudent(studentId, courseId);
            if (!success) return NotFound(new { error = "Enrollment not found" });

            return Ok(new { success = true });
        }
    }
}
