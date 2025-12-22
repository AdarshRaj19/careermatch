
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
// FIX: Added BookOpenIcon to the import statement to resolve the "Cannot find name 'BookOpenIcon'" error.
import { BriefcaseIcon, BrainCircuitIcon, CheckSquareIcon, FileTextIcon, SearchIcon, ShieldCheckIcon, SettingsIcon, UserIcon, BookOpenIcon } from '../components/icons/Icon';

const Header: React.FC = () => {
    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center group">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md group-hover:shadow-lg transition-shadow">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600 ml-3">CareerMatch</h1>
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                    <a 
                        href="#features" 
                        onClick={(e) => handleSmoothScroll(e, 'features')}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                    >
                        Features
                    </a>
                    <a 
                        href="#how-it-works" 
                        onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                    >
                        How It Works
                    </a>
                    <a 
                        href="#pm-scheme" 
                        onClick={(e) => handleSmoothScroll(e, 'pm-scheme')}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                    >
                        PM Scheme
                    </a>
                </nav>
                <div className="flex items-center space-x-3">
                    <Link to="/login">
                        <Button variant="ghost" className="font-medium">Login</Button>
                    </Link>
                    <Link to="/signup">
                        <Button variant="primary" className="font-medium shadow-lg hover:shadow-xl">Sign Up</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-all duration-300 hover:-translate-y-1 group">
        <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

const Step: React.FC<{ number: string, title: string, description: string }> = ({ number, title, description }) => (
    <div className="flex flex-col items-center text-center group">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
            {number}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xs leading-relaxed">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
    useEffect(() => {
        // Enable smooth scrolling behavior for the entire page
        document.documentElement.style.scrollBehavior = 'smooth';
        
        return () => {
            // Cleanup: remove smooth scroll behavior when component unmounts
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-16 flex flex-col md:flex-row items-center border border-gray-200/50 dark:border-gray-700/50">
                        <div className="md:w-1/2 text-center md:text-left">
                            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-6">
                                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">🚀 Your Career Journey Starts Here</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 dark:from-white dark:via-blue-300 dark:to-blue-500 bg-clip-text text-transparent">
                                Find Your Perfect Internship Match
                            </h2>
                            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">CareerMatch uses intelligent algorithms to connect talented students with their dream internships. Your future starts here.</p>
                            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                                <Link to="/signup">
                                    <Button size="lg" variant="primary" className="shadow-xl hover:shadow-2xl">Get Started</Button>
                                </Link>
                                 <a 
                                    href="#how-it-works" 
                                    onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                                >
                                    <Button size="lg" variant="outline" className="border-2">Learn More</Button>
                                </a>
                            </div>
                        </div>
                        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center md:justify-end">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur-2xl opacity-20 transform rotate-6"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1887&auto=format&fit=crop" 
                                    alt="Students collaborating on career development" 
                                    className="relative rounded-2xl shadow-2xl max-w-md w-full h-auto object-cover transform hover:scale-105 transition-transform duration-300" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section id="features" className="py-28 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-6">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Features</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">Why Choose CareerMatch?</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-20 max-w-2xl mx-auto">We provide a comprehensive platform to streamline your internship search.</p>
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
            <section id="how-it-works" className="py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-6">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Process</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">A Simple Path to Your Future</h2>
                     <p className="text-xl text-gray-600 dark:text-gray-400 mb-20 max-w-2xl mx-auto">Getting started with CareerMatch is easy. Follow these simple steps to land your dream internship.</p>
                     <div className="flex flex-col md:flex-row justify-center items-start space-y-16 md:space-y-0 md:space-x-12">
                        <Step number="1" title="Create Profile" description="Sign up and build a comprehensive profile showcasing your skills, experience, and aspirations." />
                        <div className="hidden md:block border-t-2 border-dashed border-blue-300 dark:border-blue-700 w-20 mt-8"></div>
                        <Step number="2" title="Find Internships" description="Browse personalized internship recommendations or use advanced filters to find the perfect fit." />
                        <div className="hidden md:block border-t-2 border-dashed border-blue-300 dark:border-blue-700 w-20 mt-8"></div>
                        <Step number="3" title="Apply & Get Hired" description="Submit your ranked preferences and let our allocation engine work its magic to match you with an organization." />
                    </div>
                </div>
            </section>
            
            {/* PM Scheme Section */}
            <section id="pm-scheme" className="py-28 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-6">
                                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">Government Initiative</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">Join the Prestigious PM Internship Scheme</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">CareerMatch is the official platform for the State Government's prestigious PM Internship Scheme. This initiative aims to provide final year students with unparalleled opportunities to work within various state-owned organizations, fostering the next generation of leaders and innovators.</p>
                            <div className="mt-8">
                               <Link to="/signup">
                                   <Button variant="primary" size="lg" className="shadow-xl hover:shadow-2xl">Apply to PM Scheme</Button>
                               </Link>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur-2xl opacity-20 transform -rotate-6"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1887&auto=format&fit=crop" 
                                    alt="Team collaboration and professional development" 
                                    className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to find your match?</h2>
                    <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">Join CareerMatch today and take the first step towards your professional success.</p>
                    <div className="mt-10">
                       <Link to="/signup">
                           <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 font-bold">
                               Get Started Now
                           </Button>
                       </Link>
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
