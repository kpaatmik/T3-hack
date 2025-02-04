import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { FaHome, FaUser, FaHotel, FaRobot, FaBus } from 'react-icons/fa';
import useAuthStore from './store/authStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestPlaces from './pages/RestPlaces';
import AIAssistant from './pages/AIAssistant';
import Transport from './pages/Transport';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  const { checkAuth, isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    Smart Highway
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                  >
                    <FaHome className="mr-1" />
                    Home
                  </Link>
                  <Link
                    to="/rest-places"
                    className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                  >
                    <FaHotel className="mr-1" />
                    Rest Places
                  </Link>
                  <Link
                    to="/ai-assistant"
                    className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                  >
                    <FaRobot className="mr-1" />
                    AI Assistant
                  </Link>
                  <Link
                    to="/transport"
                    className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                  >
                    <FaBus className="mr-1" />
                    Transport
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                    >
                      <FaUser className="mr-1" />
                      Profile
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900">Welcome, {user?.username}</span>
                    <button
                      onClick={logout}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                    >
                      <FaUser className="mr-1" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
          <div className="grid grid-cols-5 gap-1">
            <Link
              to="/"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <FaHome className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </Link>
            <Link
              to="/rest-places"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <FaHotel className="h-6 w-6" />
              <span className="text-xs">Rest Places</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <FaRobot className="h-6 w-6" />
              <span className="text-xs">AI Assistant</span>
            </Link>
            <Link
              to="/transport"
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <FaBus className="h-6 w-6" />
              <span className="text-xs">Transport</span>
            </Link>
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              onClick={isAuthenticated ? undefined : undefined}
              className="flex flex-col items-center py-2 text-gray-600 hover:text-blue-600"
            >
              <FaUser className="h-6 w-6" />
              <span className="text-xs">{isAuthenticated ? 'Profile' : 'Login'}</span>
            </Link>
          </div>
        </div>

        <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/rest-places" element={<RestPlaces />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
