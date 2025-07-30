import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './deepcomponents/Home'

import RegisterForm from './deepcomponents/RegisterForm'
import LoginForm from './deepcomponents/LoginForm'
import BusList from './deepcomponents/BusList'
import BusSeats from './deepcomponents/BusSeats'
import UserBookings from './deepcomponents/UserBooking'
import Wrapper from './deepcomponents/Wrapper'

import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import ProtectedRoute from './admin/ProtectedRoute'

import ConductorDashboard from './deepcomponents/ConductorDashboard'
import ConductorLogin from './deepcomponents/ConductorLogin'

// Import your BusBooking component (adjust the import path as needed)
import BusBooking from './deepcomponents/BusBooking'

const App = () => {
  // States for user auth info
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userId, setUserId] = useState(localStorage.getItem('userId'))
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'))

  // States for admin auth separately
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'))

  // Selected busId (optional)
  const [selectedBusId, setSelectedBusId] = useState(null)

  // User login handler
  const handleLogin = (token, userId, role) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', userId)
    localStorage.setItem('userRole', role)
    setToken(token)
    setUserId(userId)
    setUserRole(role)
  }

  // User logout handler
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    setToken(null)
    setUserId(null)
    setUserRole(null)
    setSelectedBusId(null)
  }

  // Admin login/logout
  const handleAdminLogin = (token) => {
    localStorage.setItem('adminToken', token)
    setAdminToken(token)
  }
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken')
    setAdminToken(null)
  }

  return (
    <div>
      <Routes>
        {/* Root path - redirect based on role */}
        <Route
          path="/"
          element={
            adminToken ? (
              <Navigate to="/admin" replace />
            ) : token ? (
              userRole === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : userRole === 'conductor' ? (
                <Navigate to="/conductor" replace />
              ) : (
                <Wrapper token={token} handleLogout={handleLogout}>
                  <BusList onSelectBus={(id) => setSelectedBusId(id)} token={token} />
                </Wrapper>
              )
            ) : (
              <Home />
            )
          }
        />

        {/* Public routes */}
        <Route
          path="/register"
          element={
            token || adminToken ? (
              <Navigate to="/" replace />
            ) : (
              <Wrapper>
                <RegisterForm />
              </Wrapper>
            )
          }
        />

        <Route
          path="/login"
          element={
            token || adminToken ? (
              <Navigate to="/" replace />
            ) : (
              <Wrapper>
                <LoginForm onLogin={handleLogin} />
              </Wrapper>
            )
          }
        />

        <Route
          path="/conductor/login"
          element={
            token || adminToken ? (
              <Navigate to="/conductor" replace />
            ) : (
              <ConductorLogin
                onLogin={(token, userId, role) => {
                  localStorage.setItem('token', token)
                  localStorage.setItem('userId', userId)
                  localStorage.setItem('userRole', role)
                  setToken(token)
                  setUserId(userId)
                  setUserRole(role)
                }}
              />
            )
          }
        />

        <Route
          path="/bus/:busId"
          element={
            token ? (
              <Wrapper token={token} handleLogout={handleLogout}>
                <BusSeats token={token} />
              </Wrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/bus/:busId/book"
          element={
            token ? (
              <Wrapper token={token} handleLogout={handleLogout}>
                <BusBooking token={token} />
              </Wrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/my-bookings"
          element={
            token ? (
              <Wrapper token={token} handleLogout={handleLogout}>
                <UserBookings token={token} userId={userId} />
              </Wrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/login"
          element={
            adminToken || token ? (
              <Navigate to="/" replace />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute token={adminToken} requiredRole="admin">
              <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />
            </ProtectedRoute>
          }
        />

        {/* Conductor dashboard protected */}
        <Route
          path="/conductor"
          element={
            <ProtectedRoute token={token} userRole={userRole} requiredRole="conductor">
              <ConductorDashboard token={token} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* You can add fallback redirect if desired */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </div>
  )
}

export default App
