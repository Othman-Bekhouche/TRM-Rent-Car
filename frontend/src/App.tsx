import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Vehicles from './pages/public/Vehicles';
import VehicleDetail from './pages/public/VehicleDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/auth/Login';
import Register from './pages/public/auth/Register';
import BookingCheckout from './pages/public/BookingCheckout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Reservations from './pages/admin/Reservations';
import AdminVehicles from './pages/admin/AdminVehicles';
import Customers from './pages/admin/Customers';
import GPS from './pages/admin/GPS';
import Accounting from './pages/admin/Accounting';
import Maintenance from './pages/admin/Maintenance';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';
import Infractions from './pages/admin/Infractions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking/checkout/:vehicleId" element={<BookingCheckout />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="customers" element={<Customers />} />
          <Route path="infractions" element={<Infractions />} />
          <Route path="gps" element={<GPS />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
