
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import AccessDenied from "./components/auth/AccessDenied";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import PatientDetails from "./pages/PatientDetails";

import Doctors from "./pages/Doctors";

import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";

import Consultations from "./pages/Consultations";
import StartConsultation from "./pages/StartConsultation";
import ConsultationDetails from "./pages/ConsultationDetails";

import Laboratory from "./pages/laboratory/Laboratory";
import LabTests from "./pages/laboratory/LabTests";
import LabOrderDetails from "./pages/laboratory/LabOrderDetails";
import NewLabOrder from "./pages/laboratory/NewLabOrder";

import UserManagement from "./pages/UserManagement";

const ROLES = {
  SUPER_ADMIN: "super_admin",
  RECEPTIONIST: "receptionist",
  DOCTOR: "doctor",
  LAB_TECHNICIAN: "lab_technician",
};

const PERMISSIONS = {
  patients: [
    ROLES.SUPER_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
  ],

  createPatient: [
    ROLES.SUPER_ADMIN,
    ROLES.RECEPTIONIST,
  ],

  doctors: [
    ROLES.SUPER_ADMIN,
    ROLES.RECEPTIONIST,
  ],

  appointments: [
    ROLES.SUPER_ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
  ],

  bookAppointment: [
    ROLES.SUPER_ADMIN,
    ROLES.RECEPTIONIST,
  ],

  consultations: [
    ROLES.SUPER_ADMIN,
    ROLES.DOCTOR,
  ],

  laboratory: [
    ROLES.SUPER_ADMIN,
    ROLES.DOCTOR,
    ROLES.LAB_TECHNICIAN,
  ],

  labTests: [
    ROLES.SUPER_ADMIN,
  ],

  newLabOrder: [
    ROLES.SUPER_ADMIN,
    ROLES.DOCTOR,
  ],

  labOrderDetails: [
    ROLES.SUPER_ADMIN,
    ROLES.DOCTOR,
    ROLES.LAB_TECHNICIAN,
  ],

  users: [
    ROLES.SUPER_ADMIN,
  ],
};

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const token = localStorage.getItem("hms_token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <AccessDenied />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const token = localStorage.getItem("hms_token");

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user && token
            ? <Navigate to="/" replace />
            : <Login />
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="patients"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.patients}>
              <Patients />
            </RoleRoute>
          }
        />

        <Route
          path="patients/new"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.createPatient}>
              <AddPatient />
            </RoleRoute>
          }
        />

        <Route
          path="patients/:id"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.patients}>
              <PatientDetails />
            </RoleRoute>
          }
        />

        <Route
          path="doctors"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.doctors}>
              <Doctors />
            </RoleRoute>
          }
        />

        <Route
          path="appointments"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.appointments}>
              <Appointments />
            </RoleRoute>
          }
        />

        <Route
          path="appointments/new"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.bookAppointment}>
              <BookAppointment />
            </RoleRoute>
          }
        />

        <Route
          path="consultations"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.consultations}>
              <Consultations />
            </RoleRoute>
          }
        />

        <Route
          path="consultations/new"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.DOCTOR]}>
              <StartConsultation />
            </RoleRoute>
          }
        />

        <Route
          path="consultations/:id"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.consultations}>
              <ConsultationDetails />
            </RoleRoute>
          }
        />

        <Route
          path="laboratory"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.laboratory}>
              <Laboratory />
            </RoleRoute>
          }
        />

        <Route
          path="laboratory/tests"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.labTests}>
              <LabTests />
            </RoleRoute>
          }
        />

        <Route
          path="laboratory/orders/new"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.newLabOrder}>
              <NewLabOrder />
            </RoleRoute>
          }
        />

        <Route
          path="laboratory/orders/:id"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.labOrderDetails}>
              <LabOrderDetails />
            </RoleRoute>
          }
        />

        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={PERMISSIONS.users}>
              <UserManagement />
            </RoleRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
