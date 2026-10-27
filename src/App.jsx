import { Routes, Route, useNavigate } from "react-router-dom";
import AuthExperience from "./AidLinkAuth.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import FoodDetailPage from "./pages/FoodDetailPage.jsx";
import PostFoodPage from "./pages/PostFoodPage.jsx";
import RequestsPage from "./pages/RequestsPage.jsx";
import DonatePage from "./pages/DonatePage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import DashboardPosts from "./pages/DashboardPosts.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./hooks/useAuth.js";

// Wraps AuthExperience so it can log the user in (localStorage) and
// redirect to /browse once login succeeds.
function AuthRoute({ initialView }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthExperience
      initialView={initialView}
      onLoginSuccess={(userData) => {
        login(userData);
        navigate("/browse");
      }}
    />
  );
}

export default function App() {
  return (
    <Routes>
      {/* auth (intro animation + login/signup) */}
      <Route path="/" element={<AuthRoute initialView="login" />} />
      <Route path="/signup" element={<AuthRoute initialView="signup" />} />

      {/* public browse + dynamic detail route */}
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/food/:id" element={<FoodDetailPage />} />

      {/* restaurant posts surplus food */}
      <Route
        path="/post-food"
        element={
          <ProtectedRoute>
            <PostFoodPage />
          </ProtectedRoute>
        }
      />

      {/* citizens ask for non-food needs; anyone can browse */}
      <Route path="/requests" element={<RequestsPage />} />

      {/* citizens offer non-food donations to NGOs; anyone can browse offers */}
      <Route path="/donate" element={<DonatePage />} />

      {/* anyone can leave a review and read others */}
      <Route path="/reviews" element={<ReviewsPage />} />

      {/* protected, nested dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="posts" element={<DashboardPosts />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
