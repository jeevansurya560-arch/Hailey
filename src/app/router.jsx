import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/features/feed/pages/HomePage'
import { ExplorePage } from '@/features/culture/pages/ExplorePage'
import { CulturePage } from '@/features/culture/pages/CulturePage'
import { CommunitiesPage } from '@/features/communities/pages/CommunitiesPage'
import { CommunityPage } from '@/features/communities/pages/CommunityPage'
import { CollectionDetailPage } from '@/features/collections/pages/CollectionDetailPage'
import { FestivalsPage } from '@/features/festivals/pages/FestivalsPage'
import { CreatorAnalyticsPage } from '@/features/analytics/pages/CreatorAnalyticsPage'
import { TicketingPage } from '@/features/ticketing/pages/TicketingPage'
import { MarketsPage } from '@/features/markets/pages/MarketsPage'
import { VerifyPage } from '@/features/verification/pages/VerifyPage'
import { PostDetailPage } from '@/features/posts/pages/PostDetailPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/festivals" element={<FestivalsPage />} />
        <Route path="/analytics" element={<CreatorAnalyticsPage />} />
        <Route path="/c/:slug" element={<CulturePage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/:slug" element={<CommunityPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage />} />
        <Route path="/tickets" element={<TicketingPage />} />
        <Route path="/markets" element={<MarketsPage />} />
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
  )
}

export default AppRoutes
