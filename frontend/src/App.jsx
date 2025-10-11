import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Router } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './features/admin/pages/DashboardPage';
import { ThemeProvider } from './Context/ThemeContext';
import UsersPage from './features/admin/pages/users/UsersPage';
import CreateUserPage from './features/admin/pages/users/CreateUserPage';
import CoachesPage from './features/admin/pages/coaches/CoachesPage';
import CreateCoachPage from './features/admin/pages/coaches/CreateCoachPage';
import CategoriesPage from './features/admin/pages/category/CategoriesPage';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './Context/AuthContext';
import ManageCoursesPage from './features/admin/pages/courses/ManageCoursesPage';
import CreateCoursePage from './features/admin/pages/courses/CreateCoursePage';
import EditCoursePage from './features/admin/pages/courses/EditCoursePage';


// --- Main App Component ---
export default function App() {

  return (
    <>
      <ThemeProvider>

        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path='/' element={<Navigate to='/dashboard' />} />
                <Route path='/dashboard' element={<DashboardPage />} />
                <Route path='/manage-users' element={<UsersPage />} />
                <Route path='/manage-coaches' element={<CoachesPage />} />
                <Route path='/manage-category' element={<CategoriesPage />} />
                <Route path='/manage-courses' element={<ManageCoursesPage />} />
                <Route path='/create-user' element={<CreateUserPage />} />
                <Route path='/create-coach' element={<CreateCoachPage />} />
                <Route path="/create-course" element={<CreateCoursePage />} />
                <Route path="/edit-course/:courseId" element={<EditCoursePage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

