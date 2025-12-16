"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, XIcon, PlusIcon } from '../../components/icons/Icon';
import { Course } from '../../types';
import { api } from '../../services/api';
import Button from '../../components/Button';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const base = "px-2 py-0.5 text-xs font-semibold rounded-full";
    const styles: { [key: string]: string } = {
        Active: "bg-green-100 text-green-800",
        Inactive: "bg-gray-100 text-gray-800",
        Blocked: "bg-red-100 text-red-800",
    };
    return <span className={`${base} ${styles[status] || styles.Inactive}`}>{status}</span>;
};

const AddCourseModal: React.FC<{ onClose: () => void, onAdd: () => void }> = ({ onClose, onAdd }) => {
    const [newCourse, setNewCourse] = useState({
        title: '',
        provider: '',
        category: '',
        hours: 30,
        rating: 4.5,
        description: ''
    });

    const handleSave = async () => {
        try {
            // api wrapper already includes `/api` base
            await api.post('/admin/courses', newCourse);
            onAdd();
            onClose();
        } catch (error) {
            alert('Failed to add course.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Course</h2>
                    <button onClick={onClose}><XIcon /></button>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={newCourse.title}
                        onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                    <input
                        type="text"
                        placeholder="Provider"
                        value={newCourse.provider}
                        onChange={e => setNewCourse({ ...newCourse, provider: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={newCourse.category}
                        onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                </div>

                <div className="flex justify-end mt-6 gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Add Course</Button>
                </div>
            </div>
        </div>
    );
};

const AdminManageCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCourses = useCallback(async () => {
        try {
            const data = await api.get('/admin/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleStatusChange = async (courseId: string, currentStatus: string) => {
        const newStatus =
            currentStatus === 'Active' ? 'Inactive' :
            currentStatus === 'Inactive' ? 'Blocked' : 'Active';

        try {
            await api.put(`/admin/courses/${courseId}/status`, { status: newStatus });
            fetchCourses();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.provider?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

            {isModalOpen && <AddCourseModal onClose={() => setIsModalOpen(false)} onAdd={fetchCourses} />}

            <h1 className="text-2xl font-bold">Manage Courses</h1>

            <div className="mt-4 flex justify-between">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border dark:border-gray-600 rounded-md"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Course
                </Button>
            </div>

            <div className="mt-4 overflow-x-auto">
                {loading ? <p>Loading...</p> : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3">Title</th>
                                <th>Provider</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="border-b dark:border-gray-700">
                                    <td className="p-3">{course.title}</td>
                                    <td>{course.provider}</td>
                                    <td>{course.category}</td>
                                    <td><StatusBadge status={course.status} /></td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusChange(course.id, course.status)}
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

export default AdminManageCoursesPage;
