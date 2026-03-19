using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Grade
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StudentId { get; set; } = string.Empty;

        [Required]
        public string CourseId { get; set; } = string.Empty;

        public int Midterm { get; set; }
        public int Final { get; set; }
        public int Assignment { get; set; }
        public int Total { get; set; }
        public string GradeLetter { get; set; } = string.Empty;  // "A+", "B", etc.
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("StudentId")]
        public User? Student { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}