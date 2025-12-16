
import React, { useState, useEffect } from 'react';
import { FileTextIcon } from '../../components/icons/Icon';
import { api } from '../../services/api';

interface AuditLog {
    id: number;
    created_at: string;
    initiated_by: string;
    status: string;
    details: string;
}

const AdminAuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/admin/audit-logs');
                setLogs(response.data);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);
    
    const handleDownload = (log: AuditLog) => {
        const logContent = `
Run ID: run-${String(log.id).padStart(3, '0')}
Date: ${new Date(log.created_at).toLocaleString()}
Initiated By: ${log.initiated_by}
Status: ${log.status}
Details: ${log.details}
        `;
        const blob = new Blob([logContent.trim()], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `run-${String(log.id).padStart(3, '0')}-log.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Audit & Logs</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">A history of all major system events and allocation runs for compliance and review.</p>
            
            <div className="mt-6">
                <h2 className="text-lg font-semibold">Allocation Run History</h2>
                <div className="mt-4 overflow-x-auto">
                    {loading ? <p>Loading logs...</p> : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr><th className="p-3">Run ID</th><th>Date</th><th>Initiated By</th><th>Status</th><th>Details</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 font-mono text-xs">{`run-${String(log.id).padStart(3, '0')}`}</td>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td>{log.initiated_by}</td>
                                    <td>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${log.status === 'Completed' ? 'bg-green-100 text-green-800' : log.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status}</span>
                                    </td>
                                    <td>{log.details}</td>
                                    <td>
                                        <button onClick={() => handleDownload(log)} className="flex items-center text-blue-600 hover:underline text-xs">
                                            <FileTextIcon className="w-4 h-4 mr-1"/> Download Log
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAuditLogsPage;
