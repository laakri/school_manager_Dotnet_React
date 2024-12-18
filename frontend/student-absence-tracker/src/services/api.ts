const API_BASE_URL = "http://localhost:5063/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return {
      error: error instanceof Error ? error.message : "An error occurred",
      data: undefined,
    };
  }
}

const api = {
  // Teachers
  getTeachers: () => fetchApi("/teachers"),
  createTeacher: (data: any) =>
    fetchApi("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTeacher: (id: number, data: any) =>
    fetchApi(`/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTeacher: (id: number) =>
    fetchApi(`/teachers/${id}`, {
      method: "DELETE",
    }),

  // Students
  getStudents: () => fetchApi("/students"),
  createStudent: (data: any) =>
    fetchApi("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStudent: (id: number, data: any) =>
    fetchApi(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: number) =>
    fetchApi(`/students/${id}`, {
      method: "DELETE",
    }),
//Dashboard
getStatsStudent: () => fetchApi("/dashboard/stats"),


  // Classes
  getClasses: () => fetchApi("/classes"),
  createClass: (data: any) =>
    fetchApi("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateClass: (id: number, data: any) =>
    fetchApi(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteClass: (id: number) =>
    fetchApi(`/classes/${id}`, {
      method: "DELETE",
    }),
  getClassStudents: (classId: number) =>
    fetchApi(`/classes/${classId}/students`),
  assignTeacherToClass: (data: any) =>
    fetchApi("/classes/assign-teacher", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Subjects
  getSubjects: () => fetchApi("/subjects"),
  createSubject: (data: any) =>
    fetchApi("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubject: (id: number, data: any) =>
    fetchApi(`/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSubject: (id: number) =>
    fetchApi(`/subjects/${id}`, {
      method: "DELETE",
    }),

  // Absences
  markAbsences: (teacherId: number, data: any) =>
    fetchApi(`/teachers/${teacherId}/mark-absences`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStudentAbsences: (studentId: number) =>
    fetchApi(`/absences/student/${studentId}`),
};
export default api;
