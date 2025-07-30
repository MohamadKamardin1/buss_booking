import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, token, userRole, requiredRole }) => {
  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (requiredRole && userRole !== requiredRole && requiredRole !== 'admin') {
    // For admin routes you can handle differently if using adminToken instead
    return <Navigate to="/" replace />
  }
  return children
}

export default ProtectedRoute
