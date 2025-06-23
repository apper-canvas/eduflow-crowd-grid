import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import batchService from "@/services/api/batchService";
import studentService from "@/services/api/studentService";
import notificationService from "@/services/api/notificationService";
import routes from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";
import Batches from "@/components/pages/Batches";
import Students from "@/components/pages/Students";
import SearchBar from "@/components/molecules/SearchBar";
const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], batches: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const navigationItems = Object.values(routes).filter(route => !route.hideFromNav);

useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadUnreadNotifications();
    // Poll for unread count every 30 seconds
    const interval = setInterval(loadUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadNotifications = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Failed to load unread notifications:', error);
    }
  };
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults({ students: [], batches: [] });
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      const [students, batches] = await Promise.all([
        studentService.searchStudents(query),
        batchService.searchBatches(query)
      ]);

      setSearchResults({
        students: students.slice(0, 5), // Limit results
        batches: batches.slice(0, 5)
      });
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ students: [], batches: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResultClick = (type, id) => {
    if (type === 'student') {
      navigate(`/students/${id}`);
    } else if (type === 'batch') {
      navigate(`/batches/${id}`);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
damping: 30
      }
    }
  };
  
  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-display font-bold text-gray-900">EduFlow</h1>
            </div>
          </div>
          
<div className="flex items-center space-x-4">
            <div className="relative hidden md:block" ref={searchRef}>
              <SearchBar
                placeholder="Search students, batches..."
                onSearch={handleSearch}
                className="w-64"
              />
              
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <ApperIcon name="Loader2" size={20} className="animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.students.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Students
                          </div>
                          {searchResults.students.map((student) => (
                            <button
                              key={student.Id}
                              onClick={() => handleResultClick('student', student.Id)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary font-medium text-sm">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.batches.length > 0 && (
                        <div>
                          {searchResults.students.length > 0 && <div className="border-t border-gray-100 my-2" />}
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Batches
                          </div>
                          {searchResults.batches.map((batch) => (
                            <button
                              key={batch.Id}
                              onClick={() => handleResultClick('batch', batch.Id)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <ApperIcon name="BookOpen" size={16} className="text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{batch.name}</div>
                                <div className="text-sm text-gray-500">{batch.subject} • {batch.schedule.time}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.students.length === 0 && searchResults.batches.length === 0 && searchQuery && (
                        <div className="px-3 py-6 text-center text-gray-500">
                          <ApperIcon name="Search" size={24} className="mx-auto mb-2 text-gray-400" />
                          <div className="text-sm">No results found for "{searchQuery}"</div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
<button 
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-600 hover:text-gray-900 relative transition-colors"
            >
              <ApperIcon name="Bell" size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-surface border-r border-gray-200 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <ApperIcon name={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden shadow-xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="GraduationCap" size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-display font-bold text-gray-900">EduFlow</h1>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                <nav className="p-4 space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <ApperIcon name={item.icon} size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;