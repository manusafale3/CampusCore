using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Enrollment
    {
        [Key]
        public int Id { get; set; }  // auto-generated number

        [Required]
        public string StudentId { get; set; } = string.Empty;

        [Required]
        public string CourseId { get; set; } = string.Empty;

        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("StudentId")]
        public User? Student { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}