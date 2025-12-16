import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';
import { SearchIcon, XIcon } from '../../components/icons/Icon';
import Button from '../../components/Button';

const StudentDetailsModal: React.FC<{ student: StudentProfile, onClose: () => void }> = ({ student, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Student Profile: {student.name}</h2>
                <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
            </header>
            <main className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><h4 className="font-semibold">Email</h4><p>{student.email}</p></div>
                 <div><h4 className="font-semibold">Phone</h4><p>{student.phone || 'N/A'}</p></div>
                 <div><h4 className="font-semibold">University</h4><p>{student.university || 'N/A'}</p></div>
                 <div><h4 className="font-semibold">Degree</h4><p>{student.degree || 'N/A'} - {student.branch || 'N/A'}</p></div>
                 <div><h4 className="font-semibold">Year</h4><p>{student.year || 'N/A'}</p></div>
                 <div><h4 className="font-semibold">CGPA</h4><p>{student.cgpa || 'N/A'}</p></div>
                 <div className="md:col-span-2"><h4 className="font-semibold">Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {student.skills.map(s => <span key={s} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{s}</span>)}
                    </div>
                 </div>
            </main>
            <footer className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
                <Button variant="outline" onClick={onClose}>Close</Button>
            </footer>
        </div>
    </div>
);

// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const AdminManageStudentsPage: React.FC = () => {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    
    // Debounce search term to improve performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get('/admin/students');
                setStudents(response);
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);
    
    const handleViewDetails = async (userId: number) => {
        try {
            const studentProfile = await api.get(`/admin/students/${userId}`);
            setSelectedStudent(studentProfile);
        } catch (error) {
            console.error("Failed to fetch student details:", error);
        }
    };

    const filteredStudents = useMemo(() => students.filter(s =>
        s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [students, debouncedSearchTerm]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            {selectedStudent && <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Students</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">View and manage student profiles on the platform.</p>
            
            <div className="mt-4 flex justify-between">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                {loading ? <p>Loading students...</p> : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3">Name</th>
                            <th>Email</th>
                            <th>University</th>
                            <th>Degree</th>
                            <th>Year</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.user_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 font-medium">{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.university}</td>
                                <td>{student.degree}</td>
                                <td>{student.year}</td>
                                <td>
                                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(student.user_id)}>View Details</Button>
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

export default AdminManageStudentsPage;