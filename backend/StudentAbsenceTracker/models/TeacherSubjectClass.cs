using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Models;

public class TeacherSubjectClass
{
    [Key]
    public int Id { get; set; }
    
    public int TeacherId { get; set; }
    public virtual Teacher? Teacher { get; set; }
    
    public int SubjectId { get; set; }
    public virtual Subject? Subject { get; set; }
    
    public int ClassId { get; set; }
    public virtual Class? Class { get; set; }
    
    [Required]
    public string AcademicPeriod { get; set; } = string.Empty;
} 