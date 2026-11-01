import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/providers/AuthProvider';

// Create a client for React Query caching
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
