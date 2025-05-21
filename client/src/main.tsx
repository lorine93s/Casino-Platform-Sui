import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import { WalletProvider } from "./contexts/wallet-context";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <WalletProvider>
      <App />
    </WalletProvider>
  </ThemeProvider>
);
