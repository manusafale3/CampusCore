using Microsoft.EntityFrameworkCore;
using CampusCoreAPI.Models;

namespace CampusCoreAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Grade> Grades { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<AttendanceLog> AttendanceLogs { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Fee> Fees { get; set; }
        public DbSet<ExamSchedule> ExamSchedules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Decimal precision for money fields
            modelBuilder.Entity<Course>().Property(c => c.CourseFee).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Fee>().Property(f => f.Tuition).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Fee>().Property(f => f.LabFee).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Fee>().Property(f => f.LibraryFee).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Fee>().Property(f => f.ActivityFee).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Fee>().Property(f => f.TotalFee).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Fee>().Property(f => f.Paid).HasColumnType("decimal(10,2)");

            // Prevent cascade delete cycles — use Restrict instead of Cascade
            // This means: if you delete a user, you must manually delete their related records first
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Teacher).WithMany().HasForeignKey(c => c.TeacherId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Creator).WithMany().HasForeignKey(a => a.CreatedBy).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Course).WithMany().HasForeignKey(a => a.CourseId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Assignment).WithMany().HasForeignKey(s => s.AssignmentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Student).WithMany().HasForeignKey(s => s.StudentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Student).WithMany().HasForeignKey(e => e.StudentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course).WithMany().HasForeignKey(e => e.CourseId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Grade>()
                .HasOne(g => g.Student).WithMany().HasForeignKey(g => g.StudentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Grade>()
                .HasOne(g => g.Course).WithMany().HasForeignKey(g => g.CourseId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Student).WithMany().HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Course).WithMany().HasForeignKey(a => a.CourseId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AttendanceLog>()
                .HasOne(a => a.Student).WithMany().HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AttendanceLog>()
                .HasOne(a => a.Course).WithMany().HasForeignKey(a => a.CourseId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExamSchedule>()
                .HasOne(e => e.Course).WithMany().HasForeignKey(e => e.CourseId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}