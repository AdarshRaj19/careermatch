
import React from 'react';
import { StudentProfile } from '../types';
import { Link } from 'react-router-dom';
import { CheckIcon, XIcon } from './icons/Icon';

interface ProfileCompletionProps {
    profile: StudentProfile;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ profile }) => {
    const checklist = [
        { name: "Basic Information", complete: !!profile.name && !!profile.phone && !!profile.university },
        { name: "Academic Details", complete: !!profile.degree && !!profile.branch && !!profile.cgpa },
        { name: "Upload Resume", complete: !!profile.resume_url, link: "/student/documents" },
        { name: "Add Skills", complete: profile.skills && profile.skills.length > 5, link: "/student/profile#skills" }, // Example: 5+ skills
        { name: "Set Preferences", complete: false, link: "/student/preferences" } // This would require another API call, so we'll mock it as incomplete
    ];

    const completedCount = checklist.filter(item => item.complete).length;
    const completionPercentage = Math.round((completedCount / checklist.length) * 100);

    const nextSteps = checklist.filter(item => !item.complete).slice(0, 2);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Profile Completion</h2>
            <div className="mt-4 flex items-center gap-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <span className="font-bold text-green-600">{completionPercentage}%</span>
            </div>
            
            {completionPercentage < 100 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">Next Steps</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                        {nextSteps.map(step => (
                             <li key={step.name}>
                                {step.link ? (
                                    <Link to={step.link} className="hover:underline">→ {step.name}</Link>
                                ) : (
                                    <span>→ {step.name}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfileCompletion;
