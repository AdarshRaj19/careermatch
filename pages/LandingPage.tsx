
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
// FIX: Added BookOpenIcon to the import statement to resolve the "Cannot find name 'BookOpenIcon'" error.
import { BriefcaseIcon, BrainCircuitIcon, CheckSquareIcon, FileTextIcon, SearchIcon, ShieldCheckIcon, SettingsIcon, UserIcon, BookOpenIcon } from '../components/icons/Icon';

const Header: React.FC = () => (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center">
                <BriefcaseIcon className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 ml-2">CareerMatch</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">How It Works</a>
                <a href="#pm-scheme" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">PM Scheme</a>
            </nav>
            <div className="flex items-center space-x-2">
                <Link to="/login">
                    <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                    <Button variant="primary">Sign Up</Button>
                </Link>
            </div>
        </div>
    </header>
);

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
);

const Step: React.FC<{ number: string, title: string, description: string }> = ({ number, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">{number}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xs">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
    
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
            <Header />

            {/* Hero Section */}
            <section
                className="relative pt-32 pb-20 bg-gray-100 dark:bg-gray-800/50"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/noisy-grid.png')` }}
            >
                <div className="container mx-auto px-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">Find Your Perfect Internship Match</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">CareerMatch uses intelligent algorithms to connect talented students with their dream internships. Your future starts here.</p>
                            <div className="mt-8 flex justify-center md:justify-start space-x-4">
                                <Link to="/signup">
                                    <Button size="lg" variant="primary">Get Started</Button>
                                </Link>
                                 <a href="#how-it-works"><Button size="lg" variant="outline">Learn More</Button></a>
                            </div>
                        </div>
                        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center md:justify-end">
                            <img src="https://images.unsplash.com/photo-1596229569651-a1177bdd63a7?q=80&w=1887&auto=format&fit=crop" alt="Ocean waves" className="rounded-lg shadow-2xl max-w-sm w-full h-auto object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section id="features" className="py-24 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">Why Choose CareerMatch?</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-16">We provide a comprehensive platform to streamline your internship search.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={BrainCircuitIcon} title="Intelligent Matching" description="Our AI-powered algorithm matches your profile to the most suitable internships." />
                        <FeatureCard icon={FileTextIcon} title="Seamless Applications" description="Apply for multiple internships with a single, comprehensive profile." />
                        <FeatureCard icon={SettingsIcon} title="Host Organization Tools" description="A dedicated portal for companies to manage listings and review candidates." />
                        <FeatureCard icon={BookOpenIcon} title="AI Course Recommendations" description="Identify skill gaps and get suggestions for courses to become a stronger candidate." />
                        <FeatureCard icon={ShieldCheckIcon} title="Fairness & Transparency" description="Our process is designed to be equitable, with detailed reports for administrators." />
                        <FeatureCard icon={BriefcaseIcon} title="Career Growth" description="We don't just find you a job; we help you build a career path for the future." />
                    </div>
                </div>
            </section>
            
            {/* Simple Path Section */}
            <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-800/50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">A Simple Path to Your Future</h2>
                     <p className="text-lg text-gray-600 dark:text-gray-400 mb-20">Getting started with CareerMatch is easy. Follow these simple steps to land your dream internship.</p>
                     <div className="flex flex-col md:flex-row justify-center items-start space-y-12 md:space-y-0 md:space-x-8">
                        <Step number="1" title="Create Profile" description="Sign up and build a comprehensive profile showcasing your skills, experience, and aspirations." />
                        <div className="hidden md:block border-t-2 border-dashed border-gray-300 dark:border-gray-600 w-24 mt-6"></div>
                        <Step number="2" title="Find Internships" description="Browse personalized internship recommendations or use advanced filters to find the perfect fit." />
                        <div className="hidden md:block border-t-2 border-dashed border-gray-300 dark:border-gray-600 w-24 mt-6"></div>
                        <Step number="3" title="Apply & Get Hired" description="Submit your ranked preferences and let our allocation engine work its magic to match you with an organization." />
                    </div>
                </div>
            </section>
            
            {/* PM Scheme Section */}
            <section id="pm-scheme" className="py-24 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-4xl font-bold">Join the Prestigious PM Internship Scheme</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">CareerMatch is the official platform for the State Government's prestigious PM Internship Scheme. This initiative aims to provide final year students with unparalleled opportunities to work within various state-owned organizations, fostering the next generation of leaders and innovators.</p>
                            <div className="mt-6">
                               <Button variant="primary" size="lg">Apply to PM Scheme</Button>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <img src="https://images.unsplash.com/photo-1599881143896-102551268483?q=80&w=1887&auto=format&fit=crop" alt="Calm sea" className="rounded-lg shadow-lg" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold">Ready to find your match?</h2>
                    <p className="mt-2 text-blue-200">Join CareerMatch today and take the first step towards your professional success.</p>
                    <div className="mt-8">
                       <Link to="/signup"><Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200">Get Started Now</Button></Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300">
                <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white">CareerMatch</h3>
                        <p className="mt-2 text-sm">&copy; 2024. All rights reserved.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">Company</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">About Us</a></li>
                            <li><a href="#" className="hover:text-white">Careers</a></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-white">Business</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">For Host Organizations</a></li>
                            <li><a href="#" className="hover:text-white">For Universities</a></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-white">Legal</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
