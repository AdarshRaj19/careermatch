
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SearchIcon } from '../../components/icons/Icon';
import Button from '../../components/Button';

interface AllocationResult {
    student_name: string;
    student_email: string;
    internship_title: string;
    internship_organization: string;
    match_score: number;
    status: string;
}

const AdminResultsDashboardPage: React.FC = () => {
    const [results, setResults] = useState<AllocationResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get('/admin/results');
                setResults(response.data);
            } catch (error) {
                console.error("Failed to fetch results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const handleDownload = async () => {
        try {
            const response = await api.get('/admin/results/download');
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'allocation_results.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Failed to download results:", error);
            alert("Could not download results.");
        }
    };

    const filteredResults = results.filter(r => 
        r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.internship_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.internship_organization.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Allocation Results</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Review the results from the latest allocation run.</p>
            </div>
            <Button variant="outline" onClick={handleDownload}>Download Results (.csv)</Button>
        </div>
        
        <div className="mt-4 flex justify-between">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by student, internship, or organization..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="mt-4 overflow-x-auto">
            {loading ? <p>Loading results...</p> : (
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="p-3">Student</th>
                        <th>Internship</th>
                        <th>Fit Score</th>
                        <th>Student Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredResults.map((result, index) => (
                        <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-3">
                                <p className="font-medium">{result.student_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{result.student_email}</p>
                            </td>
                            <td>
                                <p className="font-medium">{result.internship_title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{result.internship_organization}</p>
                            </td>
                            <td>{result.match_score}</td>
                            <td>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    result.status === 'Accepted' ? 'bg-green-100 text-green-800'
                                    : result.status === 'Declined' ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {result.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
            {!loading && filteredResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No allocation results found.</p>
                    <p className="text-sm">Run the allocation engine to generate results.</p>
                </div>
            )}
        </div>
    </div>
  );
};
export default AdminResultsDashboardPage;
