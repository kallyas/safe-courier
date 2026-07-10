import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { ColorModeProvider } from "@/providers/ColorModeProvider";
import { AuthProvider } from "@/auth/AuthProvider";
import { queryClient } from "@/lib/queryClient";
import App from "@/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </ColorModeProvider>
  </React.StrictMode>,
);
