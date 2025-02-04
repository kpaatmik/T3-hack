import { useState } from 'react';
import { FaBus, FaTrain, FaSubway, FaCoins, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const mockSchedules = [
  {
    id: 1,
    type: 'bus',
    route: 'City Center - Highway Mall',
    departure: '10:00 AM',
    arrival: '10:45 AM',
    price: 50,
    seats: 15,
  },
  {
    id: 2,
    type: 'train',
    route: 'Central Station - Highway Junction',
    departure: '11:30 AM',
    arrival: '12:15 PM',
    price: 100,
    seats: 50,
  },
  {
    id: 3,
    type: 'metro',
    route: 'Metro City - Highway Terminal',
    departure: '12:00 PM',
    arrival: '12:30 PM',
    price: 30,
    seats: 100,
  },
  // Add more mock data as needed
];

const transportIcons = {
  bus: FaBus,
  train: FaTrain,
  metro: FaSubway,
};

export default function Transport() {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [schedules, setSchedules] = useState(mockSchedules);
  const [credits, setCredits] = useState(500); // Mock user credits

  const handleSearch = (e) => {
    e.preventDefault();
    // Mock search functionality
    const filtered = mockSchedules.filter(schedule =>
      schedule.route.toLowerCase().includes(searchParams.from.toLowerCase()) ||
      schedule.route.toLowerCase().includes(searchParams.to.toLowerCase())
    );
    setSchedules(filtered);
  };

  const handleBooking = (schedule) => {
    if (credits >= schedule.price) {
      setCredits(prev => prev - schedule.price);
      alert('Booking successful! Credits deducted: ₹' + schedule.price);
    } else {
      alert('Insufficient credits. Please add more credits to your account.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Credits Display */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCoins className="text-yellow-500 h-6 w-6 mr-2" />
              <div>
                <h2 className="text-lg font-semibold">Your Credits</h2>
                <p className="text-gray-600">₹{credits}</p>
              </div>
            </div>
            <button
              onClick={() => setCredits(prev => prev + 100)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Credits
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="from" className="block text-sm font-medium text-gray-700">
                  From
                </label>
                <input
                  type="text"
                  id="from"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter departure location"
                />
              </div>

              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                  To
                </label>
                <input
                  type="text"
                  id="to"
                  value={searchParams.to}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter destination"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <FaSearch />
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Schedules */}
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const Icon = transportIcons[schedule.type];
            return (
              <div
                key={schedule.id}
                className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{schedule.route}</h3>
                      <p className="text-sm text-gray-500 capitalize">{schedule.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">₹{schedule.price}</p>
                    <p className="text-sm text-gray-500">{schedule.seats} seats available</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="font-semibold">{schedule.departure}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Arrival</p>
                      <p className="font-semibold">{schedule.arrival}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBooking(schedule)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
