using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using StudentAbsenceTracker.Data;
using StudentAbsenceTracker.Models;

namespace StudentAbsenceTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {

        public class DashboardStats
        {
            public int TotalStudents { get; set; }
            public int TotalTeachers { get; set; }
        }

     private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStats>> GetDashboardStats()
        {
            var stats = new DashboardStats
            {
                TotalStudents = await _context.Students.CountAsync(),
                TotalTeachers = await _context.Teachers.CountAsync()
            };

            return Ok(stats);
        }
    }
}
