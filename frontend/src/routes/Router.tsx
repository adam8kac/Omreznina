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

// utilities
const SimulatePower = Loadable(lazy(() => import('../views/simulation/SimulatePower')));
const NetworkFee = Loadable(lazy(() => import('../views/simulation/NetworkFee')));
const Typography = Loadable(lazy(() => import('../views/typography/Typography')));
const Table = Loadable(lazy(() => import('../views/tables/Table')));
const Form = Loadable(lazy(() => import('../views/forms/Form')));
const Shadow = Loadable(lazy(() => import('../views/shadows/Shadow')));
const UploadData = Loadable(lazy(() => import('../views/forms/UploadDataForm')));
const UploadPage = Loadable(lazy(() => import('../views/forms/UploadForm')));
const UploadReciept = Loadable(lazy(() => import('../views/forms/UploadRecieptForm')));
const ReceiptExplanation = Loadable(lazy(() => import('../views/tables/RecieptExplanationTable')));

// icons
const Solar = Loadable(lazy(() => import('../views/icons/Solar')));

// authentication
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Profile = Loadable(lazy(() => import('../views/profile/Profile')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));
const ResetPassword = Loadable(lazy(() => import('../views/auth/reset/ResetPassword')));
const VerifyInfo = Loadable(lazy(() => import('../views/auth/verify/VerifyInfo')));
const AuthenticationHandler = Loadable(
  lazy(() => import('../views/auth/AuthenticationHandler'))
);



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
      { path: '/ui/typography', exact: true, element: <Typography /> },
      { path: '/ui/table', exact: true, element: <Table /> },
      { path: '/ui/form', exact: true, element: <Form /> },
      { path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: '/icons/solar', exact: true, element: <Solar /> },
      { path: '/profile', exact: true, element: <Profile /> },
      { path: '/upload-data', exact: true, element: <UploadData /> },
      { path: '/upload-invoice', exact: true, element: <UploadPage /> },
      { path: '/upload-reciept', exact: true, element: <UploadReciept /> },
      { path: '/reciept-explanation', exact: true, element: <ReceiptExplanation /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
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
      { path: '/auth/action', element: <AuthenticationHandler />,},

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
