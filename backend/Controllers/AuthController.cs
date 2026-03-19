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
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;

        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        // POST api/auth/signup
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest req)
        {
            var user = new User
            {
                Username = req.Username,
                Role = req.Role,
                Name = req.Name,
                Email = req.Email,
                Phone = req.Phone,
                Department = req.Department,
                RollNo = req.RollNo,
                Division = req.Division,
                Class = req.Class,
                Semester = req.Semester,
                EnrollmentYear = req.EnrollmentYear,
                FacultyCode = req.FacultyCode,
                Qualification = req.Qualification,
                Specialization = req.Specialization
            };

            var result = await _auth.Signup(user, req.Password);

            // Check if the service returned an error
            var errorProp = result.GetType().GetProperty("error");
            if (errorProp != null)
                return BadRequest(result);

            return Ok(result);
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var result = await _auth.Login(req.Username, req.Password);

            var errorProp = result.GetType().GetProperty("error");
            if (errorProp != null)
                return BadRequest(result);

            return Ok(result);
        }

        // GET api/auth/me — requires valid JWT token
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _auth.GetUserById(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Name,
                user.Role,
                user.Email,
                user.Phone,
                user.Department,
                user.Address,
                user.CreatedAt,
                user.RollNo,
                user.Division,
                user.Class,
                user.Semester,
                user.EnrollmentYear,
                user.FacultyCode,
                user.Qualification,
                user.Specialization
            });
        }
    }
}
