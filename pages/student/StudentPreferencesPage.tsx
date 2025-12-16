
import React, { useState, useEffect, useCallback } from 'react';
import { Internship } from '../../types';
import Button from '../../components/Button';
import { SearchIcon, ChevronDownIcon } from '../../components/icons/Icon';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const InitialPlaceholder: React.FC<{ name: string, className?: string }> = ({ name, className = '' }) => {
    const initial = name?.charAt(0).toUpperCase() || '?';
    return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold ${className}`}>
            {initial}
        </div>
    );
};

const StudentPreferencesPage: React.FC = () => {
    const [allInternships, setAllInternships] = useState<Internship[]>([]);
    const [ranked, setRanked] = useState<Internship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('All Locations');
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [internshipsRes, preferencesRes] = await Promise.all([
                api.get('/public/internships'),
                api.get('/student/preferences')
            ]);
            setAllInternships(internshipsRes);
            setRanked(preferencesRes);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const available = allInternships
      .filter(internship => !ranked.find(r => r.id === internship.id))
      .filter(internship => 
          (internship.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           internship.organization.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (locationFilter === 'All Locations' || internship.location === locationFilter)
      );

    const addPreference = (internship: Internship) => {
        if (ranked.length < 5 && !ranked.find(i => i.id === internship.id)) {
            setRanked([...ranked, internship]);
        }
    };
    
    const removePreference = (internship: Internship) => {
        setRanked(ranked.filter(i => i.id !== internship.id));
    };
    
    const movePreference = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === ranked.length - 1)) {
            return;
        }
        const newRanked = [...ranked];
        const item = newRanked.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newRanked.splice(newIndex, 0, item);
        setRanked(newRanked);
    };

    const handleSave = async () => {
        const rankedIds = ranked.map(i => i.id);
        try {
            await api.post('/student/preferences', { rankedIds });
            addToast("Preferences saved successfully!", 'success');
        } catch (error) {
            console.error("Failed to save preferences:", error);
            addToast("Failed to save preferences.", 'error');
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-12">Loading preferences...</div>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Browse Internships */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Browse Internships</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Search, filter, and add internships to your ranked list.</p>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                       <select 
                            className="appearance-none w-full md:w-40 bg-white dark:bg-gray-700 border rounded-md py-2 px-4 pr-8 focus:outline-none dark:border-gray-600"
                            value={locationFilter}
                            onChange={e => setLocationFilter(e.target.value)}
                        >
                            <option>All Locations</option>
                            <option>Remote</option>
                            <option>New York, NY</option>
                       </select>
                       <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {available.map(internship => (
                        <div key={internship.id} className="p-3 border dark:border-gray-700 rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                                <InitialPlaceholder name={internship.organization} className="w-10 h-10 rounded-md mr-3" />
                                <div>
                                    <p className="font-semibold">{internship.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{internship.organization}</p>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => addPreference(internship)} disabled={ranked.length >= 5}>Add</Button>
                        </div>
                    ))}
                    {available.length === 0 && <p className="text-center text-gray-500 py-4">No internships match your search.</p>}
                </div>
            </div>

            {/* Ranked Preferences */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Ranked Preferences ({ranked.length}/5)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag to reorder. The #1 spot is your top choice.</p>
                
                {ranked.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-md dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">Start Ranking</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Add internships from the list on the left.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ranked.map((internship, index) => (
                            <div key={internship.id} className="p-3 border dark:border-gray-700 rounded-md flex items-center justify-between bg-gray-50 dark:bg-gray-700/50">
                                <div className="flex items-center">
                                    <span className="text-xl font-bold text-blue-600 w-8 text-center">{index + 1}</span>
                                    <InitialPlaceholder name={internship.organization} className="w-10 h-10 rounded-md mx-3" />
                                    <div>
                                        <p className="font-semibold">{internship.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{internship.organization}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => movePreference(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30">↑</button>
                                     <button onClick={() => movePreference(index, 'down')} disabled={index === ranked.length - 1} className="p-1 disabled:opacity-30">↓</button>
                                     <button onClick={() => removePreference(internship)} className="text-red-500 hover:text-red-700 ml-2">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="pt-4 flex justify-end">
                    <Button variant="primary" onClick={handleSave}>Save Preferences</Button>
                 </div>
            </div>
        </div>
    );
};

export default StudentPreferencesPage;
