using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Assignment
    {
        [Key]
        public string Id { get; set; } = string.Empty;  // "ASG-001"

        [Required]
        public string CourseId { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }

        [Required]
        public string CreatedBy { get; set; } = string.Empty;  // teacher's Id

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        [ForeignKey("CreatedBy")]
        public User? Creator { get; set; }
    }
}