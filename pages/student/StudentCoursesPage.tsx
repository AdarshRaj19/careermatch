
import React, { useState, useEffect, useCallback } from 'react';
import { Course } from '../../types';
import Button from '../../components/Button';
import { SearchIcon, XIcon } from '../../components/icons/Icon';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const CourseDetailsModal: React.FC<{
    course: Course;
    onClose: () => void;
    onEnroll: (courseId: string) => void;
}> = ({ course, onClose, onEnroll }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-start">
                         <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{course.title}</h2>
                         <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 -mt-2 -mr-2">
                             <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                         </button>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{course.provider}</p>
                    <div className="flex items-center space-x-4 text-md text-gray-500 dark:text-gray-400 my-2">
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.hours} Hours</span>
                        <span>•</span>
                        <span className="flex items-center font-bold">⭐ {course.rating}</span>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">{course.description}</p>
                </div>
                 <div className="p-6 mt-auto bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2 rounded-b-lg border-t dark:border-gray-700">
                    <Button onClick={onClose} variant="outline">Close</Button>
                    <Button variant="primary" onClick={() => onEnroll(course.id)}>Enroll Now</Button>
                </div>
            </div>
        </div>
    )
};

const CourseCard: React.FC<{ 
    course: Course; 
    isSaved: boolean; 
    onToggleSave: (courseId: string, isSaved: boolean) => void;
    onEnroll: (courseId: string) => void;
    onViewDetails: (course: Course) => void;
}> = ({ course, isSaved, onToggleSave, onEnroll, onViewDetails }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onViewDetails(course)}>
        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{course.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{course.provider}</p>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 my-2 space-x-4">
                <span>{course.category}</span>
                <span>•</span>
                <span>{course.hours} Hours</span>
                <span>•</span>
                <span className="flex items-center">⭐ {course.rating}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 flex-grow line-clamp-2">{course.description}</p>
            <div className="flex items-center justify-between mt-4">
                <Button variant="primary" onClick={(e) => { e.stopPropagation(); onEnroll(course.id); }}>Enroll Now</Button>
                <Button 
                    variant="ghost" 
                    onClick={(e) => { e.stopPropagation(); onToggleSave(course.id, isSaved); }}
                    className={isSaved ? 'text-red-500' : 'dark:text-gray-300'}
                >
                    {isSaved ? 'Saved' : 'Save'}
                </Button>
            </div>
        </div>
    </div>
);


const StudentCoursesPage: React.FC = () => {
    const [inProgress, setInProgress] = useState<Course[]>([]);
    const [explore, setExplore] = useState<Course[]>([]);
    const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [coursesRes, savedItemsRes] = await Promise.all([
                api.get('/student/courses'),
                api.get('/student/saved-items')
            ]);
            setInProgress(coursesRes.inProgressCourses);
            setExplore(coursesRes.exploreCourses);
            setSavedCourseIds(new Set(savedItemsRes.savedCourses.map((c: Course) => c.id)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleSave = async (courseId: string, isCurrentlySaved: boolean) => {
        const optimisticIds = new Set(savedCourseIds);
        if (isCurrentlySaved) {
            optimisticIds.delete(courseId);
        } else {
            optimisticIds.add(courseId);
        }
        setSavedCourseIds(optimisticIds);

        try {
            if (isCurrentlySaved) {
                await api.delete('/student/saved-items', { itemId: courseId, itemType: 'course' });
            } else {
                await api.post('/student/saved-items', { itemId: courseId, itemType: 'course' });
            }
        } catch (error) {
            fetchData(); // Revert on error
        }
    };
    
    const handleEnroll = async (courseId: string) => {
        try {
            await api.post('/student/courses/enroll', { courseId });
            addToast('Enrolled successfully!', 'success');
            // Refresh data to move course to in-progress
            fetchData();
        } catch (error) {
            addToast('Failed to enroll in course. You may already be enrolled.', 'error');
        }
    };

    const handleEnrollAndCloseModal = async (courseId: string) => {
        await handleEnroll(courseId);
        setSelectedCourse(null);
    };

    const filteredExplore = explore.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if(loading) return <p className="text-center p-12">Loading courses...</p>

    return (
        <div className="space-y-8">
            {selectedCourse && (
                <CourseDetailsModal 
                    course={selectedCourse} 
                    onClose={() => setSelectedCourse(null)}
                    onEnroll={handleEnrollAndCloseModal}
                />
            )}
            {/* Continue Learning */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inProgress.map(course => (
                        <div key={course.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center">
                             <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md mr-4"></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{course.provider}</p>
                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                </div>
                                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">{course.progress}%</p>
                                <Button variant="primary" size="sm" className="mt-2">Continue</Button>
                            </div>
                        </div>
                    ))}
                    {inProgress.length === 0 && <p className="text-gray-500 dark:text-gray-400">You have no courses in progress.</p>}
                </div>
            </div>

            {/* Explore Courses */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Explore Courses</h2>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search courses..." 
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="border dark:border-gray-600 rounded-md py-2 px-3 dark:bg-gray-700">
                        <option>All Categories</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredExplore.map(course => 
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            isSaved={savedCourseIds.has(course.id)} 
                            onToggleSave={handleToggleSave}
                            onEnroll={handleEnroll}
                            onViewDetails={setSelectedCourse}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentCoursesPage;
