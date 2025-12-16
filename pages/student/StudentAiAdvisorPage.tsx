import React, { useState, useRef, useEffect } from 'react';
import Button from '../../components/Button';
import { BrainCircuitIcon, XIcon, LoaderIcon, SendIcon, UserIcon } from '../../components/icons/Icon';
import { Course } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const quizQuestions = [
    { question: "Which of these activities sounds most appealing?", options: ["Building something with my hands", "Solving a complex puzzle", "Organizing a large event", "Creating a beautiful piece of art"] },
    { question: "When working on a team project, I prefer to:", options: ["Lead the team and set the vision", "Focus on my specific technical task", "Ensure everyone is communicating well", "Design the final presentation"] },
    { question: "I am most motivated by:", options: ["Seeing a tangible result", "Understanding how things work", "Helping others succeed", "Expressing my creativity"] },
    { question: "A perfect work environment for me would be:", options: ["A fast-paced, collaborative startup", "A quiet, focused research lab", "A structured corporate office", "A flexible, creative studio"] }
];

interface QuizResult {
    careerPaths: { path: string; description: string; }[];
    recommendedCourses: Course[];
}

const CareerQuizModal: React.FC<{ onClose: () => void, onComplete: (results: QuizResult) => void }> = ({ onClose, onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleAnswer = async (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (step < quizQuestions.length - 1) {
            setStep(step + 1);
        } else {
            setIsLoading(true);
            try {
                const results = await api.post('/student/ai-advisor/career-quiz', { answers: newAnswers });
                onComplete(results);
            } catch (error) {
                console.error("Failed to get quiz results", error);
                addToast("Sorry, we couldn't get your results. Please try again.", 'error');
            } finally {
                setIsLoading(false);
                onClose();
            }
        }
    };
    
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                    <LoaderIcon className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                    <p className="mt-4 text-lg">Analyzing your results...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Career Quiz</h2>
                     <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div>
                    <p className="font-semibold text-lg mb-4">{quizQuestions[step].question}</p>
                    <div className="space-y-3">
                        {quizQuestions[step].options.map(option => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className="w-full text-left p-4 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Question {step + 1} of {quizQuestions.length}
                    </div>
                </div>
            </div>
        </div>
    )
};

interface SkillAnalysisResult {
    missingSkills: string[];
    recommendedCourses: Course[];
}

const SkillAnalysisSection: React.FC = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [result, setResult] = useState<SkillAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleAnalyze = async () => {
        if (!jobTitle) return;
        setIsLoading(true);
        setResult(null);
        try {
            const response = await api.post('/student/ai-advisor/analyze-skills', { jobTitle });
            setResult(response);
        } catch (error) {
            addToast("Could not analyze skills. Please try again.", 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold">I have a career goal in mind.</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Assess your skills for a specific job and get course recommendations.</p>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Enter a job title, e.g., 'Data Scientist'"
                    className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <Button onClick={handleAnalyze} disabled={isLoading || !jobTitle}>
                    {isLoading ? <LoaderIcon className="animate-spin w-5 h-5" /> : 'Analyze'}
                </Button>
            </div>
            {result && (
                <div className="mt-6 border-t dark:border-gray-700 pt-4">
                    <h4 className="font-semibold">Skill Gap for '{jobTitle}':</h4>
                    <div className="flex flex-wrap gap-2 my-2">
                        {result.missingSkills.length > 0 ? result.missingSkills.map(skill => (
                            <span key={skill} className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                        )) : <p className="text-sm text-green-600">No major skill gaps found based on your profile!</p>}
                    </div>
                    <h4 className="font-semibold mt-4">Recommended Courses:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {result.recommendedCourses.map(course => (
                             <div key={course.id} className="p-3 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <p className="font-bold">{course.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{course.provider}</p>
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

const ChatbotSection: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hello! I'm your AI Career Advisor. Ask me anything about career paths, skills, or how to improve your profile." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/student/ai-advisor/chat', { message: input });
            const aiMessage: ChatMessage = { sender: 'ai', text: response.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again in a moment." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[70vh] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 p-4 border-b dark:border-gray-700">Chat with AI Advisor</h2>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-blue-600"/></div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0"><span className="font-bold">{user?.name?.charAt(0)}</span></div>}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-blue-600"/></div>
                        <div className="max-w-md p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                           <div className="flex space-x-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                    <SendIcon className="w-5 h-5" />
                </Button>
            </form>
        </div>
    );
};


const StudentAiAdvisorPage: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

    const handleQuizComplete = (results: QuizResult) => {
        setQuizResult(results);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {isQuizOpen && <CareerQuizModal onClose={() => setIsQuizOpen(false)} onComplete={handleQuizComplete} />}
            
            <div className="text-center">
                <BrainCircuitIcon className="w-16 h-16 mx-auto text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-4">AI Advisor</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Your personal AI-powered assistant for career exploration and skill development.</p>
            </div>

            <ChatbotSection />
            
            {quizResult && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Quiz Results</h2>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold">Recommended Career Paths:</h3>
                            <div className="space-y-2 mt-2">
                            {quizResult.careerPaths.map(path => (
                                <div key={path.path} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <p className="font-bold">{path.path}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{path.description}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold">Suggested First Courses:</h3>
                            <div className="space-y-2 mt-2">
                            {quizResult.recommendedCourses.map(course => (
                                <div key={course.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <p className="font-bold">{course.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.provider}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                     <div className="text-center mt-6">
                        <Button variant="outline" onClick={() => setQuizResult(null)}>Retake Quiz</Button>
                     </div>
                </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">What is your goal today?</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Select the option that best describes you to get started.</p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold">I'm exploring career options.</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Take a quiz to discover tech careers that align with your interests.</p>
                        <Button variant="ghost" className="mt-4" onClick={() => setIsQuizOpen(true)}>Start Career Quiz &gt;</Button>
                    </div>
                     <SkillAnalysisSection />
                </div>
            </div>

        </div>
    );
};

export default StudentAiAdvisorPage;