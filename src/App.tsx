import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/hooks/useWallet";
import { AuthProvider } from "@/contexts/AuthContext";
import { SimpleEventChatbot } from "@/components/SimpleEventChatbot";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Profile from "./pages/Profile";
import Organize from "./pages/Organize";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/events" element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                } />
                <Route path="/events/:id" element={
                  <ProtectedRoute>
                    <EventDetails />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/organize" element={
                  <ProtectedRoute>
                    <Organize />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <SimpleEventChatbot />
          </TooltipProvider>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
