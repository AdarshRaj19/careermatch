
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);


const StudentDocumentsPage: React.FC = () => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/student/profile');
                setProfile(response.data.profile);
            } catch (error) {
                console.error("Failed to fetch consent settings:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleToggleChange = async (field: 'consent_resume_parsing' | 'consent_profile_sharing', value: boolean) => {
        if (!profile) return;
        
        const originalProfile = { ...profile };
        
        // Optimistic UI update
        const updatedProfile = { ...profile, [field]: value };
        setProfile(updatedProfile);

        try {
            await api.put('/student/profile', { [field]: value });
        } catch (error) {
            console.error(`Failed to update ${field}:`, error);
            // Revert on error
            setProfile(originalProfile);
            alert('Failed to update setting. Please try again.');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setResumeFile(file);
            handleResumeUpload(file);
        }
    };
    
    const handleResumeUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('resume', file);
        
        setUploadStatus('uploading');
        try {
            const response = await api.post('/student/resume/upload', formData);
            setProfile(prev => prev ? { ...prev, resume_url: response.data.resumeUrl } : null);
            setUploadStatus('success');
            setTimeout(() => setUploadStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to upload resume", error);
            setUploadStatus('error');
            setTimeout(() => setUploadStatus('idle'), 3000);
        } finally {
            setResumeFile(null); // Clear file input
        }
    };


    if (!profile) return <div className="text-center p-12">Loading...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Documents & Consent</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your resume and data sharing preferences.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">Resume Management</h3>
                <div className="mt-4 p-4 border-2 border-dashed dark:border-gray-600 rounded-md flex items-center justify-between">
                    <div>
                        {profile.resume_url ? (
                             <a href={`http://localhost:3001${profile.resume_url}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                                View Current Resume
                             </a>
                        ) : (
                             <p className="font-semibold">No resume uploaded</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">{uploadStatus === 'success' ? 'Upload successful!' : uploadStatus === 'error' ? 'Upload failed!' : ''}</p>
                    </div>
                    <label htmlFor="upload-resume">
                        <Button as="span" variant="outline" disabled={uploadStatus === 'uploading'}>
                            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload New'}
                        </Button>
                    </label>
                    <input id="upload-resume" type="file" className="hidden" onChange={handleFileSelect} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="border-b dark:border-gray-700 pb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Consent Settings</h3>
                </div>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-md bg-gray-50 dark:bg-gray-700/50">
                        <div>
                            <p className="font-semibold">Automatic Resume Parsing</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">Allow our AI to parse your resume for skills and experience to improve internship matching and recommendations.</p>
                        </div>
                        <ToggleSwitch checked={profile.consent_resume_parsing} onChange={(newValue) => handleToggleChange('consent_resume_parsing', newValue)} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-md bg-gray-50 dark:bg-gray-700/50">
                        <div>
                            <p className="font-semibold">Profile Sharing Consent</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">Allow host organizations to view your detailed profile, including your resume and skills, once you are allocated to them.</p>
                        </div>
                        <ToggleSwitch checked={profile.consent_profile_sharing} onChange={(newValue) => handleToggleChange('consent_profile_sharing', newValue)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDocumentsPage;
