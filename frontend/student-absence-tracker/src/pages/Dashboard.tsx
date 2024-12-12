import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAbsences: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAbsences: 0,
  });

  useEffect(() => {
    // Fetch stats from API
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">{/* Icon */}</div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Students
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalStudents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Similar cards for other stats */}
        </div>

        {/* Recent Absences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Absences
            </h3>
            {/* Add Table component here */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
