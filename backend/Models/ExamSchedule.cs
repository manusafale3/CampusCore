using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class ExamSchedule
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string CourseId { get; set; } = string.Empty;

        public string CourseName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;  // "Mid-Semester", "Final"
        public DateTime Date { get; set; }
        public string Time { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int Semester { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}