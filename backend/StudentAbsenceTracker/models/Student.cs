using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        public int? ClassId { get; set; }
        public virtual Class? Class { get; set; }
        
        public virtual ICollection<Absence> Absences { get; set; } = new List<Absence>();
    }

}
