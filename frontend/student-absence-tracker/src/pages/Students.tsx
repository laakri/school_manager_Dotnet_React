import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import api from "../services/api";
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  classId: number;
  class?: {
    id: number;
    name: string;
  };
}

interface Class {
  id: number;
  name: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    firstName: "",
    lastName: "",
    classId: "",
  });

  const columns = [
    { key: "id", title: "ID" },
    { key: "firstName", title: "First Name" },
    { key: "lastName", title: "Last Name" },
    {
      key: "class",
      title: "Class",
      render: (student: Student) => student.class?.name,
    },
    {
      key: "actions",
      title: "Actions",
      render: (student: Student) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(student);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(student.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const fetchClasses = async () => {
    try {
      const response = await api.getClasses();
      setClasses(response.data as Class[]);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await api.updateStudent(formData.id, {
          id: formData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          classId: parseInt(formData.classId),
        });
      } else {
        await api.createStudent({
          firstName: formData.firstName,
          lastName: formData.lastName,
          classId: parseInt(formData.classId),
        });
      }
      await fetchStudents();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      classId: student.classId.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await api.deleteStudent(id);
        await fetchStudents();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.getStudents();
      setStudents(response.data as Student[]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      firstName: "",
      lastName: "",
      classId: "",
    });
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <Button onClick={() => setIsModalOpen(true)}>Add Student</Button>
        </div>

        <Table
          columns={columns as any[]}
          data={students}
          isLoading={isLoading}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Student"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
            <Select
              label="Class"
              value={formData.classId}
              onChange={(value) => setFormData({ ...formData, classId: value })}
              options={classes.map((classItem) => ({
                value: classItem.id.toString(),
                label: classItem.name,
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

export default Students;
