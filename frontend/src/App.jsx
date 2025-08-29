import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import VendorSignup from "./pages/VendorSignup";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/VendorDashboard";
import CustomerMenu from "./pages/CustomerMenu";
import OrderTracking from "./pages/OrderTracking";
import Navigation from "./components/Navigation";

function AppContent() {
  const location = useLocation();
  const isCustomerMenu = location.pathname.startsWith('/menu/') || location.pathname.startsWith('/track/');

  return (
    <>
      {!isCustomerMenu && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/menu/:slug" element={<CustomerMenu />} />
        <Route path="/track/:orderNumber" element={<OrderTracking />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
