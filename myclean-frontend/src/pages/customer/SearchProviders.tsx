import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaDollarSign, FaFilter } from 'react-icons/fa';
import Card from '../../components/Card';
import { useNavigate } from 'react-router-dom';

interface Provider {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  specializations: string[];
  verified: boolean;
  profileImage: string;
  availability: string;
}

const SearchProviders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with API call
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'Sydney, NSW',
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 45,
      specializations: ['Deep Cleaning', 'Eco-Friendly', 'Pet-Friendly'],
      verified: true,
      profileImage: '/api/placeholder/100/100',
      availability: 'Available Today',
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'Melbourne, VIC',
      rating: 4.8,
      reviewCount: 95,
      hourlyRate: 50,
      specializations: ['Commercial', 'Carpet Cleaning', 'Window Cleaning'],
      verified: true,
      profileImage: '/api/placeholder/100/100',
      availability: 'Available Tomorrow',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      location: 'Brisbane, QLD',
      rating: 4.7,
      reviewCount: 83,
      hourlyRate: 40,
      specializations: ['Residential', 'Move-in/out', 'Deep Cleaning'],
      verified: false,
      profileImage: '/api/placeholder/100/100',
      availability: 'Available Next Week',
    },
  ]);

  const specializations = [
    'Deep Cleaning',
    'Eco-Friendly',
    'Pet-Friendly',
    'Commercial',
    'Residential',
    'Carpet Cleaning',
    'Window Cleaning',
    'Move-in/out',
  ];

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !location || provider.location.toLowerCase().includes(location.toLowerCase());
    const matchesPrice = provider.hourlyRate >= priceRange[0] && provider.hourlyRate <= priceRange[1];
    const matchesRating = provider.rating >= minRating;
    const matchesSpec = selectedSpecializations.length === 0 || 
      selectedSpecializations.some(spec => provider.specializations.includes(spec));
    
    return matchesSearch && matchesLocation && matchesPrice && matchesRating && matchesSpec;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Cleaner</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}/hour
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-4 py-2 rounded-lg border ${
                          minRating === rating
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {rating === 0 ? 'Any' : `${rating}+`} <FaStar className="inline text-yellow-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specializations */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map(spec => (
                      <button
                        key={spec}
                        onClick={() => toggleSpecialization(spec)}
                        className={`px-4 py-2 rounded-full border ${
                          selectedSpecializations.includes(spec)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold">{filteredProviders.length}</span> cleaners
          </p>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <Card key={provider.id} onClick={() => navigate(`/provider/${provider.id}`)}>
              <div className="flex items-start space-x-4">
                <img
                  src={provider.profileImage}
                  alt={provider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                    {provider.verified && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-1" />
                    {provider.location}
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{provider.rating}</span>
                    <span className="text-gray-500 ml-1">({provider.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="flex items-center mt-2 text-lg font-bold text-blue-600">
                    <FaDollarSign />
                    {provider.hourlyRate}/hour
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {provider.specializations.slice(0, 2).map(spec => (
                        <span
                          key={spec}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {provider.specializations.length > 2 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          +{provider.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-green-600 font-medium">
                    {provider.availability}
                  </div>
                  
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Profile & Book
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cleaners found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProviders;

