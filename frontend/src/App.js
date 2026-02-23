import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminClients from "./pages/admin/Clients";
import AdminMaterials from "./pages/admin/Materials";
import ClientDashboard from "./pages/client/Dashboard";
import ClientOrders from "./pages/client/Orders";
import TrackOrder from "./pages/TrackOrder";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/client" replace />;
  }
  
  return children;
};

// Redirect based on role
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="dark">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track/:orderId" element={<TrackOrder />} />
            
            {/* Root redirect */}
            <Route path="/" element={<RoleRedirect />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute adminOnly>
                <AdminClients />
              </ProtectedRoute>
            } />
            <Route path="/admin/materials" element={
              <ProtectedRoute adminOnly>
                <AdminMaterials />
              </ProtectedRoute>
            } />
            
            {/* Client Routes */}
            <Route path="/client" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/orders" element={
              <ProtectedRoute>
                <ClientOrders />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster richColors position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
