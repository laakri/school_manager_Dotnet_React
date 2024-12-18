import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import api from "../services/api";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    api.getStatsStudent().then((response) => {
      if (response.data) {
        setStats(response.data as Stats);
      }
    }).catch(error => {
      console.error("Error fetching stats:", error);
    });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Teachers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalTeachers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
