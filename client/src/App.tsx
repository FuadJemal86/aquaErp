import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import NotFound from "./Pages/NotFound";
import { adminRoutes } from "./routes/adminRoutes";
import Login from "./Pages/Login/Login";
function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <Outlet />
              </ThemeProvider>
            }
          >
            {adminRoutes}
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
