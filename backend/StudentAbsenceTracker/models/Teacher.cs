using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Models;

public class Teacher
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    public virtual ICollection<TeacherSubjectClass> TeacherSubjectClasses { get; set; } = new List<TeacherSubjectClass>();
} 