import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { AppContextProvider } from "./context/ApiContextProvider";
import AppRouter from "./AppRouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContextProvider>
          <AppRouter />
          <Toaster
            visibleToasts={1}
            position="bottom-right"
            richColors
            duration={2000}
          />
        </AppContextProvider>
      </Router>
    </QueryClientProvider>
  </StrictMode>
);
