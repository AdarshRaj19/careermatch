import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Internship, ApplicationStatus } from '../../types';
import Button from '../../components/Button';
import { SearchIcon, ChevronDownIcon, BookmarkIcon, XIcon, SlidersHorizontalIcon } from '../../components/icons/Icon';
import { api } from '../../services/api';

const InitialPlaceholder: React.FC<{ name: string, className?: string }> = ({ name, className = '' }) => {
    const initial = name?.charAt(0).toUpperCase() || '?';
    return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold ${className}`}>
            {initial}
        </div>
    );
};

export const InternshipDetailsModal: React.FC<{ internship: Internship, onClose: () => void }> = ({ internship, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                         <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{internship.title}</h2>
                         <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                             <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                         </button>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{internship.organization}</p>
                    <div className="flex items-center space-x-4 text-md text-gray-500 dark:text-gray-400 mt-1">
                        <span>{internship.location}</span>
                        <span>•</span>
                        <span>{internship.type}</span>
                        <span>•</span>
                        <span>{internship.experienceLevel}</span>
                    </div>
                </div>
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mt-4">Description</h3>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{internship.description}</p>
                    <h3 className="text-lg font-semibold mt-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {internship.skills.map(skill => (
                            <span key={skill} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                        ))}
                    </div>
                </div>
                 <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2">
                    <Button onClick={onClose} variant="outline">Close</Button>
                    <Button variant="primary">Apply Now</Button>
                </div>
            </div>
        </div>
    )
}

const ApplicationStatusBadge: React.FC<{status: ApplicationStatus}> = ({ status }) => {
    const statusStyles: Record<ApplicationStatus, string> = {
        'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Interviewing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Offer Received': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return (
        <span className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

const InternshipCard: React.FC<{
    internship: Internship;
    isSaved: boolean;
    applicationStatus?: ApplicationStatus;
    onToggleSave: (internshipId: string, isCurrentlySaved: boolean) => void;
    onViewDetails: (internship: Internship) => void;
    onStatusChange: (internshipId: string, status: ApplicationStatus | null) => void;
}> = ({ internship, isSaved, applicationStatus, onToggleSave, onViewDetails, onStatusChange }) => {
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    const handleStatusUpdate = (status: ApplicationStatus | null) => {
        onStatusChange(internship.id, status);
        setIsActionsOpen(false);
    }

    const getStatusButtonText = () => {
        if (applicationStatus) {
            return `Status: ${applicationStatus}`;
        }
        return 'Update Status';
    };

    const getStatusButtonVariant = () => {
        return applicationStatus ? 'secondary' : 'primary';
    };

    return (
        <div 
            className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onViewDetails(internship)}
        >
            {applicationStatus && <ApplicationStatusBadge status={applicationStatus} />}
            <div>
                <div className="flex justify-between items-start">
                    <InitialPlaceholder name={internship.organization} className="w-12 h-12 rounded-md mr-4 text-xl" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 pr-16">{internship.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{internship.organization}</p>
                    </div>
                </div>
                <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>{internship.location}</span><span>•</span><span>{internship.type}</span><span>•</span><span>{internship.experienceLevel}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 my-4 h-16 overflow-hidden">{internship.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {internship.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                     <Button variant={getStatusButtonVariant()} onClick={() => setIsActionsOpen(!isActionsOpen)}>{getStatusButtonText()} <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isActionsOpen ? 'rotate-180': ''}`} /></Button>
                     {isActionsOpen && (
                        <div className="absolute bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700" onMouseLeave={() => setIsActionsOpen(false)}>
                            <button onClick={() => handleStatusUpdate('Applied')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mark as Applied</button>
                            <button onClick={() => handleStatusUpdate('Interviewing')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mark as Interviewing</button>
                            <button onClick={() => handleStatusUpdate('Offer Received')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mark as Offer Received</button>
                            {applicationStatus && <button onClick={() => handleStatusUpdate(null)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">Remove Application</button>}
                        </div>
                     )}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSave(internship.id, isSaved); }}
                    className={`p-2 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-100 dark:bg-red-900/50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                >
                    <BookmarkIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

const FilterDropdown: React.FC<{ options: string[], value: string, onChange: (value: string) => void }> = ({ options, value, onChange }) => (
    <div className="relative">
        <select
            className="appearance-none w-full md:w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 pr-8 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
         <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>
);

interface SavedSearch {
    id: number;
    name: string;
    params: string; // JSON string of filters and search term
}

const StudentInternshipsPage: React.FC = () => {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [savedInternshipIds, setSavedInternshipIds] = useState<Set<string>>(new Set());
    const [applicationStatus, setApplicationStatus] = useState<Map<string, ApplicationStatus>>(new Map());
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: 'All Types', experience: 'All Levels', location: 'All Locations' });
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

    const fetchData = useCallback(async () => {
         try {
            const [internshipsRes, savedItemsRes, applicationsRes, savedSearchesRes] = await Promise.all([
                api.get('/public/internships'),
                api.get('/student/saved-items'),
                api.get('/student/applications'),
                api.get('/student/saved-searches'),
            ]);
            setInternships(internshipsRes);
            setSavedInternshipIds(new Set(savedItemsRes.savedInternships.map((i: Internship) => i.id)));
            setApplicationStatus(new Map(applicationsRes.map((app: any) => [app.internship_id, app.status])));
            setSavedSearches(savedSearchesRes);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleToggleSave = async (internshipId: string, isCurrentlySaved: boolean) => {
        // Optimistic update
        const newSavedIds = new Set(savedInternshipIds);
        if (isCurrentlySaved) {
            newSavedIds.delete(internshipId);
        } else {
            newSavedIds.add(internshipId);
        }
        setSavedInternshipIds(newSavedIds);

        try {
            if (isCurrentlySaved) {
                await api.delete('/student/saved-items', { itemId: internshipId, itemType: 'internship' });
            } else {
                await api.post('/student/saved-items', { itemId: internshipId, itemType: 'internship' });
            }
        } catch (error) {
            console.error("Failed to update save status:", error);
            fetchData(); // Revert on failure
        }
    };

    const handleStatusChange = async (internshipId: string, status: ApplicationStatus | null) => {
        const optimisticStatus = new Map(applicationStatus);
        if (status) {
            optimisticStatus.set(internshipId, status);
        } else {
            optimisticStatus.delete(internshipId);
        }
        setApplicationStatus(optimisticStatus);

        try {
            await api.post('/student/applications', { internshipId, status });
        } catch (error) {
            console.error("Failed to update status:", error);
            fetchData(); // Revert
        }
    };
    
    const handleSaveSearch = async () => {
        const name = prompt("Enter a name for this search:");
        if (name) {
            const params = JSON.stringify({ searchTerm, filters });
            try {
                const newSearch = await api.post('/student/saved-searches', { name, params });
                setSavedSearches(prev => [...prev, newSearch]);
            } catch (error) {
                console.error("Failed to save search:", error);
            }
        }
    };
    
    const applySavedSearch = (search: SavedSearch) => {
        const { searchTerm, filters } = JSON.parse(search.params);
        setSearchTerm(searchTerm);
        setFilters(filters);
    };

    const filteredInternships = useMemo(() => internships.filter(internship =>
        (internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         internship.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
         internship.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filters.location === 'All Locations' || internship.location === filters.location) &&
        (filters.type === 'All Types' || internship.type === filters.type) &&
        (filters.experience === 'All Levels' || internship.experienceLevel === filters.experience)
    ), [internships, searchTerm, filters]);

    return (
        <div className="space-y-6">
            {selectedInternship && <InternshipDetailsModal internship={selectedInternship} onClose={() => setSelectedInternship(null)} />}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Find Your Internship</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and apply for opportunities that match your skills.</p>

                <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, organization, or skill..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <FilterDropdown options={['All Locations', 'Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX']} value={filters.location} onChange={(v) => handleFilterChange('location', v)} />
                    <FilterDropdown options={['All Types', 'Remote', 'Hybrid', 'On-site']} value={filters.type} onChange={(v) => handleFilterChange('type', v)} />
                    <FilterDropdown options={['All Levels', 'Entry-level', 'Mid-level', 'Senior']} value={filters.experience} onChange={(v) => handleFilterChange('experience', v)} />
                    <Button variant="outline" onClick={handleSaveSearch} className="flex-shrink-0"><SlidersHorizontalIcon className="w-4 h-4 mr-2" /> Save Search</Button>
                </div>
            </div>

            {savedSearches.length > 0 && (
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-sm font-semibold mb-2">Saved Searches</h3>
                    <div className="flex flex-wrap gap-2">
                        {savedSearches.map(search => (
                            <button key={search.id} onClick={() => applySavedSearch(search)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900">
                                {search.name}
                            </button>
                        ))}
                    </div>
                 </div>
            )}

            {loading ? (
                <div className="text-center py-12 col-span-full"><p className="text-gray-500 dark:text-gray-400">Loading internships...</p></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInternships.map(internship => (
                            <InternshipCard
                                key={internship.id}
                                internship={internship}
                                isSaved={savedInternshipIds.has(internship.id)}
                                applicationStatus={applicationStatus.get(internship.id)}
                                onToggleSave={handleToggleSave}
                                onViewDetails={setSelectedInternship}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                    {filteredInternships.length === 0 && (
                        <div className="text-center py-12 col-span-full">
                            <p className="text-gray-500 dark:text-gray-400">No internships match your criteria.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentInternshipsPage;