import { RouterProvider } from 'react-router';
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import router from './routes/Router';
// import { AuthProvider } from './contexts/AuthContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UploadLoadingProvider } from './contexts/UploadLoadingContext';
import ChatbotPopup from './components/chatbot/ChatbotComponent';

function ChatbotWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <ChatbotPopup />;
}

function App() {
  return (
    <>
      <AuthProvider>
        <UploadLoadingProvider>
          <ThemeModeScript />
          <Flowbite theme={{ theme: customTheme }}>
            <RouterProvider router={router} />
            <ChatbotWrapper />
          </Flowbite>
        </UploadLoadingProvider>
      </AuthProvider>
    </>
  );
}

export default App;
