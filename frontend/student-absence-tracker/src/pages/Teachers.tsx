import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import api from "../services/api";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: 0,
    firstName: "",
    lastName: "",
  });

  const columns = [
    { key: "id", title: "ID" },
    { key: "firstName", title: "First Name" },
    { key: "lastName", title: "Last Name" },
    {
      key: "actions",
      title: "Actions",
      render: (teacher: Teacher) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(teacher);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(teacher.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getTeachers();
      if (response.data) {
        setTeachers(response.data as Teacher[]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        // Update existing teacher
        await api.updateTeacher(formData.id, {
          id: formData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      } else {
        // Create new teacher
        await api.createTeacher({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }
      await fetchTeachers();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving teacher:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      setIsLoading(true);
      try {
        await api.deleteTeacher(id);
        await fetchTeachers();
      } catch (error) {
        console.error("Error deleting teacher:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      firstName: "",
      lastName: "",
    });
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Add Teacher
          </Button>
        </div>

        <Table columns={columns} data={teachers} isLoading={isLoading} />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={formData.id ? "Edit Teacher" : "Add Teacher"}
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {formData.id ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Teachers;
