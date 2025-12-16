import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:3001/api/admin/dashboard-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats(response.data);
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
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      {/* FIXED dashboard card keys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recent Students</h2>

        {/* Backend returns recentSignups */}
        {stats.recentSignups?.length === 0 ? (
          <p>No recent students found.</p>
        ) : (
          <ul className="space-y-2">
            {stats.recentSignups.map((s: any, index: number) => (
              <li
                key={`student-${index}`}
                className="p-3 bg-gray-100 rounded shadow-sm flex items-center justify-between"
              >
                <span>
                  {s.name} — 
                  <span className="text-sm text-gray-600">{s.email}</span>
                </span>

                <a
                  href={`mailto:${s.email}`}
                  className="text-blue-600 underline text-sm"
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
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
