import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';

const Header = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.firstName && userProfile?.surname) {
      return `${userProfile.firstName} ${userProfile.surname}`;
    }
    return currentUser?.email || 'User';
  };

  const getUserRoleDisplay = () => {
    switch (userProfile?.role) {
      case 'admin':
        return 'Administrator';
      case 'general-office':
        return 'General Office';
      case 'faculty':
        return 'Faculty';
      case 'candidate':
        return 'Candidate';
      default:
        return 'User';
    }
  };

  return (
    <header className="header-modern sticky top-0 z-40">
      <div className="container-modern">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-200 shadow-sm">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">IMPACT Course</h1>
              <p className="text-xs text-gray-500">Whiston Hospital</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/apply" className="nav-link">
              Apply Now
            </Link>
            
            {currentUser ? (
              <>
                {userProfile?.role === 'general-office' ? (
                  <Link to="/general-office/tutorial" className="nav-link">
                    Tutorial
                  </Link>
                ) : (
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                )}
                {userProfile?.role === 'admin' && (
                  <Link to="/admin" className="nav-link">
                    Admin Panel
                  </Link>
                )}
                {userProfile?.role === 'general-office' && (
                  <Link to="/general-office" className="nav-link">
                    General Office Admin
                  </Link>
                )}
                {userProfile?.role === 'faculty' && (
                  <Link to="/faculty" className="nav-link">
                    Faculty Dashboard
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium">{getUserDisplayName()}</span>
                    <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{getUserRoleDisplay()}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} className="mr-3" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              <nav className="space-y-3">
                <Link 
                  to="/" 
                  className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/apply" 
                  className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Apply Now
                </Link>
                
                {currentUser && (
                  <>
                    {userProfile?.role === 'general-office' ? (
                      <Link 
                        to="/general-office/tutorial" 
                        className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tutorial
                      </Link>
                    ) : (
                      <Link 
                        to="/dashboard" 
                        className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    {userProfile?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {userProfile?.role === 'general-office' && (
                      <Link 
                        to="/general-office" 
                        className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        General Office Admin
                      </Link>
                    )}
                    {userProfile?.role === 'faculty' && (
                      <Link 
                        to="/faculty" 
                        className="block text-gray-700 hover:text-gray-900 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Faculty Dashboard
                      </Link>
                    )}
                  </>
                )}
              </nav>
              
              {currentUser ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{getUserRoleDisplay()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    to="/login" 
                    className="btn-primary w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
