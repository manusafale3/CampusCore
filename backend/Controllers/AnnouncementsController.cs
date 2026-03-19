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
    public class AnnouncementsController : ControllerBase
    {
        private readonly AnnouncementService _announcements;

        public AnnouncementsController(AnnouncementService announcements)
        {
            _announcements = announcements;
        }

        // GET api/announcements
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var announcements = await _announcements.GetAll();
            return Ok(announcements);
        }

        // POST api/announcements — teacher or admin creates
        [Authorize(Roles = "teacher,admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.FindFirst("name")?.Value ?? "Unknown";
            if (userId == null) return Unauthorized();

            var announcement = new Announcement
            {
                Title = req.Title,
                Content = req.Content,
                Priority = req.Priority,
                TargetRole = req.TargetRole,
                AuthorId = userId,
                AuthorName = userName
            };

            var result = await _announcements.Create(announcement);
            return Ok(result);
        }

        // DELETE api/announcements/{id}
        [Authorize(Roles = "teacher,admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var success = await _announcements.Delete(id, userId);
            if (!success) return NotFound(new { error = "Not found or not authorized" });

            return Ok(new { success = true });
        }
    }
}
