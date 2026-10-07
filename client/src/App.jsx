import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import NewMeeting from "./pages/NewMeeting";
import MeetingDetails from "./pages/MeetingDetails";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Invitations from "./pages/Invitations";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        <Route element={<ProtectedRoute />}>

          <Route element={<AppLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/meetings"
              element={<Meetings />}
            />
            <Route path="/meetings/new" element={<NewMeeting />} />
            <Route
              path="/meetings/:id"
              element={<MeetingDetails />}
            />

            <Route
              path="/teams"
              element={<Teams />}
            />

            <Route
              path="/teams/:teamId"
              element={<TeamDetails />}
            />

            <Route
              path="/invitations"
              element={<Invitations />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>

        </Route>


        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;