import { RouterProvider } from "react-router";
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import router from "./routes/Router";
import { AuthProvider } from "./contexts/AuthContext";


function App() {

  return (
    <>
      <AuthProvider>
      <ThemeModeScript />
      <Flowbite theme={{ theme: customTheme }}>
      <RouterProvider router={router} />
      </Flowbite>
      </AuthProvider>
    </>
  );
}

export default App;
