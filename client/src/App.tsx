import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { Loader } from "@/components/Loader";

// Route-level code splitting keeps the initial bundle small; heavier pages
// (e.g. the DataGrid screens) load only when visited.
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Track = lazy(() => import("@/pages/Track"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Parcels = lazy(() => import("@/pages/Parcels"));
const AddParcel = lazy(() => import("@/pages/AddParcel"));
const ParcelDetail = lazy(() => import("@/pages/ParcelDetail"));
const Profile = lazy(() => import("@/pages/Profile"));
const Users = lazy(() => import("@/pages/Users"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <Suspense fallback={<Loader minHeight="100vh" />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:code" element={<Track />} />

        {/* Public-only (redirect away when authenticated) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Authenticated app */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parcels" element={<Parcels />} />
            <Route path="/parcels/new" element={<AddParcel />} />
            <Route path="/parcels/:id" element={<ParcelDetail />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin-only */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
