import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

const BusBooking = ({ token }) => {
  const { busId } = useParams() // get busId from route param
  const navigate = useNavigate()

  const [bus, setBus] = useState(null)
  const [availableSeats, setAvailableSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [passengerName, setPassengerName] = useState('')
  const [passengerEmail, setPassengerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setError(null)
        const res = await axios.get(`http://localhost:8000/api/buses/${busId}/`, {
          headers: { Authorization: `Token ${token}` },
        })
        setBus(res.data)

        const freeSeats = res.data.seats.filter(seat => !seat.is_booked)
        setAvailableSeats(freeSeats)
      } catch (err) {
        setError('Failed to load bus details: ' + (err.response?.data.detail || err.message))
      }
    }
    fetchBusDetails()
  }, [busId, token])

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber))
    } else {
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat')
      return
    }
    if (!passengerName.trim() || !passengerEmail.trim()) {
      setError('Please provide passenger name and email')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await axios.post(
        'http://localhost:8000/api/bookings/',
        {
          bus: busId,
          seats: selectedSeats,
          passenger_name: passengerName,
          passenger_email: passengerEmail,
          trip_date: bus.trip_date,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      setSuccessMessage('Booking successful! Thank you.')
      setSelectedSeats([])
      setPassengerName('')
      setPassengerEmail('')
    } catch (err) {
      setError('Booking failed: ' + (err.response?.data.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (!bus) return <div>Loading bus details...</div>

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-4">Book Seats for {bus.bus_name}</h2>
      <p className="mb-2">
        Route: {bus.origin} - {bus.destination}
      </p>
      <p className="mb-4">Trip Date: {bus.trip_date}</p>

      <div className="mb-4">
        <h3 className="mb-2 font-semibold">Select Seats:</h3>
        <div className="grid grid-cols-6 gap-2">
          {availableSeats.map((seat) => (
            <button
              key={seat.seat_number}
              type="button"
              onClick={() => toggleSeat(seat.seat_number)}
              className={`py-2 px-3 rounded ${
                selectedSeats.includes(seat.seat_number) ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {seat.seat_number}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleBooking}>
        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="passengerName">
            Passenger Name
          </label>
          <input
            id="passengerName"
            type="text"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="passengerEmail">
            Passenger Email
          </label>
          <input
            id="passengerEmail"
            type="email"
            value={passengerEmail}
            onChange={(e) => setPassengerEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )
}

export default BusBooking
