
import React, { useState } from 'react';
import Button from './Button';
import { HelpCircleIcon, XIcon, ChevronDownIcon } from './icons/Icon';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const faqs = [
    { q: "How does the allocation engine work?", a: "The allocation engine uses a sophisticated algorithm that considers your ranked preferences, your skills match for each role (analyzed by AI), and fairness metrics to find the best possible internship placement for you." },
    { q: "How do I improve my 'Fit Score'?", a: "Your Fit Score is primarily determined by the skills listed on your profile and resume. To improve it, make sure your profile is complete and accurate, and consider taking recommended courses to fill any skill gaps for your desired roles." },
    { q: "Can I change my preferences after submitting?", a: "You can change and re-save your preferences as many times as you like before the application deadline. After the deadline, preferences are locked for the allocation run." },
];

const FaqItem: React.FC<{ q: string, a: string }> = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b dark:border-gray-700 py-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <span className="font-semibold">{q}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a}</p>}
        </div>
    )
};

const HelpWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/student/support-ticket', { subject, message });
            addToast('Support ticket submitted successfully!', 'success');
            setSubject('');
            setMessage('');
            setActiveTab('faq');
        } catch (error) {
            addToast('Failed to submit ticket. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-40"
                aria-label="Help and Support"
            >
                <HelpCircleIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl m-6 w-full max-w-md h-[70vh] flex flex-col">
                        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Help & Support</h2>
                            <button onClick={() => setIsOpen(false)}><XIcon className="w-6 h-6" /></button>
                        </header>
                        <nav className="border-b dark:border-gray-700 flex">
                            <button onClick={() => setActiveTab('faq')} className={`flex-1 p-3 font-semibold ${activeTab === 'faq' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>FAQ</button>
                            <button onClick={() => setActiveTab('contact')} className={`flex-1 p-3 font-semibold ${activeTab === 'contact' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>Contact Us</button>
                        </nav>
                        <main className="p-4 flex-1 overflow-y-auto">
                            {activeTab === 'faq' && (
                                <div>
                                    {faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}
                                </div>
                            )}
                            {activeTab === 'contact' && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Can't find an answer? Send our support team a message.</p>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
                                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium">Message</label>
                                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            )}
                        </main>
                    </div>
                </div>
            )}
        </>
    );
};

export default HelpWidget;
