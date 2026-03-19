using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CampusCoreAPI.DTOs;
using CampusCoreAPI.Models;
using CampusCoreAPI.Services;

namespace CampusCoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly StudentService _students;

        public StudentsController(StudentService students)
        {
            _students = students;
        }

        // GET api/students
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var students = await _students.GetAllStudents();
            return Ok(students.Select(s => new
            {
                s.Id, s.Name, s.Email, s.Phone, s.Department,
                s.RollNo, s.Division, s.Class, s.Semester, s.EnrollmentYear
            }));
        }

        // GET api/students/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var student = await _students.GetStudentById(id);
            if (student == null) return NotFound(new { error = "Student not found" });

            return Ok(new
            {
                student.Id, student.Name, student.Email, student.Phone,
                student.Address, student.Department, student.RollNo,
                student.Division, student.Class, student.Semester, student.EnrollmentYear
            });
        }

        // PUT api/students/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateStudentRequest req)
        {
            var updates = new User
            {
                Name = req.Name ?? string.Empty,
                Email = req.Email ?? string.Empty,
                Phone = req.Phone ?? string.Empty,
                Address = req.Address ?? string.Empty,
                Department = req.Department ?? string.Empty,
                RollNo = req.RollNo,
                Division = req.Division,
                Class = req.Class,
                Semester = req.Semester
            };

            var result = await _students.UpdateStudent(id, updates);
            if (result == null) return NotFound(new { error = "Student not found" });

            return Ok(result);
        }

        // GET api/students/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourse(string courseId)
        {
            var students = await _students.GetStudentsByCourse(courseId);
            return Ok(students.Select(s => new
            {
                s.Id, s.Name, s.Email, s.RollNo, s.Division, s.Department
            }));
        }
    }
}
