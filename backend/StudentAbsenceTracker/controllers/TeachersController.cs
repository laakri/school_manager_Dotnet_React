using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentAbsenceTracker.Data;
using StudentAbsenceTracker.Models;
using System.ComponentModel.DataAnnotations;

namespace StudentAbsenceTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeachersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TeachersController> _logger;

    public TeachersController(ApplicationDbContext context, ILogger<TeachersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Teacher>>> GetTeachers()
    {
        return await _context.Teachers
            .Include(t => t.TeacherSubjectClasses)
                .ThenInclude(tsc => tsc.Subject)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Teacher>> GetTeacher(int id)
    {
        var teacher = await _context.Teachers
            .Include(t => t.TeacherSubjectClasses)
                .ThenInclude(tsc => tsc.Subject)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (teacher == null)
        {
            return NotFound();
        }

        return teacher;
    }

    [HttpPost]
    public async Task<ActionResult<Teacher>> CreateTeacher(Teacher teacher)
    {
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTeacher), new { id = teacher.Id }, teacher);
    }

    // Get teacher's classes
    [HttpGet("{teacherId}/classes")]
    public async Task<ActionResult<IEnumerable<object>>> GetTeacherClasses(int teacherId)
    {
        var teacherClasses = await _context.TeacherSubjectClasses
            .Where(tsc => tsc.TeacherId == teacherId)
            .Include(tsc => tsc.Class)
            .Include(tsc => tsc.Subject)
            .Select(tsc => new
            {
                ClassId = tsc.Class!.Id,
                ClassName = tsc.Class.Name,
                SubjectId = tsc.Subject!.Id,
                SubjectName = tsc.Subject.Name,
                AcademicPeriod = tsc.AcademicPeriod
            })
            .ToListAsync();

        if (!teacherClasses.Any())
        {
            return NotFound("No classes found for this teacher");
        }

        return Ok(teacherClasses);
    }

    // Get students in a specific class for a teacher
    [HttpGet("{teacherId}/classes/{classId}/students")]
    public async Task<ActionResult<IEnumerable<Student>>> GetClassStudents(int teacherId, int classId)
    {
        try
        {
            // Check if teacher has access to this class through any subject
            var hasAccess = await _context.Subjects
                .AnyAsync(s => s.TeacherId == teacherId && s.ClassId == classId);

            if (!hasAccess)
            {
                return Ok(new
                {
                    error = "Debug info",
                    teacherId = teacherId,
                    classId = classId,
                    message = "Teacher does not have access to this class"
                });
            }

            var students = await _context.Students
                .Where(s => s.ClassId == classId)
                .Select(s => new
                {
                    id = s.Id,
                    firstName = s.FirstName,
                    lastName = s.LastName
                })
                .ToListAsync();

            if (!students.Any())
            {
                return Ok(new
                {
                    message = "No students found in this class",
                    classId = classId
                });
            }

            return Ok(students);
        }
        catch (Exception ex)
        {
            return Ok(new
            {
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    // Mark absences for multiple students in a session
    [HttpPost("{teacherId}/mark-absences")]
    public async Task<IActionResult> MarkAbsences(int teacherId, [FromBody] AbsenceRequest request)
    {
        try
        {
            // Log the incoming request
            _logger.LogInformation($"Marking absences for teacher {teacherId}, class {request.ClassId}, subject {request.SubjectId}");

            // Validate request
            if (request.StudentIds == null || !request.StudentIds.Any())
            {
                return BadRequest(new { error = "No students selected" });
            }

            // Parse classId and subjectId as integers
            var classId = int.Parse(request.ClassId);
            var subjectId = int.Parse(request.SubjectId);

            // First check if the subject exists and belongs to this teacher
            var subject = await _context.Subjects
                .FirstOrDefaultAsync(s => 
                    s.TeacherId == teacherId && 
                    s.Id == subjectId && 
                    s.ClassId == classId);

            if (subject == null)
            {
                return BadRequest(new { 
                    error = "Invalid subject-class combination",
                    details = new {
                        teacherId,
                        subjectId,
                        classId
                    }
                });
            }

            // Get or create TeacherSubjectClass
            var teacherSubjectClass = await _context.TeacherSubjectClasses
                .FirstOrDefaultAsync(tsc => 
                    tsc.TeacherId == teacherId && 
                    tsc.SubjectId == subjectId && 
                    tsc.ClassId == classId);

            if (teacherSubjectClass == null)
            {
                teacherSubjectClass = new TeacherSubjectClass
                {
                    TeacherId = teacherId,
                    SubjectId = subjectId,
                    ClassId = classId,
                    AcademicPeriod = "2023-2024"
                };
                _context.TeacherSubjectClasses.Add(teacherSubjectClass);
                await _context.SaveChangesAsync();
            }

            // Parse the date and specify UTC kind
            if (!DateTime.TryParse(request.Date, out DateTime parsedDate))
            {
                return BadRequest(new { error = "Invalid date format" });
            }
            
            // Convert to UTC kind
            var absenceDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);

            var absences = request.StudentIds.Select(studentId => new Absence
            {
                Date = absenceDate,
                Session = request.Session,
                StudentId = studentId,
                TeacherSubjectClassId = teacherSubjectClass.Id,
                IsJustified = false
            }).ToList();

            try
            {
                _context.Absences.AddRange(absences);
                await _context.SaveChangesAsync();
            }
            catch (Exception dbEx)
            {
                return BadRequest(new { 
                    error = "Database error while saving absences",
                    details = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }

            return Ok(new { 
                message = "Absences marked successfully",
                count = request.StudentIds.Count
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { 
                error = "Failed to mark absences",
                details = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTeacher(int id, Teacher teacher)
    {
        if (id != teacher.Id)
        {
            return BadRequest();
        }

        var existingTeacher = await _context.Teachers.FindAsync(id);
        if (existingTeacher == null)
        {
            return NotFound();
        }

        existingTeacher.FirstName = teacher.FirstName;
        existingTeacher.LastName = teacher.LastName;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TeacherExists(id))
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
    public async Task<IActionResult> DeleteTeacher(int id)
    {
        var teacher = await _context.Teachers.FindAsync(id);
        if (teacher == null)
        {
            return NotFound();
        }

        _context.Teachers.Remove(teacher);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] TeacherLoginRequest request)
    {
        if (request.Username.ToLower() == "admin" && request.Password.ToLower() == "admin")
        {
            return Ok(new
            {
                teacher = new
                {
                    id = 0,
                    firstName = "Admin",
                    lastName = "Admin",
                    isAdmin = true
                },
                subjects = new List<object>()
            });
        }

        var teacher = await _context.Teachers
            .FirstOrDefaultAsync(t => 
                t.FirstName.ToLower() == request.Username.ToLower() && 
                t.LastName.ToLower() == request.Password.ToLower());

        if (teacher == null)
        {
            return NotFound("Teacher not found");
        }

        // Get teacher's subjects with classes
        var teacherSubjects = await _context.TeacherSubjectClasses
            .Where(tsc => tsc.TeacherId == teacher.Id)
            .Include(tsc => tsc.Subject)
            .Include(tsc => tsc.Class)
            .GroupBy(tsc => new { tsc.SubjectId, tsc.Subject!.Name })
            .Select(g => new
            {
                subjectId = g.Key.SubjectId,
                subjectName = g.Key.Name,
                classes = g.Select(tsc => new
                {
                    classId = tsc.ClassId,
                    className = tsc.Class!.Name
                }).ToList()
            })
            .ToListAsync();

        return Ok(new
        {
            teacher = new
            {
                id = teacher.Id,
                firstName = teacher.FirstName,
                lastName = teacher.LastName,
                isAdmin = false
            },
            subjects = teacherSubjects
        });
    }

    [HttpGet("{teacherId}/absences")]
    public async Task<ActionResult<IEnumerable<object>>> GetTeacherAbsences(int teacherId)
    {
        try 
        {
            var absences = await _context.Absences
                .Include(a => a.Student)
                .Include(a => a.TeacherSubjectClass)
                    .ThenInclude(tsc => tsc.Class)
                .Include(a => a.TeacherSubjectClass)
                    .ThenInclude(tsc => tsc.Subject)
                .Where(a => a.TeacherSubjectClass.TeacherId == teacherId)
                .Select(a => new
                {
                    id = a.Id,
                    date = a.Date.ToString("yyyy-MM-dd"),
                    session = a.Session,
                    studentId = a.StudentId,
                    studentName = $"{a.Student.FirstName} {a.Student.LastName}",
                    subjectId = a.TeacherSubjectClass.SubjectId,
                    subjectName = a.TeacherSubjectClass.Subject.Name,
                    className = a.TeacherSubjectClass.Class.Name
                })
                .OrderByDescending(a => a.date)
                .ToListAsync();

            return Ok(absences);
        }
        catch (Exception ex)
        {
            // Return empty list instead of error if no absences found
            return Ok(new List<object>());
        }
    }

    [HttpGet("{teacherId}/debug-classes")]
    public async Task<ActionResult<object>> DebugTeacherClasses(int teacherId)
    {
        var teacherExists = await _context.Teachers.AnyAsync(t => t.Id == teacherId);
        if (!teacherExists)
        {
            return NotFound($"Teacher with ID {teacherId} not found");
        }

        var classes = await _context.TeacherSubjectClasses
            .Where(tsc => tsc.TeacherId == teacherId)
            .Include(tsc => tsc.Class)
            .Include(tsc => tsc.Subject)
            .Select(tsc => new
            {
                TeacherId = tsc.TeacherId,
                ClassId = tsc.ClassId,
                ClassName = tsc.Class!.Name,
                SubjectId = tsc.SubjectId,
                SubjectName = tsc.Subject!.Name
            })
            .ToListAsync();

        return Ok(new
        {
            TeacherId = teacherId,
            ClassCount = classes.Count,
            Classes = classes
        });
    }

    [HttpGet("{teacherId}/debug")]
    public async Task<ActionResult<object>> DebugTeacherData(int teacherId)
    {
        var teacher = await _context.Teachers
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        if (teacher == null)
        {
            return NotFound($"Teacher with ID {teacherId} not found");
        }

        var teacherSubjectClasses = await _context.TeacherSubjectClasses
            .Where(tsc => tsc.TeacherId == teacherId)
            .Include(tsc => tsc.Subject)
            .Include(tsc => tsc.Class)
            .Select(tsc => new
            {
                TeacherId = tsc.TeacherId,
                SubjectId = tsc.SubjectId,
                SubjectName = tsc.Subject!.Name,
                ClassId = tsc.ClassId,
                ClassName = tsc.Class!.Name
            })
            .ToListAsync();

        return Ok(new
        {
            Teacher = new
            {
                teacher.Id,
                teacher.FirstName,
                teacher.LastName
            },
            AssignmentCount = teacherSubjectClasses.Count,
            Assignments = teacherSubjectClasses
        });
    }

    private bool TeacherExists(int id)
    {
        return _context.Teachers.Any(e => e.Id == id);
    }
}

public class AbsenceRequest
{
    public string Date { get; set; } = string.Empty;
    public string Session { get; set; } = string.Empty;
    public string ClassId { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public List<int> StudentIds { get; set; } = new List<int>();
}

public class TeacherLoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
} 