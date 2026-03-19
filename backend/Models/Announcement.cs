using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Announcement
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;
        public string Priority { get; set; } = "medium";  // "high", "medium", "low"
        public string TargetRole { get; set; } = "all";  // "all", "student", "teacher"

        [Required]
        public string AuthorId { get; set; } = string.Empty;

        public string AuthorName { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;

        [ForeignKey("AuthorId")]
        public User? Author { get; set; }
    }
}