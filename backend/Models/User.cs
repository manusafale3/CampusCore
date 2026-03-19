using System.ComponentModel.DataAnnotations;

namespace CampusCoreAPI.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;  // "student", "teacher", "admin"

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Student-specific fields (null for teachers/admin)
        public string? RollNo { get; set; }
        public string? Division { get; set; }
        public string? Class { get; set; }
        public int? Semester { get; set; }
        public int? EnrollmentYear { get; set; }

        // Teacher-specific fields (null for students/admin)
        public string? FacultyCode { get; set; }
        public string? Qualification { get; set; }
        public string? Specialization { get; set; }

        // Admin-specific
        public string? AdminKey { get; set; }
    }
}