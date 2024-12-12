using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAbsenceTracker.Data;
using StudentAbsenceTracker.Models;

namespace StudentAbsenceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AbsencesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AbsencesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAbsences()
    {
        var absences = await _context.Absences
            .Include(a => a.Student)
            .Include(a => a.TeacherSubjectClass)
                .ThenInclude(tsc => tsc.Subject)
            .Select(a => new
            {
                a.Id,
                a.Date,
                a.Session,
                Student = new
                {
                    a.Student.Id,
                    a.Student.FirstName,
                    a.Student.LastName
                },
                Subject = new
                {
                    a.TeacherSubjectClass.Subject.Id,
                    a.TeacherSubjectClass.Subject.Name
                },
                a.IsJustified,
                a.JustificationNote
            })
            .ToListAsync();

        return Ok(absences);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetAbsencesByStudent(int studentId)
    {
        var absences = await _context.Absences
            .Include(a => a.TeacherSubjectClass)
                .ThenInclude(tsc => tsc.Subject)
            .Where(a => a.StudentId == studentId)
            .Select(a => new
            {
                a.Id,
                a.Date,
                a.Session,
                Subject = new
                {
                    a.TeacherSubjectClass.Subject.Id,
                    a.TeacherSubjectClass.Subject.Name
                },
                a.IsJustified,
                a.JustificationNote
            })
            .ToListAsync();

        if (!absences.Any())
        {
            return NotFound($"No absences found for student with ID {studentId}");
        }

        return Ok(absences);
    }

    [HttpPost]
    public async Task<ActionResult<Absence>> CreateAbsence(Absence absence)
    {
        _context.Absences.Add(absence);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAbsences), new { id = absence.Id }, absence);
    }
} 