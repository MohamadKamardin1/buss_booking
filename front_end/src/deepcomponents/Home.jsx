import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Bus, MapPin, Ticket, CreditCard, UserCheck, ShieldCheck } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Welcome card */}
      <div className="card mb-6 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome Traveler!</h2>
        <p className="text-gray-600 mb-6">
          This is your dashboard. Select an option to start your journey.
        </p>

        {/* Login option cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Passenger Login */}
          <div
            onClick={() => navigate('/login')}
            className="border border-gray-300 rounded-xl p-6 hover:border-blue-600 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <UserCheck className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Passenger Login</h3>
            </div>
            <p className="text-gray-500 mb-4">Login to book tickets and manage your journeys</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Passenger Login</span>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Conductor Login */}
          <div
            onClick={() => navigate('/conductor/login')}
            className="border border-gray-300 rounded-xl p-6 hover:border-green-600 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Bus className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Conductor Login</h3>
            </div>
            <p className="text-gray-500 mb-4">Login to update bus status and passenger info</p>
            <div className="flex items-center text-green-600 font-medium">
              <span>Conductor Login</span>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Admin Login */}
          <div
            onClick={() => navigate('/admin/login')}
            className="border border-gray-300 rounded-xl p-6 hover:border-purple-600 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <ShieldCheck className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Admin Login</h3>
            </div>
            <p className="text-gray-500 mb-4">Login to manage buses, users, and bookings</p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>Admin Login</span>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>

        {/* Dashboard option cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Ticket Card */}
          <div
            onClick={() => navigate('/dashboard/choose-route')}
            className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Ticket className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Book New Ticket</h3>
            </div>
            <p className="text-gray-500 mb-4">
              Select a route, bus, and seat to book your journey
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Start Booking</span>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* View Routes Card */}
          <div
            onClick={() => navigate('/dashboard/route-map')}
            className="border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <MapPin className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">View Routes Map</h3>
            </div>
            <p className="text-gray-500 mb-4">Explore available bus routes and stations</p>
            <div className="flex items-center text-green-600 font-medium">
              <span>View Map</span>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* My Tickets Card */}
          <div
            onClick={() => navigate('/dashboard/receipt')}
            className="border border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <CreditCard className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Booking Receipts</h3>
            </div>
            <p className="text-gray-500 mb-4">View and manage your booked tickets</p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>View Tickets</span>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Bus Availability Card */}
          <div
            onClick={() => navigate('/dashboard/bus-availability')}
            className="border border-gray-200 rounded-xl p-6 hover:border-yellow-500 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <Bus className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Bus Availability</h3>
            </div>
            <p className="text-gray-500 mb-4">Check real-time bus locations and schedules</p>
            <div className="flex items-center text-yellow-600 font-medium">
              <span>Check Buses</span>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Removed Recent Bookings section as it needs API and auth */}
    </div>
  );
};

export default Home;
