import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import GuruDashboard from "./pages/GuruDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MuridDetail from "./pages/MuridDetail";
import JurnalRumahForm from "./pages/JurnalRumahForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/guru" element={<GuruDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/murid/:id" element={<MuridDetail />} />
            <Route path="/jurnal-rumah" element={<JurnalRumahForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
