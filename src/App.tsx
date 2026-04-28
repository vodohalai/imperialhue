import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { BehavioralIntelligence } from "@/components/BehavioralIntelligence";
import { useEffect, useState, Suspense, lazy } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { isAdminSession } from "@/security/admin";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Rooms = lazy(() => import("./pages/Rooms"));
const RoomDetail = lazy(() => import("./pages/RoomDetail"));
const Offers = lazy(() => import("./pages/Offers"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Amenities = lazy(() => import("./pages/Amenities"));
const Availability = lazy(() => import("./pages/Availability"));
const Booking = lazy(() => import("./pages/Booking"));
const Explore = lazy(() => import("./pages/Explore"));
const ExploreDetail = lazy(() => import("./pages/ExploreDetail"));
const DebugArticles = lazy(() => import("./pages/DebugArticles"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEditor = lazy(() => import("./pages/admin/Editor"));
const AdminAutomation = lazy(() => import("./pages/admin/Automation"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session || !isAdminSession(session)) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D9488]" />
      <p className="mt-4 text-sm text-slate-500">Đang tải...</p>
    </div>
  </div>
);

const App = () => {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {!isMobile && <BehavioralIntelligence />}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rooms" element={<Suspense fallback={<LoadingFallback />}><Rooms /></Suspense>} />
              <Route path="/rooms/:slug" element={<Suspense fallback={<LoadingFallback />}><RoomDetail /></Suspense>} />
              <Route path="/availability" element={<Suspense fallback={<LoadingFallback />}><Availability /></Suspense>} />
              <Route path="/booking/:slug" element={<Suspense fallback={<LoadingFallback />}><Booking /></Suspense>} />
              <Route path="/offers" element={<Suspense fallback={<LoadingFallback />}><Offers /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
              <Route path="/explore" element={<Suspense fallback={<LoadingFallback />}><Explore /></Suspense>} />
              <Route path="/explore/:slug" element={<Suspense fallback={<LoadingFallback />}><ExploreDetail /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
              <Route path="/amenities" element={<Suspense fallback={<LoadingFallback />}><Amenities /></Suspense>} />
              <Route path="/debug-articles" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><DebugArticles /></Suspense></ProtectedRoute>} />

              <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
              <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense></ProtectedRoute>} />
              <Route path="/admin/editor" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminEditor /></Suspense></ProtectedRoute>} />
              <Route path="/admin/editor/:id" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminEditor /></Suspense></ProtectedRoute>} />
              <Route path="/admin/automation" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminAutomation /></Suspense></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
