import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthContext from '../../contexts/AuthContext';
import Dashboard from './Dashboard';
import PartsEntry from './PartsEntry';
import History from './History';

const UserPage = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  
  // Redirect to login if no user
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Redirect to admin dashboard if user is an admin
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/enter-part" element={<PartsEntry />} />
      <Route path="/history" element={<History />} />
      <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
    </Routes>
  );
};

export default UserPage; 