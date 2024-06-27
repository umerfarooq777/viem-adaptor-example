import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThirdwebProvider } from "thirdweb/react";
import { WagmiProvider } from "wagmi";
import { ReservoirKitProvider } from "@reservoir0x/reservoir-kit-ui";
import { reservoirConfig, theme, wagmiConfig } from "./config.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <ReservoirKitProvider options={reservoirConfig} theme={theme}>
        <ThirdwebProvider >
          <App />
        </ThirdwebProvider>
      </ReservoirKitProvider>
    </WagmiProvider>
  </React.StrictMode>
);
