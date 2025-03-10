import { Route, Routes, BrowserRouter } from "react-router-dom"
import Home from "@/pages/Home"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import AuthRoute from "@/components/AuthRoute"
import { ThemeProvider } from "@/providers/ThemeProvider"
import ProfilePage from "./pages/ProfilePage"

function App() {
  const queryClient = new QueryClient()

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={
                <AuthRoute>
                  <ProfilePage />
                </AuthRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
