import { useEffect, useState } from "react";
import { api } from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/admin/dashboard-stats');
        setStats(data);
      } catch (err: any) {
        console.error("FETCH ERROR =", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of your platform's key metrics</p>
      </div>

      {/* FIXED dashboard card keys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard title="Total Students" value={stats.totalStudents} />

        {/* Backend returns totalHostOrganizations */}
        <DashboardCard
          title="Host Organizations"
          value={stats.totalHostOrganizations}
        />

        {/* Backend returns activeInternships */}
        <DashboardCard
          title="Active Internships"
          value={stats.activeInternships}
        />

        <DashboardCard title="Placement Rate" value={`${stats.placementRate}%`} />
      </div>

      <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Students</h2>

        {/* Backend returns recentSignups */}
        {stats.recentSignups?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent students found.</p>
        ) : (
          <ul className="space-y-3">
            {stats.recentSignups.map((s: any, index: number) => (
              <li
                key={`student-${index}`}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm hover:shadow-md flex items-center justify-between transition-all duration-200 border border-gray-100 dark:border-gray-600"
              >
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{s.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 mx-2">—</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{s.email}</span>
                </div>

                <a
                  href={`mailto:${s.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  Contact
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: any) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold mt-3 text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
