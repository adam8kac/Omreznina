import { RouterProvider } from "react-router";
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import router from "./routes/Router";
import { AuthProvider } from "./contexts/AuthContext";
import { UploadLoadingProvider } from "./contexts/UploadLoadingContext";


function App() {

  return (
    <>
      <AuthProvider>
      <UploadLoadingProvider>
      <ThemeModeScript />
      <Flowbite theme={{ theme: customTheme }}>
      <RouterProvider router={router} />
      </Flowbite>
      </UploadLoadingProvider>
      </AuthProvider>
    </>
  );
}

export default App;
