using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Models;

public class Absence
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public string Session { get; set; } = string.Empty;
    
    public int StudentId { get; set; }
    public virtual Student? Student { get; set; }
    
    public int TeacherSubjectClassId { get; set; }
    public virtual TeacherSubjectClass? TeacherSubjectClass { get; set; }
    
    public bool IsJustified { get; set; }
    public string? JustificationNote { get; set; }
} 