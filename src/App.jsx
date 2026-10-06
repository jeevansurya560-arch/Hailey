import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import { AppShell } from '@/app/AppShell'
import { HomePage } from '@/app/routes/HomePage'
import { ExplorePage } from '@/app/routes/ExplorePage'
import { ProfilePage } from '@/app/routes/ProfilePage'
import { AuthPage } from '@/features/auth/AuthPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { CommunitiesPage } from '@/features/communities/CommunitiesPage'
import { CommunityPage } from '@/features/communities/CommunityPage'
import { PostDetailPage } from '@/app/routes/PostDetailPage'
import { CulturePage } from '@/app/routes/CulturePage'
import { CollectionDetailPage } from '@/features/collections/CollectionDetailPage'
import { VerifyPage } from '@/app/routes/VerifyPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/c/:slug" element={<CulturePage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/:slug" element={<CommunityPage />} />
              <Route path="/collections/:id" element={<CollectionDetailPage />} />
              <Route path="/verify/:address" element={<VerifyPage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/u/:handle" element={<ProfilePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
