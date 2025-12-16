
import React, { useState, useEffect, useCallback } from 'react';
import { Internship, Course } from '../../types';
import Button from '../../components/Button';
import { api } from '../../services/api';
import { InternshipDetailsModal } from './StudentInternshipsPage';
import { CourseDetailsModal } from './StudentCoursesPage';
import { useToast } from '../../contexts/ToastContext';

type SelectableItem = (Internship & { itemType: 'internship' }) | (Course & { itemType: 'course' });

const InternshipCard: React.FC<{internship: Internship; onRemove: (id: string) => void; onView: (internship: Internship) => void;}> = ({ internship, onRemove, onView }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{internship.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{internship.organization} - {internship.location}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 my-2 flex-grow line-clamp-3">{internship.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
            {internship.skills.slice(0, 4).map(skill => <span key={skill} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>)}
        </div>
        <div className="flex items-center justify-between mt-auto">
            <Button size="sm" onClick={() => onView(internship)}>View Details</Button>
            <button onClick={() => onRemove(internship.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
        </div>
    </div>
);

const CourseCard: React.FC<{course: Course; onRemove: (id: string) => void; onView: (course: Course) => void;}> = ({ course, onRemove, onView }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 flex flex-col">
        <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{course.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{course.provider}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 my-2 flex-grow line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between mt-auto">
            <Button size="sm" onClick={() => onView(course)}>View Details</Button>
            <button onClick={() => onRemove(course.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
        </div>
    </div>
);


const StudentSavedItemsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'internships' | 'courses'>('internships');
    const [savedInternships, setSavedInternships] = useState<Internship[]>([]);
    const [savedCourses, setSavedCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/student/saved-items');
            setSavedInternships(response.savedInternships);
            setSavedCourses(response.savedCourses);
        } catch (error) {
            console.error("Failed to fetch saved items:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRemove = async (itemId: string, itemType: 'internship' | 'course') => {
        try {
            await api.delete('/student/saved-items', { itemId, itemType });
            if (itemType === 'internship') {
                setSavedInternships(prev => prev.filter(i => i.id !== itemId));
            } else {
                setSavedCourses(prev => prev.filter(c => c.id !== itemId));
            }
            addToast(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} removed from saved items.`, 'success');
        } catch (error) {
            addToast(`Failed to remove ${itemType}.`, 'error');
        }
    };

    const handleEnroll = async (courseId: string) => {
        try {
            await api.post('/student/courses/enroll', { courseId });
            addToast('Enrolled successfully! The course has been moved to your "Continue Learning" section.', 'success');
            setSelectedItem(null); // Close modal
            fetchData(); // Refresh list
        } catch (error) {
            addToast('Failed to enroll in course. You may already be enrolled.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {selectedItem?.itemType === 'internship' && (
                <InternshipDetailsModal 
                    internship={selectedItem as Internship} 
                    onClose={() => setSelectedItem(null)} 
                />
            )}
            {selectedItem?.itemType === 'course' && (
                <CourseDetailsModal 
                    course={selectedItem as Course} 
                    onClose={() => setSelectedItem(null)} 
                    onEnroll={handleEnroll}
                />
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Saved Items</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Your bookmarked internships and courses for future reference.</p>
                <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6">
                        <button 
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'internships' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('internships')}
                        >
                            Internships ({savedInternships.length})
                        </button>
                        <button 
                             className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            Courses ({savedCourses.length})
                        </button>
                    </nav>
                </div>
            </div>
            
            <div>
                {loading ? <p className="text-center py-8 text-gray-500">Loading saved items...</p> : (
                    <>
                        {activeTab === 'internships' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedInternships.map(item => <InternshipCard key={item.id} internship={item} onRemove={() => handleRemove(item.id, 'internship')} onView={(internship) => setSelectedItem({ ...internship, itemType: 'internship' })} />)}
                                {savedInternships.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">You have no saved internships.</p>}
                            </div>
                        )}
                         {activeTab === 'courses' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {savedCourses.map(item => <CourseCard key={item.id} course={item} onRemove={() => handleRemove(item.id, 'course')} onView={(course) => setSelectedItem({ ...course, itemType: 'course' })} />)}
                                 {savedCourses.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">You have no saved courses.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentSavedItemsPage;
