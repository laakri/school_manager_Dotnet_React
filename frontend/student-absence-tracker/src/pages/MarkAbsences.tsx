import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import { DownloadIcon } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Déclaration de type pour jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Subject {
  subjectId: number;
  subjectName: string;
  classes: {
    classId: number;
    className: string;
  }[];
}

interface Absence {
  studentId: number;
  date: string;
  session: string;
  subjectId: number;
}

interface AbsentStudent extends Student {
  className: string;
  date: string;
}

const MarkAbsences = () => { 
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState("Morning");
  const [existingAbsences, setExistingAbsences] = useState<Absence[]>([]);
  const [absentList, setAbsentList] = useState<AbsentStudent[]>([]);
  const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");
  const [selectedListSession, setSelectedListSession] = useState("Morning");

  // Add this function at the top of the component, after the state declarations
  const getAbsencesFromLocalStorage = (date: string, session: string, classId: string, subjectId: string) => {
    const records = JSON.parse(localStorage.getItem('absenceRecords') || '[]');
    return records.find((record: any) => 
      record.date === date && 
      record.session === session && 
      record.classId === classId && 
      record.subjectId === subjectId
    );
  };

  // Fetch teacher's subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:5063/api/teachers/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: teacher.firstName,
              password: teacher.lastName,
            }),
          }
        );
        const data = await response.json();
        setSubjects(data.subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch existing absences when date, session, or subject changes
  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        if (!teacher.id) {
          console.log("No teacher ID found");
          return;
        }

        const response = await fetch(
          `http://localhost:5063/api/teachers/${teacher.id}/absences`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setExistingAbsences(data);
        
        // Pre-select students who are already marked absent
        if (selectedSubject && date && session) {
          const absentStudents = data
            .filter((absence: Absence) => 
              absence.date === date &&
              absence.session === session &&
              absence.subjectId.toString() === selectedSubject
            )
            .map((absence: Absence) => absence.studentId);
          setSelectedStudents(absentStudents);
        }
      } catch (error) {
        console.error("Error fetching absences:", error);
        // Optionally show error to user
        // alert("Failed to fetch absences. Please try again later.");
      }
    };

    fetchAbsences();
  }, [date, session, selectedSubject, teacher.id]);

  // Modify the useEffect for fetching students
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(
            `http://localhost:5063/api/teachers/${teacher.id}/classes/${selectedClass}/students`
          );
          const data = await response.json();
          setStudents(data);

          // Check localStorage for existing absences
          const localStorageRecord = getAbsencesFromLocalStorage(
            date,
            session,
            selectedClass,
            selectedSubject
          );

          if (localStorageRecord) {
            setSelectedStudents(localStorageRecord.studentIds);
            console.log('Loaded absences from localStorage:', localStorageRecord);
          } else {
            setSelectedStudents([]);
          }
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
      fetchStudents();
    }
  }, [selectedClass, date, session, selectedSubject]);

  // Add this after your other useEffect hooks
  useEffect(() => {
    console.log('Currently selected students:', selectedStudents);
  }, [selectedStudents]);

  const isStudentAbsent = (studentId: number) => {
    return existingAbsences.some(absence => 
      absence.studentId === studentId &&
      absence.date === date &&
      absence.session === session &&
      absence.subjectId.toString() === selectedSubject
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudents.length) {
      alert("Please select at least one student");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5063/api/teachers/${teacher.id}/mark-absences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            session,
            classId: selectedClass,
            subjectId: selectedSubject,
            studentIds: selectedStudents,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to mark absences");

      // Refresh absences after successful submission
      const absencesResponse = await fetch(
        `http://localhost:5063/api/teachers/${teacher.id}/absences`
      );
      const newAbsences = await absencesResponse.json();
      setExistingAbsences(newAbsences);

      alert("Absences marked successfully");
    } catch (error) {
      console.error("Error marking absences:", error);
      alert("Failed to mark absences");
    }
  };

  const columns = [
    { key: "firstName", title: "First Name" },
    { key: "lastName", title: "Last Name" },
    {
      key: "actions",
      title: "Mark Absent",
      render: (student: Student) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(student.id) || isStudentAbsent(student.id)}
          onChange={(e) => {
            let newSelectedStudents;
            if (e.target.checked) {
              newSelectedStudents = [...selectedStudents, student.id];
            } else {
              newSelectedStudents = selectedStudents.filter(id => id !== student.id);
            }
            setSelectedStudents(newSelectedStudents);

            // Save to localStorage immediately
            const absenceRecord = {
              date,
              session,
              classId: selectedClass,
              subjectId: selectedSubject,
              studentIds: newSelectedStudents,
              timestamp: new Date().toISOString(),
              students: students.filter(s => newSelectedStudents.includes(s.id))
            };

            const existingRecords = JSON.parse(localStorage.getItem('absenceRecords') || '[]');
            const recordIndex = existingRecords.findIndex((record: any) => 
              record.date === date && 
              record.session === session && 
              record.classId === selectedClass && 
              record.subjectId === selectedSubject
            );

            if (newSelectedStudents.length > 0) {
              if (recordIndex !== -1) {
                existingRecords[recordIndex] = absenceRecord;
              } else {
                existingRecords.push(absenceRecord);
              }
            } else {
              // Remove record if no students are selected
              if (recordIndex !== -1) {
                existingRecords.splice(recordIndex, 1);
              }
            }

            localStorage.setItem('absenceRecords', JSON.stringify(existingRecords));
            console.log('Updated localStorage:', absenceRecord);
          }}
        />
      ),
    },
  ];

  const getAbsenceListFromStorage = (session: string) => {
    const records = JSON.parse(localStorage.getItem('absenceRecords') || '[]');
    return records.filter((record: any) => record.session === session);
  };

  const absenceListColumns = [
    { key: "firstName", title: "First Name" },
    { key: "lastName", title: "Last Name" },
    { key: "className", title: "Class" },
    { key: "date", title: "Date" },
  ];

  useEffect(() => {
    const absenceRecords = getAbsenceListFromStorage(selectedListSession);
    const formattedList: AbsentStudent[] = absenceRecords.flatMap((record: any) => 
      record.students.map((student: any) => ({
        ...student,
        className: subjects.find(s => s.subjectId.toString() === record.subjectId)
          ?.classes.find(c => c.classId.toString() === record.classId)
          ?.className || 'Unknown Class',
        date: new Date(record.date).toLocaleDateString()
      }))
    );
    setAbsentList(formattedList);
  }, [selectedListSession, subjects]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Ajout du titre
    doc.setFontSize(16);
    doc.text(`Liste des absences - Session ${selectedListSession}`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Date d'édition: ${new Date().toLocaleDateString()}`, 14, 25);

    // Préparation des données pour le tableau
    const tableData = absentList.map(student => [
      student.firstName,
      student.lastName,
      student.className,
      student.date
    ]);

    // Création du tableau
    doc.autoTable({
      startY: 35,
      head: [['Prénom', 'Nom', 'Classe', 'Date']],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
    });

    // Générer le PDF en base64 avec le type MIME correct
    const pdfContent = `data:application/pdf;base64,${btoa(doc.output('datauristring'))}`;
    
    const pdfRecord = {
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      session: selectedListSession,
      date: new Date().toISOString(),
      fileName: `absences_${selectedListSession.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`,
      studentCount: absentList.length,
      pdfContent: doc.output('datauristring') // Stocker le contenu brut
    };

    // Téléchargement du PDF
    doc.save(`absences_${selectedListSession.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Layout>
      <div className="space-y-6 p-7">
        <h2 className="text-2xl font-bold">Mark Absences</h2>
   <div className="flex flex-row gap-7 ">
       
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <Select
            label="Subject"
            value={selectedSubject}
            onChange={(value) => {
              setSelectedSubject(value);
              setSelectedClass("");
              setStudents([]);
              setSelectedStudents([]);
            }}
            options={subjects.map(s => ({
              value: s.subjectId.toString(),
              label: s.subjectName
            }))}
          />

          <Select
            label="Class"
            value={selectedClass}
            onChange={setSelectedClass}
            options={
              subjects
                .find(s => s.subjectId.toString() === selectedSubject)
                ?.classes.map(c => ({
                  value: c.classId.toString(),
                  label: c.className
                })) || []
            }
          />

          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            label="Session"
            value={session}
            onChange={setSession}
            options={[
              { value: "Morning", label: "Morning" },
              { value: "Afternoon", label: "Afternoon" }
            ]}
          />

          {students.length > 0 && (
            <>
              <Table columns={columns} data={students} />
              <Button type="submit">Save Absences</Button>
            </>
          )}
        </form>
         {/* Right Section: Absence List */}
         <div className="flex-1 bg-white p-7">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4">List of Absent Students</h2>
              <div className="flex flex-row gap-10 justify-center items-center">
              <Select
               
                value={selectedListSession}
                onChange={setSelectedListSession}
                options={[
                  { value: "Morning", label: "Morning" },
                  { value: "Afternoon", label: "Afternoon" }
                ]}
              />
              
              <Button className="h-fit" onClick={downloadPDF} type="button">
                <DownloadIcon />
                Download
              </Button>

              </div>
            </div>
            <div className="bg-white p-4 shadow-md rounded-md">
              {absentList.length > 0 ? (
                <Table columns={absenceListColumns} data={absentList} />
              ) : (
                <p className="text-gray-500">No absences for this session.</p>
              )}
            </div>
          </div>
        </div>  
      </div>
    </Layout>
  );
};

export default MarkAbsences;
