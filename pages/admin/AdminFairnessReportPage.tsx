import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

interface ReportData {
    genderData: any[];
    districtData: any[];
    detailedBreakdown: any[];
}

const AdminFairnessReportPage: React.FC = () => {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const data = await api.get('/admin/fairness-report');
                setReportData({
                    genderData: Array.isArray(data.genderData) ? data.genderData : [],
                    districtData: Array.isArray(data.districtData) ? data.districtData : [],
                    detailedBreakdown: Array.isArray(data.detailedBreakdown) ? data.detailedBreakdown : []
                });
            } catch (error) {
                console.error("Failed to fetch fairness report data:", error);
                setReportData({ genderData: [], districtData: [], detailedBreakdown: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    if (loading) {
        return <div>Loading fairness report...</div>;
    }

    if (!reportData) {
        return <div>Failed to load report data.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Fairness & Equity Report</h1>
                    <p className="text-sm text-gray-500">An overview of the internship allocation process by demographic groups.</p>
                </div>
                <Button variant="primary" onClick={async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://localhost:3001/api/admin/fairness-report/download', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'fairness_report.csv';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    } catch (error) {
                        alert('Failed to download report.');
                    }
                }}>Download Full Report</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold">Filters</h2>
                 <div className="flex space-x-4 mt-2">
                    <select className="border p-2 rounded-md"><option>2024 Cycle</option></select>
                    <select className="border p-2 rounded-md"><option>All States</option></select>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Placement Rate by Gender</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={reportData.genderData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" domain={[0, 100]} unit="%" />
                                <YAxis dataKey="name" type="category" width={60} />
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Bar dataKey="Placement Rate" fill="#8884d8" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Placement Rate by District Type</h2>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={reportData.districtData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" domain={[0, 100]} unit="%" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Bar dataKey="Placement Rate" fill="#82ca9d" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold">Detailed Demographic Breakdown</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50"><tr><th className="p-3">Demographic Category</th><th>Applications Submitted</th><th>Deemed Eligible</th><th>Placed</th></tr></thead>
                        <tbody>
                            {reportData.detailedBreakdown.map(row => (
                                <tr key={row.category} className="border-b">
                                    <td className="p-3 font-medium">{row.category}</td>
                                    <td>{row.submitted}</td>
                                    <td>{row.eligible}</td>
                                    <td>{row.placed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
export default AdminFairnessReportPage;