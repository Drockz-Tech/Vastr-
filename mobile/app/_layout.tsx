import { Stack } from "expo-router";
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/providers/AuthProvider';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { useAppTheme } from '../src/providers/ThemeProvider';

// Create a client for React Query caching
const queryClient = new QueryClient();

function ThemedStatusBar() {
  const { isDark } = useAppTheme();
  return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemedStatusBar />
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
