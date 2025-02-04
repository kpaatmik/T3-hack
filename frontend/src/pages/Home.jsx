import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHotel, FaRobot, FaBus, FaSearch } from 'react-icons/fa';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const features = [
    {
      name: 'Rest Places',
      description: 'Find comfortable hotels, motels, and rest stops along your journey.',
      icon: FaHotel,
      to: '/rest-places',
    },
    {
      name: 'AI Assistant',
      description: 'Get intelligent travel suggestions and voice-based assistance.',
      icon: FaRobot,
      to: '/ai-assistant',
    },
    {
      name: 'Transport',
      description: 'Access public transport schedules and booking services.',
      icon: FaBus,
      to: '/transport',
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rest-places?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative isolate">
      {/* Hero Section */}
      <div className="relative pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Smart Highway Companion
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Experience safer and more comfortable journeys with intelligent rest stops,
              real-time assistance, and seamless transport booking.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="flex items-center justify-center">
                <div className="relative flex-grow max-w-lg">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for rest places..."
                    className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FaSearch className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/rest-places"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Find Rest Places
              </Link>
              <Link
                to="/ai-assistant"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Try AI Assistant <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.name}
                to={feature.to}
                className="group relative flex flex-col transition-transform hover:scale-105"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 group-hover:bg-blue-500">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-16">{feature.name}</div>
                </dt>
                <dd className="mt-2 ml-16 text-base leading-7 text-gray-600">
                  {feature.description}
                </dd>
              </Link>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
