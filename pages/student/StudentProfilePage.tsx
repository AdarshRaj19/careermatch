
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { StudentProfile } from '../../types';
import { analyzeResumeWithAI } from '../../services/geminiService';
import { api } from '../../services/api';
import { CheckIcon, XIcon, LoaderIcon, PlusIcon } from '../../components/icons/Icon';
import { useToast } from '../../contexts/ToastContext';
import ProfileCompletion from '../../components/ProfileCompletion';

const API_URL = 'http://localhost:3001';

const SkillsModal: React.FC<{
    skills: string[];
    onClose: () => void;
    onSave: (newSkills: string[]) => void;
}> = ({ skills, onClose, onSave }) => {
    const [currentSkills, setCurrentSkills] = useState(skills);
    const [newSkill, setNewSkill] = useState('');

    const handleAddSkill = () => {
        if (newSkill && !currentSkills.includes(newSkill)) {
            setCurrentSkills([...currentSkills, newSkill]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSave = () => {
        onSave(currentSkills);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Skills</h3>
                <div className="my-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Add a new skill"
                            className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <Button onClick={handleAddSkill}><PlusIcon className="w-4 h-4" /></Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                        {currentSkills.map(skill => (
                            <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center">
                                {skill}
                                <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-blue-600 hover:text-blue-800">
                                    <XIcon className="w-3 h-3"/>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Skills</Button>
                </div>
            </div>
        </div>
    );
};

const AvatarPlaceholder: React.FC<{ name: string, className?: string }> = ({ name, className = '' }) => {
    const initial = name?.charAt(0).toUpperCase() || '?';
    return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 font-bold ${className}`}>
            {initial}
        </div>
    );
};


const StudentProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [quickStats, setQuickStats] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
    const { addToast } = useToast();
    
    // State for avatar upload
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarUploadStatus, setAvatarUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/student/profile');
                setProfile(data.profile);
                setQuickStats(data.quickStats);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && profile) {
            setIsAnalyzing(true);
            setSaveStatus('idle'); // Reset save status
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target?.result as string;
                try {
                    const extractedSkills = await analyzeResumeWithAI(text);
                    const currentSkills = profile.skills || [];
                    const updatedSkills = [...new Set([...currentSkills, ...extractedSkills])];
                    const newProfile = { ...profile, skills: updatedSkills };
                    
                    setProfile(newProfile); // Update UI immediately
                    await handleSaveProfile(newProfile); // Automatically save the profile with new skills
                    
                } catch (error) {
                    console.error("Failed to analyze and save resume skills:", error);
                    setSaveStatus('error'); 
                } finally {
                    setIsAnalyzing(false);
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarUploadStatus('idle');
        }
    };

    const handleCancelAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarUploadStatus('idle');
    };

    const handleSaveAvatar = async () => {
        if (!avatarFile) return;
        
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        setAvatarUploadStatus('uploading');
        try {
            const response = await api.post('/student/profile/avatar', formData);
            setProfile(prev => prev ? { ...prev, avatar_url: response.avatarUrl } : null);
            setAvatarUploadStatus('success');
            addToast('Avatar updated successfully!', 'success');
            setTimeout(() => {
                handleCancelAvatar(); // Clear preview and file
            }, 2000);
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            addToast('Avatar upload failed. Please try again.', 'error');
            setAvatarUploadStatus('error');
        }
    };

    const handleSaveProfile = async (profileToSave: StudentProfile | null = profile) => {
        if (!profileToSave) return;
        setSaveStatus('saving');
        try {
            await api.put('/student/profile', profileToSave);
            setSaveStatus('success');
            addToast('Profile saved successfully!', 'success');
            setTimeout(() => setSaveStatus('idle'), 3000); // Reset status after 3 seconds
        } catch (error) {
            console.error("Failed to save profile:", error);
            setSaveStatus('error');
            addToast('Could not save profile.', 'error');
        }
    };
    
    const getSaveButtonContent = () => {
        switch (saveStatus) {
            case 'saving': return <><LoaderIcon className="w-4 h-4 mr-2 animate-spin" /> Saving...</>;
            case 'success': return <><CheckIcon className="w-4 h-4 mr-2" /> Saved!</>;
            case 'error': return <><XIcon className="w-4 h-4 mr-2" /> Retry Save</>;
            default: return 'Save Profile';
        }
    };

    const getSaveButtonVariant = (): 'primary' | 'danger' | 'success' => {
        if (saveStatus === 'success') return 'success';
        if (saveStatus === 'error') return 'danger';
        return 'primary';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (saveStatus === 'error') {
            setSaveStatus('idle'); // Reset error status when user starts typing again
        }
        const { name, value } = e.target;
        setProfile(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSaveSkills = (newSkills: string[]) => {
        if(profile) {
            const newProfile = { ...profile, skills: newSkills };
            setProfile(newProfile);
            handleSaveProfile(newProfile);
        }
    };
    
    const handleRequestDistrictChange = () => {
        addToast("Your request to change district has been submitted for administrative review.", 'info');
    }

    if (isLoading || !profile || !quickStats) {
        return <div className="text-center p-12">Loading profile...</div>;
    }

    const renderAvatar = () => {
        const src = avatarPreview || (profile.avatar_url ? `${API_URL}${profile.avatar_url}` : null);
        if (src) {
            return <img src={src} alt="Profile Avatar" className="w-32 h-32 rounded-full object-cover" />;
        }
        return <AvatarPlaceholder name={profile.name} className="w-32 h-32 rounded-full text-5xl" />;
    };

    return (
        <div className="space-y-6">
            {isSkillsModalOpen && (
                <SkillsModal
                    skills={profile.skills}
                    onClose={() => setIsSkillsModalOpen(false)}
                    onSave={handleSaveSkills}
                />
            )}
            
            <ProfileCompletion profile={profile} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2">Your Profile</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This information will be used to match you with internships.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="hidden" name="name" value={profile.name} onChange={handleInputChange} />
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label><input type="text" name="name" value={profile.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label><input type="email" value={profile.email} disabled className="mt-1 w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-600 cursor-not-allowed" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label><input type="text" name="phone" value={profile.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">University</label><input type="text" name="university" value={profile.university} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">College</label><input type="text" name="college" value={profile.college} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Degree</label><input type="text" name="degree" value={profile.degree} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Branch</label><input type="text" name="branch" value={profile.branch} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Year</label><input type="number" name="year" value={profile.year} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">CGPA</label><input type="text" name="cgpa" value={profile.cgpa} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="text-sm font-medium text-gray-600 dark:text-gray-300">Credits Earned</label><input type="number" name="creditsEarned" value={profile.creditsEarned} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" /></div>
                    </div>
                    <div className="flex justify-end items-center space-x-4 pt-4">
                        <Button variant='outline' onClick={handleRequestDistrictChange}>Request District Change</Button>
                        <Button 
                            variant={getSaveButtonVariant()} 
                            onClick={() => handleSaveProfile()} 
                            disabled={saveStatus === 'saving' || saveStatus === 'success'}
                        >
                            {getSaveButtonContent()}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile Picture</h3>
                        <div className="flex flex-col items-center mt-4 space-y-4">
                            <div className="relative">
                                {renderAvatar()}
                                {avatarUploadStatus === 'uploading' && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                        <LoaderIcon className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            {avatarFile ? (
                                <div className="flex space-x-2">
                                    <Button onClick={handleSaveAvatar} size="sm" variant="primary" disabled={avatarUploadStatus === 'uploading'}>
                                        {avatarUploadStatus === 'uploading' ? 'Uploading...' : 'Save Photo'}
                                    </Button>
                                    <Button onClick={handleCancelAvatar} size="sm" variant="outline" disabled={avatarUploadStatus === 'uploading'}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                    <Button as="span" variant="outline" size="sm">
                                        Upload New Photo
                                    </Button>
                                </label>
                            )}
                             <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarChange} accept="image/png, image/jpeg" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Resume & Skills</h3>
                        <label htmlFor="resume-upload" className={`w-full mt-4 text-center block cursor-pointer ${isAnalyzing ? 'opacity-50' : ''}`}>
                            <Button as="span" variant="primary" className="w-full" disabled={isAnalyzing}>
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume with AI'}
                            </Button>
                        </label>
                        <input type="file" id="resume-upload" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Upload resume for AI insights</p>

                        <div className="mt-4">
                            <h4 className="font-semibold dark:text-gray-200">Your Skills</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.skills.map(skill => <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{skill}</span>)}
                            </div>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsSkillsModalOpen(true)}>Edit Skills</Button>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Quick Stats</h3>
                        <div className="space-y-3 mt-4 text-sm">
                            <div className="flex justify-between"><span>Preferences Submitted:</span><span className="font-semibold">{quickStats.preferencesSubmitted}/5</span></div>
                            <div className="flex justify-between"><span>Allocation Status:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    quickStats.allocationStatus === 'Allocated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>{quickStats.allocationStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;
