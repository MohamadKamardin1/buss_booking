import React, { useState, useEffect } from 'react'
import axios from 'axios'

const RegisterForm = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'passenger',      
    bus_ids: [],            
  })

  const [buses, setBuses] = useState([])
  const [loadingBuses, setLoadingBuses] = useState(false)

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (form.role === 'conductor') {
      setLoadingBuses(true)
      axios.get('http://localhost:8000/api/buses/')
        .then(res => setBuses(res.data))
        .catch(err => console.error('Error fetching buses:', err))
        .finally(() => setLoadingBuses(false))
    }
  }, [form.role])

  const handleChange = (e) => {
    const { name, value, type, options } = e.target

    if (name === 'bus_ids' && type === 'select-multiple') {
      const selectedOptions = Array.from(options)
        .filter(option => option.selected)
        .map(option => Number(option.value))
      setForm(prev => ({
        ...prev,
        bus_ids: selectedOptions
      }))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    // Basic client validation for conductor bus selection
    if (form.role === 'conductor' && form.bus_ids.length === 0) {
      setMessage('Please select at least one bus if registering as a conductor.')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      }
      if (form.role === 'conductor') {
        payload.bus_ids = form.bus_ids
      }

      await axios.post('http://localhost:8000/api/register/', payload)

      setMessage('Registration successful! You can now login.')
      setForm({
        username: '',
        email: '',
        password: '',
        role: 'passenger',
        bus_ids: [],
      })
    } catch (error) {
      const errResponse = error.response?.data
      if (errResponse) {
        if (errResponse.username) setMessage(`Username: ${errResponse.username}`)
        else if (errResponse.email) setMessage(`Email: ${errResponse.email}`)
        else if (errResponse.error) setMessage(errResponse.error)
        else setMessage('Registration failed. Please check your inputs.')
      } else {
        setMessage('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>

        {message && (
          <div className={`rounded-md p-4 ${message.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <fieldset className="mb-4">
            <legend className="text-base font-medium text-gray-900 mb-2">Register as</legend>
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="passenger"
                  checked={form.role === 'passenger'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700">Traveler</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="conductor"
                  checked={form.role === 'conductor'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700">Conductor</span>
              </label>
            </div>
          </fieldset>

          {form.role === 'conductor' && (
            <div className="mb-4">
              <label htmlFor="bus_ids" className="block text-sm font-medium text-gray-700 mb-1">
                Select Bus(es) You Work On
              </label>
              {loadingBuses ? (
                <p className="text-gray-500">Loading buses...</p>
              ) : (
                <select
                  id="bus_ids"
                  name="bus_ids"
                  multiple
                  size={Math.min(5, buses.length)}
                  value={form.bus_ids}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>
                      {bus.bus_name} ({bus.number}) — {bus.origin} → {bus.destination}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading
                ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
