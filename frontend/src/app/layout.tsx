"use client";
import { Provider } from "react-redux";
import { store } from "../store";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";
import { Box } from "@mui/material";
import { Sidebar } from "../components";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh" }}>
              <Sidebar />
              <Box 
                component="main" 
                sx={{ 
                  flexGrow: 1, 
                  p: 4, 
                  backgroundColor: "background.default",
                  ml: "280px", // DRAWER_WIDTH
                }}
              >
                {children}
              </Box>
            </Box>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
