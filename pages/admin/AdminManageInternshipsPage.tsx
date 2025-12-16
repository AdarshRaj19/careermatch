"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, XIcon, PlusIcon } from '../../components/icons/Icon';
import { Internship } from '../../types';
import { api } from '../../services/api';
import Button from '../../components/Button';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const base = "px-2 py-0.5 text-xs font-semibold rounded-full";
    const styles = {
        Active: "bg-green-100 text-green-800",
        Closed: "bg-gray-100 text-gray-800",
    };
    return <span className={`${base} ${styles[status] || styles.Closed}`}>{status}</span>;
};

const AddInternshipModal: React.FC<{ onClose: () => void, onAdd: () => void }> = ({ onClose, onAdd }) => {
    const [newInternship, setNewInternship] = useState({
        title: '',
        organization: '',
        location: '',
        description: '',
        skills: ''
    });

    const handleSave = async () => {
        try {
            const skillsArray = newInternship.skills.split(',').map(s => s.trim());
            // api wrapper already prefixes `/api`, so use `/admin/...`
            await api.post('/admin/internships', { ...newInternship, skills: skillsArray });
            onAdd();
            onClose();
        } catch (error) {
            alert('Failed to add internship.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Internship</h2>
                    <button onClick={onClose}><XIcon /></button>
                </div>

                <div className="space-y-4">
                    <input type="text" placeholder="Title" value={newInternship.title} onChange={e => setNewInternship({ ...newInternship, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700" />
                    <input type="text" placeholder="Organization" value={newInternship.organization} onChange={e => setNewInternship({ ...newInternship, organization: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700" />
                    <input type="text" placeholder="Location" value={newInternship.location} onChange={e => setNewInternship({ ...newInternship, location: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700" />
                    <textarea placeholder="Description" value={newInternship.description} onChange={e => setNewInternship({ ...newInternship, description: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700"></textarea>
                    <input type="text" placeholder="Skills (comma-separated)" value={newInternship.skills} onChange={e => setNewInternship({ ...newInternship, skills: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700" />
                </div>

                <div className="flex justify-end mt-6 gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Add Internship</Button>
                </div>
            </div>
        </div>
    );
};

const AdminManageInternshipsPage: React.FC = () => {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInternships = useCallback(async () => {
        try {
            // NOTE: api wrapper already prefixes `/api`, so we only use `/admin/...`
            const data = await api.get('/admin/internships');
            setInternships(data);
        } catch (error) {
            console.error("Failed to fetch internships", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInternships();
    }, [fetchInternships]);

    const handleStatusChange = async (internshipId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
        try {
            await api.put(`/admin/internships/${internshipId}/status`, { status: newStatus });
            fetchInternships();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const filteredInternships = internships.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.organization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            {isModalOpen && <AddInternshipModal onClose={() => setIsModalOpen(false)} onAdd={fetchInternships} />}

            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Internships</h1>

            <div className="mt-4 flex justify-between">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or organization..."
                        className="pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Internship
                </Button>
            </div>

            <div className="mt-4 overflow-x-auto">
                {loading ? (
                    <p>Loading internships...</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3">Title</th>
                                <th>Organization</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredInternships.map(item => (
                                <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 font-medium">{item.title}</td>
                                    <td>{item.organization}</td>
                                    <td>{item.location}</td>
                                    <td><StatusBadge status={item.status} /></td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusChange(item.id, item.status)}
                                        >
                                            Toggle Status
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminManageInternshipsPage;
