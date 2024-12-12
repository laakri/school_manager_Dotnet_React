using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Models;

public class Class
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // Navigation properties
    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
    public virtual ICollection<TeacherSubjectClass> TeacherSubjects { get; set; } = new List<TeacherSubjectClass>();
} 