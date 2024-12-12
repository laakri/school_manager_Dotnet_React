using Microsoft.EntityFrameworkCore;
using StudentAbsenceTracker.Models;

namespace StudentAbsenceTracker.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Student> Students { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Class> Classes { get; set; }
    public DbSet<TeacherSubjectClass> TeacherSubjectClasses { get; set; }
    public DbSet<Absence> Absences { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // TeacherSubjectClass relationships
        modelBuilder.Entity<TeacherSubjectClass>()
            .HasOne(tsc => tsc.Teacher)
            .WithMany(t => t.TeacherSubjectClasses)
            .HasForeignKey(tsc => tsc.TeacherId);

        modelBuilder.Entity<TeacherSubjectClass>()
            .HasOne(tsc => tsc.Subject)
            .WithMany(s => s.TeacherSubjectClasses)
            .HasForeignKey(tsc => tsc.SubjectId);

        modelBuilder.Entity<TeacherSubjectClass>()
            .HasOne(tsc => tsc.Class)
            .WithMany(c => c.TeacherSubjects)
            .HasForeignKey(tsc => tsc.ClassId);

        // Student-Class relationship
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Class)
            .WithMany(c => c.Students)
            .HasForeignKey(s => s.ClassId);

        // Absence relationships
        modelBuilder.Entity<Absence>()
            .HasOne(a => a.Student)
            .WithMany(s => s.Absences)
            .HasForeignKey(a => a.StudentId);

        modelBuilder.Entity<Absence>()
            .HasOne(a => a.TeacherSubjectClass)
            .WithMany()
            .HasForeignKey(a => a.TeacherSubjectClassId);
    }
}