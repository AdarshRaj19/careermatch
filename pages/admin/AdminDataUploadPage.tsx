"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileUpIcon, FileTextIcon } from '../../components/icons/Icon';
import { api } from '../../services/api';

interface UploadHistory {
    id: number;
    filename: string;
    status: string;
    created_at: string;
    user: string;
    records: number | null;
    error_message: string | null;
}

const AdminDataUploadPage: React.FC = () => {
    const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            const data = await api.get('/admin/upload-history');
            setUploadHistory(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch upload history:", e);
            setUploadHistory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    const handleFileUpload = async (file: File) => {
        // Validate file type
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (!validTypes.includes(file.type) && !['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
            alert('Invalid file type. Please upload a CSV or Excel file.');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }

        const formData = new FormData();
        formData.append('datafile', file);
        
        setIsUploading(true);
        try {
            await api.post('/admin/upload-data', formData);
            alert('File uploaded successfully!');
            // Refresh history after upload
            fetchHistory();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'File upload failed.';
            alert(`Upload failed: ${errorMsg}`);
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold">Data Upload</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bulk upload student, internship, or other administrative data.</p>
                    <label htmlFor="data-upload-input" className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer block hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700/50">
                        <FileUpIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {isUploading ? 'Uploading...' : 'Drag & drop files here, or '}
                            <span className="text-blue-600 font-semibold">click to select files</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Supported formats: CSV, XLSX. Max file size: 10MB.</p>
                    </label>
                    <input id="data-upload-input" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold">Templates</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download templates to ensure your data is formatted correctly.</p>
                    <div className="mt-4 space-y-3">
                        <button 
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch('http://localhost:3001/api/admin/templates/students', {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'student_template.csv';
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch (error) {
                                    alert('Failed to download template.');
                                }
                            }}
                            className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 cursor-pointer"
                        >
                           <FileTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" /> Student Data Template (.csv)
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch('http://localhost:3001/api/admin/templates/internships', {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'internship_template.csv';
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch (error) {
                                    alert('Failed to download template.');
                                }
                            }}
                            className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 cursor-pointer"
                        >
                           <FileTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" /> Internship Data Template (.csv)
                        </button>
                    </div>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">Upload History</h2>
                <table className="w-full mt-4 text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-3">Filename</th><th>Status</th><th>Date</th><th>User</th><th>Records</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} className="p-3 text-center">Loading history...</td></tr> : uploadHistory.map(h => (
                            <tr key={h.id} className="border-b dark:border-gray-700">
                                <td className="p-3 font-medium">{h.filename}</td>
                                <td>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${h.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{h.status}</span>
                                    {h.error_message && <p className="text-xs text-red-600">{h.error_message}</p>}
                                </td>
                                <td>{new Date(h.created_at).toLocaleDateString()}</td>
                                <td>{h.user}</td>
                                <td>{h.records || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminDataUploadPage;
