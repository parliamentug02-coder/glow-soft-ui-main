import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MessagesProvider } from "@/contexts/MessagesContext"; // Import MessagesProvider
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SubcategoryPage from "./pages/SubcategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import AdminPanel from "./pages/AdminPanel";
import CreateAdPage from "./pages/CreateAdPage";
import AdvertisementPage from "./pages/AdvertisementPage";
import UserProfilePage from "./pages/UserProfilePage";
import MessagesPage from "./pages/MessagesPage"; // Import MessagesPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" attribute="class">
      <AuthProvider>
        <MessagesProvider> {/* Wrap with MessagesProvider */}
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/:category/:subcategory" element={<SubcategoryPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/create-ad" element={<CreateAdPage />} />
                <Route path="/advertisement/:id" element={<AdvertisementPage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} /> {/* Add messages route */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MessagesProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;