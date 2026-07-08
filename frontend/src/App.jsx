import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadECG from "./pages/UploadECG";
import UploadHeartSound from "./pages/UploadHeartSound";
import UploadReport from "./pages/UploadReport";
import UploadXray from "./pages/UploadXray";
import PatientHistory from "./pages/PatientHistory";
import DoctorDashboard from "./pages/DoctorDashboard";
import ChatAssistant from "./pages/ChatAssistant";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ecg"
          element={
            <ProtectedRoute>
              <UploadECG />
            </ProtectedRoute>
          }
        />

        <Route
          path="/heart-sound"
          element={
            <ProtectedRoute>
              <UploadHeartSound />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <UploadReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/xray"
          element={
            <ProtectedRoute>
              <UploadXray />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <PatientHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatAssistant />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;