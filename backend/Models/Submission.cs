using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Submission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AssignmentId { get; set; } = string.Empty;

        [Required]
        public string StudentId { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "submitted";  // "submitted", "graded"
        public int? Marks { get; set; }  // null until graded

        [ForeignKey("AssignmentId")]
        public Assignment? Assignment { get; set; }

        [ForeignKey("StudentId")]
        public User? Student { get; set; }
    }
}