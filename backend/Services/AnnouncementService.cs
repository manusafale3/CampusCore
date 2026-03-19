using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class AnnouncementService
    {
        private readonly AppDbContext _db;

        public AnnouncementService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Announcement>> GetAll()
        {
            return await _db.Announcements.OrderByDescending(a => a.Date).ToListAsync();
        }

        public async Task<Announcement> Create(Announcement announcement)
        {
            var count = await _db.Announcements.CountAsync();
            announcement.Id = $"ANN-{(count + 1).ToString("D3")}";
            announcement.Date = DateTime.UtcNow;

            _db.Announcements.Add(announcement);
            await _db.SaveChangesAsync();
            return announcement;
        }

        public async Task<bool> Delete(string id, string userId)
        {
            var announcement = await _db.Announcements.FindAsync(id);
            if (announcement == null) return false;

            // Only the author or admin can delete
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;
            if (announcement.AuthorId != userId && user.Role != "admin") return false;

            _db.Announcements.Remove(announcement);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}