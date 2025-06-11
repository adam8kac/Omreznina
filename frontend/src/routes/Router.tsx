// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import ProtectedRoute from './ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));
const AboutUs = Loadable(lazy(() => import('../views/dashboards/AboutUs')));

// utilities
const SimulatePower = Loadable(lazy(() => import('../views/simulation/SimulatePower')));
const NetworkFee = Loadable(lazy(() => import('../views/simulation/NetworkFee')));
const UploadData = Loadable(lazy(() => import('../views/forms/UploadDataForm')));
const UploadPage = Loadable(lazy(() => import('../views/forms/UploadForm')));
const UploadReciept = Loadable(lazy(() => import('../views/forms/UploadRecieptForm')));
const ReceiptExplanation = Loadable(lazy(() => import('../views/tables/RecieptExplanationTable')));
const MonthlyConsumption = Loadable(lazy(() => import('../views/simulation/MonthlyConsumptionView')));
const PowerStats = Loadable(lazy(() => import('../views/simulation/PowerStatsView')));
const DashboardGuide = Loadable(lazy(() => import('../views/dashboards/DashboardGuide')));
const Prediction = Loadable(lazy(() => import('../views/tables/PredictionView')));
const DeleteFile = Loadable(lazy(() => import('../components/fileManegment/DeleteFile')));

//easteregg
const EasterEgg = Loadable(lazy(() => import('../views/easteregg/Tina')));

// authentication
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Profile = Loadable(lazy(() => import('../views/profile/Profile')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));
const ResetPassword = Loadable(lazy(() => import('../views/auth/reset/ResetPassword')));
const VerifyInfo = Loadable(lazy(() => import('../views/auth/verify/VerifyInfo')));
const AuthenticationHandler = Loadable(lazy(() => import('../views/auth/AuthenticationHandler')));

const Router = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', exact: true, element: <Dashboard /> },
      { path: '/simulate-power', exact: true, element: <SimulatePower /> },
      { path: '/network-fee', exact: true, element: <NetworkFee /> },
      { path: '/profile', exact: true, element: <Profile /> },
      { path: '/upload-data', exact: true, element: <UploadData /> },
      { path: '/upload-invoice', exact: true, element: <UploadPage /> },
      { path: '/upload-reciept', exact: true, element: <UploadReciept /> },
      { path: '/reciept-explanation', exact: true, element: <ReceiptExplanation /> },
      { path: '/monthly-consumption', exact: true, element: <MonthlyConsumption /> },
      { path: '/power-stats', exact: true, element: <PowerStats /> },
      { path: '/dashboard-guide', exact: true, element: <DashboardGuide /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
      { path: '/about-us', exact: true, element: <AboutUs /> },
      { path: '/prediction', exact: true, element: <Prediction /> },
      { path: '/delete-files', exact: true, element: <DeleteFile /> },
      { path: '/easteregg', exact: true, element: <EasterEgg /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/reset-password', element: <ResetPassword /> },
      { path: '/auth/404', element: <Error /> },
      { path: '/auth/action', element: <AuthenticationHandler /> },
    ],
  },
  {
    path: '/auth/verify-info',
    element: <VerifyInfo />,
  },
  {
    path: '*',
    element: <Navigate to="/auth/404" />,
  },
];

const router = createBrowserRouter(Router, {
  basename: import.meta.env.VITE_BASE_PATH || '/',
});

export default router;
