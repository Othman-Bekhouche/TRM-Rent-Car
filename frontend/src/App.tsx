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
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import CustomerProfile from './pages/public/CustomerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Reservations from './pages/admin/Reservations';
import ReservationDetails from './pages/admin/reservations/ReservationDetails';
import ContractPrint from './pages/admin/reservations/ContractPrint';
import InvoicePrint from './pages/admin/reservations/InvoicePrint';
import QuotePrint from './pages/admin/reservations/QuotePrint';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminRentedVehicles from './pages/admin/AdminRentedVehicles';
import Customers from './pages/admin/Customers';
import Quotes from './pages/admin/Quotes';
import Contracts from './pages/admin/Contracts';
import Invoices from './pages/admin/Invoices';
import GPS from './pages/admin/GPS';
import Accounting from './pages/admin/Accounting';
import History from './pages/admin/History';
import Maintenance from './pages/admin/Maintenance';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';
import Infractions from './pages/admin/Infractions';
import Messages from './pages/admin/Messages';
import Profile from './pages/admin/Profile';

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
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/booking/checkout/:vehicleId" element={<BookingCheckout />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reservations/:id" element={<ReservationDetails />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="rented-vehicles" element={<AdminRentedVehicles />} />
          <Route path="customers" element={<Customers />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="infractions" element={<Infractions />} />
          <Route path="gps" element={<GPS />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="history" element={<History />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Print Routes - Outside Layout for Full Screen */}
        <Route path="/admin/reservations/:id/print/contract" element={<ContractPrint />} />
        <Route path="/admin/reservations/:id/print/invoice" element={<InvoicePrint />} />
        <Route path="/admin/quotes/:id/print" element={<QuotePrint />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
