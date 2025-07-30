import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bus, MapPin, Users, LogOut } from 'lucide-react'

const ConductorDashboard = ({ token, onLogout }) => {
  const [assignedBuses, setAssignedBuses] = useState([])
  const [selectedBusId, setSelectedBusId] = useState(null)
  const [passengerList, setPassengerList] = useState([])
  const [location, setLocation] = useState('')
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [error, setError] = useState('')
  const [loadingBuses, setLoadingBuses] = useState(false)
  const [loadingPassengers, setLoadingPassengers] = useState(false)

  // Axios config with auth header
  const axiosConfig = {
    headers: {
      Authorization: `Token ${token}`,
    },
  }

  // Fetch buses assigned to this conductor when component mounts
  useEffect(() => {
    const fetchAssignedBuses = async () => {
      setLoadingBuses(true)
      setError('')
      try {
        // Replace with your backend API endpoint for getting conductor's buses
        const response = await axios.get('http://localhost:8000/api/conductor/buses/', axiosConfig)
        setAssignedBuses(response.data)
      } catch (err) {
        setError('Failed to fetch assigned buses.')
        console.error(err)
      } finally {
        setLoadingBuses(false)
      }
    }
    fetchAssignedBuses()
  }, [])

  // Fetch passenger list when a bus is selected
  useEffect(() => {
    if (!selectedBusId) {
      setPassengerList([])
      return
    }

    const fetchPassengerList = async () => {
      setLoadingPassengers(true)
      setError('')
      try {
        // Replace with your backend endpoint for passengers of a bus/trip assigned to this conductor
        const response = await axios.get(`http://localhost:8000/api/conductor/buses/${selectedBusId}/passengers/`, axiosConfig)
        setPassengerList(response.data)
      } catch (err) {
        setError('Failed to fetch passenger list.')
        console.error(err)
      } finally {
        setLoadingPassengers(false)
      }
    }

    fetchPassengerList()
  }, [selectedBusId])

  // Handle location update form submission
  const handleUpdateLocation = async () => {
    if (!selectedBusId || !location.trim()) {
      alert('Select a bus and enter a valid location.')
      return
    }
    setIsUpdatingLocation(true)
    setError('')
    try {
      // Replace with your API endpoint to update bus location
      await axios.post(
        `http://localhost:8000/api/conductor/buses/${selectedBusId}/update-location/`,
        { location },
        axiosConfig
      )
      alert('Location updated successfully.')
      setLocation('')
    } catch (err) {
      setError('Failed to update location.')
      console.error(err)
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Bus className="mr-2" /> Conductor Dashboard
        </h1>
        <button
          onClick={onLogout}
          className="flex items-center text-red-600 hover:text-red-800 font-semibold"
          title="Logout"
        >
          <LogOut size={20} className="mr-1" /> Logout
        </button>
      </header>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Assigned Buses</h2>
        {loadingBuses ? (
          <p>Loading your buses...</p>
        ) : assignedBuses.length === 0 ? (
          <p>No buses assigned currently.</p>
        ) : (
          <select
            value={selectedBusId || ''}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="border p-2 rounded-md w-full md:w-1/3"
          >
            <option value="" disabled>
              Select a bus
            </option>
            {assignedBuses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.bus_name} - {bus.number}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Update Bus Location</h2>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter current location"
          className="border p-2 rounded-md w-full md:w-1/3 mb-2"
          disabled={isUpdatingLocation}
        />
        <button
          onClick={handleUpdateLocation}
          disabled={isUpdatingLocation}
          className={`px-4 py-2 rounded-md font-semibold text-white ${
            isUpdatingLocation ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUpdatingLocation ? 'Updating...' : 'Update Location'}
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2" /> Passenger List
        </h2>
        {loadingPassengers ? (
          <p>Loading passengers...</p>
        ) : passengerList.length === 0 ? (
          <p>No passengers found for this bus.</p>
        ) : (
          <div className="overflow-auto max-h-96 border rounded-md bg-white shadow-sm">
            <table className="min-w-full table-auto text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 border-b">Passenger Name</th>
                  <th className="p-3 border-b">Seat Number</th>
                  <th className="p-3 border-b">Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {passengerList.map((passenger) => (
                  <tr key={passenger.id} className="hover:bg-gray-100">
                    <td className="p-3 border-b">{passenger.username || passenger.name}</td>
                    <td className="p-3 border-b">{passenger.seat_number}</td>
                    <td className="p-3 border-b">
                      {new Date(passenger.booking_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default ConductorDashboard
