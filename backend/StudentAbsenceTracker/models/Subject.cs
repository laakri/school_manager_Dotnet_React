using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Models;

public class Subject
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public int TeacherId { get; set; }
    public virtual Teacher? Teacher { get; set; }
    
    public int ClassId { get; set; }
    public virtual Class? Class { get; set; }
    
    public virtual ICollection<TeacherSubjectClass> TeacherSubjectClasses { get; set; } = new List<TeacherSubjectClass>();
} 