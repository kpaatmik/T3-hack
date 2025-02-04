import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaStar, FaFilter, FaMapMarkerAlt, FaLocationArrow, FaSearch } from 'react-icons/fa';
import api from '../utils/axios';

export default function RestPlaces() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    place_type: '',
    price_range: '',
    city: '',
    state: '',
    amenities: [],
  });
  const [places, setPlaces] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // Automatically fetch nearby places when location is obtained
        fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setLocationError('Unable to retrieve your location');
        console.error('Geolocation error:', error);
      }
    );
  };

  // Fetch nearby places
  const fetchNearbyPlaces = async (latitude, longitude, radius = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/rest-places/places/nearby/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
      console.log('Nearby places response:', response.data);
      setPlaces(response.data);
    } catch (err) {
      console.error('Error fetching nearby places:', err);
      setError('Failed to load nearby places. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rest places
  const fetchRestPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = '/rest-places/places/';
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add search query if present
      if (searchQuery?.trim()) {
        queryParams.append('search', searchQuery.trim());
      }

      // Add filters if they have values
      if (filters.place_type) queryParams.append('place_type', filters.place_type);
      if (filters.price_range) queryParams.append('price_range', filters.price_range);
      if (filters.city?.trim()) queryParams.append('city', filters.city.trim());
      if (filters.state?.trim()) queryParams.append('state', filters.state.trim());
      
      // Add amenities as multiple parameters
      filters.amenities.forEach(amenityId => {
        queryParams.append('amenities', amenityId);
      });

      // Add the query parameters to the URL
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log('Fetching rest places with URL:', url);
      const response = await api.get(url);
      console.log('Rest places response:', response.data);
      setPlaces(response.data);
    } catch (err) {
      console.error('Error fetching rest places:', err);
      setError('Failed to load rest places. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch amenities
  const fetchAmenities = async () => {
    try {
      const response = await api.get('/rest-places/amenities/');
      console.log('Amenities response:', response.data);
      setAmenities(response.data);
    } catch (err) {
      console.error('Error fetching amenities:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    console.log('Filter change:', filterType, value);
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'amenities') {
        // Toggle amenity in the array
        const amenityIndex = prev.amenities.indexOf(value);
        if (amenityIndex === -1) {
          newFilters.amenities = [...prev.amenities, value];
        } else {
          newFilters.amenities = prev.amenities.filter(a => a !== value);
        }
      } else {
        // For other filters, just update the value
        newFilters[filterType] = value;
      }
      
      return newFilters;
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchParams(prev => {
      if (query) {
        prev.set('search', query);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  // Add debounced effect for search and text filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestPlaces();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [searchQuery, filters.city, filters.state]);

  // Effect for non-text filters
  useEffect(() => {
    fetchRestPlaces();
  }, [filters.place_type, filters.price_range, filters.amenities]);

  // Initial load effect
  useEffect(() => {
    fetchAmenities();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rest Places</h1>
          <div className="flex gap-4">
            <button
              onClick={getUserLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              <FaLocationArrow />
              Find Nearby
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow text-gray-700 hover:bg-gray-50"
            >
              <FaFilter />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search rest places..."
              className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {locationError && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-700">{locationError}</p>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Place Type</label>
                <select
                  value={filters.place_type}
                  onChange={(e) => handleFilterChange('place_type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="hotel">Hotel</option>
                  <option value="motel">Motel</option>
                  <option value="rest_stop">Rest Stop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <select
                  value={filters.price_range}
                  onChange={(e) => handleFilterChange('price_range', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Prices</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Enter city name"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  placeholder="Enter state name"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Amenities</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => handleFilterChange('amenities', amenity.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.amenities.includes(amenity.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {amenity.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rest Places Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rest places found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <div key={place.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                      <p className="text-sm text-gray-500">{place.place_type}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900">{place.price_range}</span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">{place.description}</p>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{place.address}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {place.city}, {place.state}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {place.amenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {amenity.name}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-gray-900">{place.contact_number}</p>
                    </div>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => alert('Booking functionality coming soon!')}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
