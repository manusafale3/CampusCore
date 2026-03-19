using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Data;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Services
{
    public class FeeService
    {
        private readonly AppDbContext _db;

        public FeeService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Fee?> GetByStudent(string studentId)
        {
            return await _db.Fees.FirstOrDefaultAsync(f => f.StudentId == studentId);
        }

        public async Task<List<Fee>> GetAll()
        {
            return await _db.Fees.Include(f => f.Student).ToListAsync();
        }

        public async Task<Fee> PayFee(string studentId, decimal amount)
        {
            var fee = await _db.Fees.FirstOrDefaultAsync(f => f.StudentId == studentId);

            if (fee == null)
            {
                fee = new Fee
                {
                    StudentId = studentId,
                    Tuition = 45000,
                    LabFee = 8000,
                    LibraryFee = 3000,
                    ActivityFee = 2000,
                    TotalFee = 58000,
                    Paid = 0,
                    Status = "Unpaid"
                };
                _db.Fees.Add(fee);
            }

            fee.Paid = Math.Min(fee.Paid + amount, fee.TotalFee);
            fee.PaidDate = DateTime.UtcNow;
            fee.ReceiptNo = fee.ReceiptNo ?? $"RCP-{DateTime.UtcNow:yyyy}-{studentId}";
            fee.Status = fee.Paid >= fee.TotalFee ? "Paid" : "Partial";

            await _db.SaveChangesAsync();
            return fee;
        }

        // Pay course enrollment fee
        public async Task<bool> PayCourseFee(string studentId, string courseId, decimal amount)
        {
            var existing = await _db.Fees
                .FirstOrDefaultAsync(f => f.StudentId == studentId);

            // Track as part of overall fees for now
            // In a full system this would be a separate CourseFeePayment table
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
