
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { Internship, Course } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AllocationData {
    allocation: Internship & { allocation_status: string, match_score: number } | null;
    completedCourses: Course[];
}

const InitialPlaceholder: React.FC<{ name: string, className?: string }> = ({ name, className = '' }) => {
    const initial = name?.charAt(0).toUpperCase() || '?';
    return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold ${className}`}>
            {initial}
        </div>
    );
};

const StudentAllocationPage: React.FC = () => {
    const [data, setData] = useState<AllocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchAllocation = async () => {
            try {
                const response = await api.get('/student/allocation');
                setData(response);
            } catch (error) {
                console.error("Failed to fetch allocation:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllocation();
    }, []);

    const handleRespond = async (status: 'Accepted' | 'Declined') => {
        if (!data || !data.allocation) return;
        try {
            await api.post('/student/allocation/respond', { status });
            setData(prev => prev ? ({ ...prev, allocation: prev.allocation ? { ...prev.allocation, allocation_status: status } : null }) : null);
            addToast(`Offer ${status.toLowerCase()} successfully!`, 'success');
        } catch (error) {
             addToast(`Failed to ${status.toLowerCase()} offer.`, 'error');
        }
    };
    
    if (loading) {
        return <div>Loading allocation details...</div>
    }

    if (!data?.allocation) {
        return (
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">No Allocation Result Found</h2>
                 <p className="text-gray-600 dark:text-gray-400 mt-1">Allocation results for the current cycle may not be available yet. Please check back later.</p>
             </div>
        );
    }

    const { allocation, completedCourses } = data;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                {allocation.allocation_status === 'Matched' ? (
                     <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">Action Required</span>
                ) : (
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${allocation.allocation_status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Offer {allocation.allocation_status}
                    </span>
                )}
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">You have been allocated an internship!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Please review the details below and take action before the deadline.</p>

                <div className="mt-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center">
                    <InitialPlaceholder name={allocation.organization} className="w-16 h-16 rounded-lg mr-4 text-2xl" />
                    <div>
                        <h3 className="text-lg font-bold">{allocation.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{allocation.organization}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{allocation.location}</p>
                    </div>
                </div>

                <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/30">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Why you were matched</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Your profile shows a strong proficiency in <span className="font-bold">{allocation.skills.slice(0, 3).join(', ')}</span>, which aligns perfectly with the requirements for this role. Your high Fit Score of <span className="font-bold">{allocation.match_score}%</span> indicates a great potential for success.</p>
                </div>
                
                <div className="mt-6 flex space-x-4">
                    <Button variant="primary" onClick={() => handleRespond('Accepted')} disabled={allocation.allocation_status !== 'Matched'}>Accept Offer</Button>
                    <Button variant="danger" onClick={() => handleRespond('Declined')} disabled={allocation.allocation_status !== 'Matched'}>Decline Offer</Button>
                    <Button variant="outline">View Internship Details</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Completed Courses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A record of the courses you have successfully completed.</p>
                <div className="mt-4 space-y-3">
                    {completedCourses.map(course => (
                         <div key={course.id} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded-md">
                            <div className="flex items-center">
                                <InitialPlaceholder name={course.provider} className="w-8 h-8 rounded-md mr-3" />
                                <div>
                                    <p className="font-semibold">{course.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.provider}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline">View Certificate</Button>
                        </div>
                    ))}
                    {completedCourses.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No completed courses yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentAllocationPage;
