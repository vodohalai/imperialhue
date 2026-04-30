import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { BehavioralIntelligence } from "@/components/BehavioralIntelligence";
import { useEffect, useState, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Offers from "./pages/Offers";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Amenities from "./pages/Amenities";
import Availability from "./pages/Availability";
import Booking from "./pages/Booking";

const Explore = lazy(() => import("./pages/Explore"));
const ExploreDetail = lazy(() => import("./pages/ExploreDetail"));
const DebugArticles = lazy(() => import("./pages/DebugArticles"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEditor = lazy(() => import("./pages/admin/Editor"));
const AdminAutomation = lazy(() => import("./pages/admin/Automation"));
const AdminPreview = lazy(() => import("./pages/admin/Preview"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
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
  if (!session) return <Navigate to="/admin/login" />;
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
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:slug" element={<RoomDetail />} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/booking/:slug" element={<Booking />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/explore" element={<Suspense fallback={<LoadingFallback />}><Explore /></Suspense>} />
              <Route path="/explore/:slug" element={<Suspense fallback={<LoadingFallback />}><ExploreDetail /></Suspense>} />
              <Route path="/about" element={<About />} />
              <Route path="/amenities" element={<Amenities />} />
              <Route path="/debug-articles" element={<Suspense fallback={<LoadingFallback />}><DebugArticles /></Suspense>} />

              <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
              <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense></ProtectedRoute>} />
              <Route path="/admin/editor" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminEditor /></Suspense></ProtectedRoute>} />
              <Route path="/admin/editor/:id" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminEditor /></Suspense></ProtectedRoute>} />
              <Route path="/admin/automation" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminAutomation /></Suspense></ProtectedRoute>} />
              <Route path="/admin/preview/:articleId" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AdminPreview /></Suspense></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;