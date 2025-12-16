
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthSuccess, user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      handleAuthSuccess(token);
    } else {
      // Handle error case, maybe redirect to login with an error message
      navigate('/login');
    }
  }, [location, handleAuthSuccess, navigate]);

  useEffect(() => {
    if (user) {
        // Once the user is set in the context, redirect to their dashboard
        navigate(user.role === 'student' ? '/student/dashboard' : '/admin/dashboard');
    }
  }, [user, navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">Authenticating, please wait...</p>
    </div>
  );
};

export default AuthCallbackPage;
