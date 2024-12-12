import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";

interface TeacherSubject {
  id: number;
  name: string;
  classId: number;
  className: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Absence {
  id: number;
  date: string;
  session: string;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  className: string;
}

const MarkAbsences = () => {
  const [view, setView] = useState<"mark" | "history">("mark");
  const [teacherSubject, setTeacherSubject] = useState<TeacherSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject>();
  const [students, setStudents] = useState<Student[]>([]);
  const [absenceHistory, setAbsenceHistory] = useState<Absence[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    date: new Date().toISOString().split("T")[0],
    session: "Morning",
  });

  const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");

  const isStudentAbsent = (studentId: number) => {
    return absenceHistory.some(
      (absence) =>
        absence.studentId === studentId &&
        absence.date === formData.date &&
        absence.session === formData.session &&
        absence.subjectId === selectedSubject?.id
    );
  };

  const fetchTeacherSubjects = async () => {
    try {
      const response = await fetch(
        `http://localhost:5063/api/subjects/teacher/${teacher.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch teacher subjects");
      const data = await response.json();
      setTeacherSubject(data);
      console.log("data", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchTeacherSubjects();
    fetchAbsenceHistory();
  }, []);

  useEffect(() => {
    if (selectedSubject?.classId) {
      fetchClassStudents(selectedSubject.classId.toString());
    }
  }, [formData.date, formData.session, selectedSubject]);

  const studentColumns = [
    { key: "firstName", title: "First Name" },
    { key: "lastName", title: "Last Name" },
    {
      key: "actions",
      title: "Mark Absent",
      render: (student: Student) => (
        <input
          type="checkbox"
          checked={
            selectedStudents.includes(student.id) || isStudentAbsent(student.id)
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents([...selectedStudents, student.id]);
            } else {
              setSelectedStudents(
                selectedStudents.filter((id) => id !== student.id)
              );
            }
          }}
        />
      ),
    },
  ];

  const historyColumns = [
    { key: "date", title: "Date" },
    { key: "session", title: "Session" },
    { key: "studentName", title: "Student" },
    { key: "className", title: "Class" },
    { key: "subjectName", title: "Subject" },
  ];

  const fetchClassStudents = async (classId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5063/api/teachers/${teacher.id}/classes/${classId}/students`
      );
      const data = await response.json();
      setStudents(data);

      const absentStudents = data
        .filter((student: any) => isStudentAbsent(student.id))
        .map((student: any) => student.id);
      setSelectedStudents(absentStudents);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAbsenceHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5063/api/teachers/${teacher.id}/absences`
      );
      const data = await response.json();
      setAbsenceHistory(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData = {
        ...formData,
        studentIds: selectedStudents,
      };
      console.log("Sending request data:", requestData);

      const response = await fetch(
        `http://localhost:5063/api/teachers/${teacher.id}/mark-absences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to mark absences");
      }

      alert("Absences marked successfully");
      setSelectedStudents([]);
      fetchAbsenceHistory();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    console.log("Teacher:", teacher);
    console.log("Teacher Subjects:", selectedSubject);
    fetchAbsenceHistory();
  }, []);

  if (teacherSubject.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <p>No subjects assigned to this teacher.</p>
          <p>Teacher ID: {teacher.id}</p>
          <p>
            Teacher Name: {teacher.firstName} {teacher.lastName}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <div className="space-x-2">
            <Button
              variant={view === "mark" ? "primary" : "secondary"}
              onClick={() => setView("mark")}
            >
              Mark Absences
            </Button>
            <Button
              variant={view === "history" ? "primary" : "secondary"}
              onClick={() => setView("history")}
            >
              View History
            </Button>
          </div>
        </div>

        {view === "mark" ? (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Subject & Class"
                value={selectedSubject?.id.toString() || ""}
                onChange={(value) => {
                  const subject = teacherSubject.find(
                    (s: TeacherSubject) => s.id.toString() === value
                  );
                  if (subject) {
                    setSelectedSubject(subject);
                    setFormData({
                      ...formData,
                      subjectId: value,
                      classId: subject.classId.toString(),
                    });
                    fetchClassStudents(subject.classId.toString());
                  }
                }}
                options={teacherSubject.map((s: TeacherSubject) => ({
                  value: s.id.toString(),
                  label: `${s.name} - ${s.className}`,
                }))}
              />

              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <Select
                label="Session"
                value={formData.session}
                onChange={(value) =>
                  setFormData({ ...formData, session: value })
                }
                options={[
                  { value: "Morning", label: "Morning" },
                  { value: "Afternoon", label: "Afternoon" },
                ]}
              />
            </form>

            {students.length > 0 && (
              <div className="space-y-4">
                <Table columns={studentColumns} data={students} />
                <Button onClick={handleSubmit}>Save Absences</Button>
              </div>
            )}
          </div>
        ) : (
          <Table columns={historyColumns} data={absenceHistory} />
        )}
      </div>
    </Layout>
  );
};

export default MarkAbsences;
