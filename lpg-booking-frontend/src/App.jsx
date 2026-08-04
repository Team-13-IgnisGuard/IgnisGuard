import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LayoutWrapper from './components/layout/LayoutWrapper';
import ProtectedRoute from './components/route/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CompleteProfile from './pages/customer/CompleteProfile';
import EditProfile from './pages/customer/EditProfile';
import Profile from './pages/customer/Profile';
import BookCylinder from './pages/customer/BookCylinder';
import BookingHistory from './pages/customer/BookingHistory';

// Distributor Pages
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import BookingAssignment from './pages/distributor/BookingAssignment';
import AgentManagement from './pages/distributor/AgentManagement';
import CylinderTracking from './pages/distributor/CylinderTracking';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

// Warehouse Manager Pages
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';

// Delivery Agent Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerList from './pages/admin/CustomerList';
import DistributorList from './pages/admin/DistributorList';
import AgentList from './pages/admin/AgentList';
import AdminBookingList from './pages/admin/AdminBookingList';

// Error Pages
import NotFound from './pages/error/NotFound';
import Unauthorized from './pages/error/Unauthorized';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LayoutWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Customer Protected Routes */}
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/complete-profile" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CompleteProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['Customer', 'Distributor', 'DeliveryAgent', 'Admin']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/edit-profile" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/book" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <BookCylinder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/history" 
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <BookingHistory />
                </ProtectedRoute>
              } 
            />

            {/* Distributor Protected Routes */}
            <Route 
              path="/distributor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Distributor']}>
                  <DistributorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/distributor/bookings" 
              element={
                <ProtectedRoute allowedRoles={['Distributor']}>
                  <BookingAssignment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/distributor/agents" 
              element={
                <ProtectedRoute allowedRoles={['Distributor']}>
                  <AgentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/distributor/cylinders" 
              element={
                <ProtectedRoute allowedRoles={['Distributor']}>
                  <CylinderTracking />
                </ProtectedRoute>
              } 
            />

            {/* Delivery Agent Protected Routes */}
            <Route 
              path="/deliveryagent/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['DeliveryAgent']}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Fallback route redirecting /deliveryagent/deliveries to the dashboard */}
            <Route 
              path="/deliveryagent/deliveries" 
              element={
                <ProtectedRoute allowedRoles={['DeliveryAgent']}>
                  <Navigate to="/deliveryagent/dashboard" replace />
                </ProtectedRoute>
              } 
            />

            {/* Admin Protected Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/customers" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CustomerList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/distributors" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DistributorList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/agents" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AgentList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminBookingList />
                </ProtectedRoute>
              } 
            />

            {/* Super Admin Protected Routes */}
            <Route 
              path="/superadmin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['SuperAdmin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Warehouse Manager Protected Routes */}
            <Route 
              path="/warehousemanager/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['WarehouseManager']}>
                  <WarehouseDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </LayoutWrapper>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
