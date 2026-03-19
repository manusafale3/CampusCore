using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Course
    {
        [Key]
        public string Id { get; set; } = string.Empty;  // "CS-101"

        [Required]
        public string Name { get; set; } = string.Empty;  // "Computer"

        [Required]
        public string FullName { get; set; } = string.Empty;  // "Computer Science Fundamentals"

        public string Department { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int Capacity { get; set; }
        public decimal CourseFee { get; set; }
        public int Semester { get; set; }
        public string Description { get; set; } = string.Empty;

        // Foreign Key — which teacher teaches this course
        [Required]
        public string TeacherId { get; set; } = string.Empty;

        // Navigation property — EF uses this to load the actual Teacher object
        [ForeignKey("TeacherId")]
        public User? Teacher { get; set; }
    }
}