using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class AttendanceLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StudentId { get; set; } = string.Empty;

        [Required]
        public string CourseId { get; set; } = string.Empty;

        public DateTime Date { get; set; }
        public bool Present { get; set; }

        [ForeignKey("StudentId")]
        public User? Student { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}