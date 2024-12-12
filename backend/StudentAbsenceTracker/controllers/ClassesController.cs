using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAbsenceTracker.Data;
using StudentAbsenceTracker.Models;
using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClassesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClassesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Class>>> GetClasses()
    {
        return await _context.Classes
            .Include(c => c.Students)
            .Include(c => c.TeacherSubjects)
                .ThenInclude(ts => ts.Teacher)
            .Include(c => c.TeacherSubjects)
                .ThenInclude(ts => ts.Subject)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Class>> GetClass(int id)
    {
        var class_ = await _context.Classes
            .Include(c => c.Students)
            .Include(c => c.TeacherSubjects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (class_ == null)
        {
            return NotFound();
        }

        return class_;
    }

    [HttpPost]
    public async Task<ActionResult<Class>> CreateClass(Class class_)
    {
        _context.Classes.Add(class_);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClass), new { id = class_.Id }, class_);
    }

    // Assign teacher to a class for a subject
    [HttpPost("assign-teacher")]
    public async Task<ActionResult> AssignTeacher(TeacherAssignmentRequest request)
    {
        var assignment = new TeacherSubjectClass
        {
            TeacherId = request.TeacherId,
            SubjectId = request.SubjectId,
            ClassId = request.ClassId,
            AcademicPeriod = request.AcademicPeriod
        };

        _context.TeacherSubjectClasses.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok("Teacher assigned successfully");
    }

    // Add students to a class
    [HttpPost("{classId}/add-students")]
    public async Task<ActionResult> AddStudentsToClass(int classId, [FromBody] List<int> studentIds)
    {
        var class_ = await _context.Classes.FindAsync(classId);
        if (class_ == null)
        {
            return NotFound("Class not found");
        }

        var students = await _context.Students
            .Where(s => studentIds.Contains(s.Id))
            .ToListAsync();

        foreach (var student in students)
        {
            student.Class = class_;
        }

        await _context.SaveChangesAsync();
        return Ok("Students added to class successfully");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClass(int id, Class class_)
    {
        if (id != class_.Id)
        {
            return BadRequest();
        }

        var existingClass = await _context.Classes.FindAsync(id);
        if (existingClass == null)
        {
            return NotFound();
        }

        existingClass.Name = class_.Name;
        existingClass.Description = class_.Description;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ClassExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var class_ = await _context.Classes.FindAsync(id);
        if (class_ == null)
        {
            return NotFound();
        }

        _context.Classes.Remove(class_);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ClassExists(int id)
    {
        return _context.Classes.Any(e => e.Id == id);
    }
}

public class TeacherAssignmentRequest
{
    public int TeacherId { get; set; }
    public int SubjectId { get; set; }
    public int ClassId { get; set; }
    [Required]
    public string AcademicPeriod { get; set; } = string.Empty;
} 