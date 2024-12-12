import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import api from "../services/api";

interface Class {
  id: number;
  name: string;
  description: string;
  students: any[] | null;
}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    description: "",
  });

  const columns = [
    { key: "id", title: "ID" },
    { key: "name", title: "Name" },
    { key: "description", title: "Description" },
    {
      key: "studentCount",
      title: "Students",
      render: (class_: Class) => (class_?.students?.length || 0).toString(),
    },
    {
      key: "actions",
      title: "Actions",
      render: (class_: Class) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(class_)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(class_.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await api.getClasses();
      const data = response.data as Class[];
      if (data) {
        const classesWithStudents = data.map((class_: Class) => ({
          ...class_,
          students: class_.students || [],
        }));
        setClasses(classesWithStudents);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        // Update existing class
        await api.updateClass(formData.id, {
          id: formData.id,
          name: formData.name,
          description: formData.description,
        });
      } else {
        // Create new class
        await api.createClass({
          name: formData.name,
          description: formData.description,
        });
      }
      await fetchClasses();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (class_: Class) => {
    setFormData({
      id: class_.id,
      name: class_.name,
      description: class_.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      setIsLoading(true);
      try {
        await api.deleteClass(id);
        await fetchClasses();
      } catch (error) {
        console.error("Error deleting class:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      name: "",
      description: "",
    });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Add Class
          </Button>
        </div>

        <Table columns={columns} data={classes} isLoading={isLoading} />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={formData.id ? "Edit Class" : "Add Class"}
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
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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

export default Classes;
