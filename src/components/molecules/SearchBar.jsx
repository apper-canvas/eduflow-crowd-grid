import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounced search
    window.searchTimeout = setTimeout(() => {
      onSearch?.(value);
    }, 300);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <ApperIcon 
          name="Search" 
          size={18} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                   transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSearch?.('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={16} />
          </button>
        )}
      </div>
    </motion.form>
  );
};

export default SearchBar;