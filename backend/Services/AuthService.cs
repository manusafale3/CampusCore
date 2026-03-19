using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        private static readonly HashSet<string> ValidRoles = ["student", "teacher"];

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // Hash a password — never store plain text
        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Check if a password matches its hash
        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        // Generate a JWT token for a logged-in user
        private string GenerateToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("name", user.Name),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Project only safe fields — never expose PasswordHash to clients
        private static object SafeUser(User user) => new
        {
            user.Id,
            user.Username,
            user.Name,
            user.Role,
            user.Email,
            user.Phone,
            user.Department,
            user.CreatedAt
        };

        // Generate next ID based on role — uses max existing ID so deletions don't cause collisions
        private async Task<string> GenerateId(string role)
        {
            string prefix = role == "student" ? "STU" : role == "teacher" ? "TCH" : "ADM";

            var maxId = await _db.Users
                .Where(u => u.Role == role)
                .Select(u => u.Id)
                .OrderByDescending(id => id)
                .FirstOrDefaultAsync();

            int nextNum = 1;
            if (maxId != null && maxId.Length > 4 && int.TryParse(maxId[4..], out int current))
                nextNum = current + 1;

            return $"{prefix}-{nextNum:D3}";
        }

        // === SIGNUP ===
        public async Task<object> Signup(User userData, string password)
        {
            if (string.IsNullOrWhiteSpace(userData.Username))
                return new { error = "Username is required" };

            if (!ValidRoles.Contains(userData.Role))
                return new { error = "Invalid role. Must be 'student' or 'teacher'" };

            var username = userData.Username.ToLower();
            var existing = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (existing != null)
                return new { error = "Username already exists" };

            userData.Id = await GenerateId(userData.Role);
            userData.Username = username;
            userData.PasswordHash = HashPassword(password);
            userData.CreatedAt = DateTime.UtcNow;

            _db.Users.Add(userData);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // ID collision from a race condition — regenerate and retry once
                userData.Id = await GenerateId(userData.Role);
                await _db.SaveChangesAsync();
            }

            var token = GenerateToken(userData);
            return new { user = SafeUser(userData), token };
        }

        // === LOGIN ===
        public async Task<object> Login(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username))
                return new { error = "Username is required" };

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
            if (user == null)
                return new { error = "User not found" };

            if (!VerifyPassword(password, user.PasswordHash))
                return new { error = "Invalid password" };

            var token = GenerateToken(user);
            return new { user = SafeUser(user), token };
        }

        // === GET CURRENT USER ===
        public async Task<User?> GetUserById(string id)
        {
            return await _db.Users.FindAsync(id);
        }
    }
}
