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
    public class FeesController : ControllerBase
    {
        private readonly FeeService _fees;

        public FeesController(FeeService fees)
        {
            _fees = fees;
        }

        // GET api/fees/me — student gets their own fee record
        [HttpGet("me")]
        public async Task<IActionResult> GetMyFees()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null) return Unauthorized();

            var fee = await _fees.GetByStudent(studentId);
            if (fee == null) return Ok(new { message = "No fee record yet" });
            return Ok(fee);
        }

        // GET api/fees/student/{studentId} — admin/teacher looks up a student's fees
        [Authorize(Roles = "teacher,admin")]
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(string studentId)
        {
            var fee = await _fees.GetByStudent(studentId);
            if (fee == null) return NotFound(new { error = "No fee record" });
            return Ok(fee);
        }

        // GET api/fees — admin gets all fee records
        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fees = await _fees.GetAll();
            return Ok(fees);
        }

        // POST api/fees/pay — student pays their fees
        [Authorize(Roles = "student")]
        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] PayFeeRequest req)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null) return Unauthorized();

            var fee = await _fees.PayFee(studentId, req.Amount);
            return Ok(fee);
        }
    }
}
