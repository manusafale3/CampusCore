using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusCoreAPI.Models
{
    public class Fee
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StudentId { get; set; } = string.Empty;

        public decimal Tuition { get; set; }
        public decimal LabFee { get; set; }
        public decimal LibraryFee { get; set; }
        public decimal ActivityFee { get; set; }
        public decimal TotalFee { get; set; }
        public decimal Paid { get; set; }
        public string Status { get; set; } = "Unpaid";  // "Paid", "Partial", "Unpaid"
        public DateTime? PaidDate { get; set; }
        public string? ReceiptNo { get; set; }

        [ForeignKey("StudentId")]
        public User? Student { get; set; }
    }
}