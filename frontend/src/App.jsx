import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import VendorSignup from "./pages/VendorSignup";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/VendorDashboard";
import CustomerMenu from "./pages/CustomerMenuFullScreen";
import OrderTracking from "./pages/OrderTracking";
import Navigation from "./components/Navigation";
import VendorDebug from "./components/VendorDebug";
import VendorDashboardCustomize from "./pages/VendorDashboardCustomize";
import StorageTest from "./components/StorageTest";
import SimpleImageUpload from "./components/SimpleImageUpload";

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
        <Route path="/debug" element={<VendorDebug />} />
        <Route path="/customize" element={<VendorDashboardCustomize />} />
        <Route path="/vendor-dashboard/customize" element={<VendorDashboardCustomize />} />
        <Route path="/storage-test" element={<StorageTest />} />
        <Route path="/simple-upload" element={<SimpleImageUpload />} />
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
