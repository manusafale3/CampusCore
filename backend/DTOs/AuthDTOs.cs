namespace CampusCoreAPI.DTOs
{
    // === AUTH ===
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class SignupRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        // Student-specific
        public string? RollNo { get; set; }
        public string? Division { get; set; }
        public string? Class { get; set; }
        public int? Semester { get; set; }
        public int? EnrollmentYear { get; set; }
        // Teacher-specific
        public string? FacultyCode { get; set; }
        public string? Qualification { get; set; }
        public string? Specialization { get; set; }
    }

    // === GRADES ===
    public class SetGradeRequest
    {
        public string StudentId { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public int Midterm { get; set; }
        public int Final { get; set; }
        public int Assignment { get; set; }
    }

    // === ATTENDANCE ===
    public class MarkAttendanceRequest
    {
        public string StudentId { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public bool Present { get; set; }
    }

    public class BulkAttendanceRequest
    {
        public string CourseId { get; set; } = string.Empty;
        public Dictionary<string, bool> Marks { get; set; } = new();
    }

    // === ASSIGNMENTS ===
    public class CreateAssignmentRequest
    {
        public string CourseId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
    }

    public class GradeSubmissionRequest
    {
        public string AssignmentId { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public int Marks { get; set; }
    }

    // === ANNOUNCEMENTS ===
    public class CreateAnnouncementRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Priority { get; set; } = "medium";
        public string TargetRole { get; set; } = "all";
    }

    // === FEES ===
    public class PayFeeRequest
    {
        public decimal Amount { get; set; }
    }

    // === ENROLLMENT ===
    public class EnrollRequest
    {
        public string CourseId { get; set; } = string.Empty;
    }

    // === STUDENT UPDATE ===
    public class UpdateStudentRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Department { get; set; }
        public string? RollNo { get; set; }
        public string? Division { get; set; }
        public string? Class { get; set; }
        public int? Semester { get; set; }
    }
}
