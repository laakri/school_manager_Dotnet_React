import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

interface Subject {
  id: number;
  name: string;
  teacherId: number;
  classId: number;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  class?: {
    id: number;
    name: string;
  };
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Class {
  id: number;
  name: string;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    teacherId: "",
    classId: "",
  });

  const columns = [
    { key: "id", title: "ID" },
    { key: "name", title: "Name" },
    {
      key: "teacher",
      title: "Teacher",
      render: (subject: Subject) =>
        subject.teacher
          ? `${subject.teacher.firstName} ${subject.teacher.lastName}`
          : "Not Assigned",
    },
    {
      key: "class",
      title: "Class",
      render: (subject: Subject) =>
        subject.class ? subject.class.name : "Not Assigned",
    },
    {
      key: "actions",
      title: "Actions",
      render: (subject: Subject) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(subject);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(subject.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.teacherId || !formData.classId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (formData.id) {
        // Update existing subject
        const response = await fetch(
          `http://localhost:5063/api/subjects/${formData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: formData.id,
              name: formData.name,
              teacherId: parseInt(formData.teacherId),
              classId: parseInt(formData.classId),
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to update subject");
      } else {
        // Create new subject
        const response = await fetch("http://localhost:5063/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            teacherId: parseInt(formData.teacherId),
            classId: parseInt(formData.classId),
          }),
        });

        if (!response.ok) throw new Error("Failed to create subject");
      }
      await fetchSubjects();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save subject. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setFormData({
      id: subject.id,
      name: subject.name,
      teacherId: subject.teacherId.toString(),
      classId: subject.classId.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5063/api/subjects/${id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to delete subject");
        await fetchSubjects();
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      name: "",
      teacherId: "",
      classId: "",
    });
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:5063/api/subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:5063/api/teachers");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:5063/api/classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
    fetchClasses();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Add Subject
          </Button>
        </div>

        <Table
          columns={columns as any[]}
          data={subjects}
          isLoading={isLoading}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={formData.id ? "Edit Subject" : "Add Subject"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Select
              label="Teacher"
              value={formData.teacherId}
              onChange={(value) =>
                setFormData({ ...formData, teacherId: value })
              }
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.firstName} ${t.lastName}`,
              }))}
              required
            />
            <Select
              label="Class"
              value={formData.classId}
              onChange={(value) => setFormData({ ...formData, classId: value })}
              options={classes.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              required
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Save
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Subjects;
