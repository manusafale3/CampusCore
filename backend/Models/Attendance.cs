using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StudentId { get; set; } = string.Empty;

        [Required]
        public string CourseId { get; set; } = string.Empty;

        public int TotalClasses { get; set; }
        public int Attended { get; set; }
        public int Percentage { get; set; }

        [ForeignKey("StudentId")]
        public User? Student { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}