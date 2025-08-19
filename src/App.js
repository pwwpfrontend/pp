import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import PartnerApplication from "./components/PartnerApplication";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Quotes from "./components/Quotes";
import Support from "./components/Support";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./components/Unauthorized";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/application" element={<PartnerApplication />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Private routes */}
        <Route element={<PrivateRoute roles={["admin", "level1", "level2", "level3"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/support" element={<Support />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
        </Route>

        {/* Example admin-only route placeholder */}
        <Route element={<PrivateRoute roles={["admin"]} />}>
          <Route path="/admin" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
