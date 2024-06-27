import { darkTheme } from "@reservoir0x/reservoir-kit-ui";
import { reservoirChains } from "@reservoir0x/reservoir-sdk";
import { createConfig } from "wagmi";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { createClient } from "viem";

export const theme = darkTheme({
  headlineFont: "Sans Serif",
  font: "Serif",
  primaryColor: "#323aa8",
  primaryHoverColor: "#252ea5",
});

export const reservoirConfig = {
  chains: [
    {
      ...reservoirChains.sepolia,
      active: true,
    },
  ],
  apiKey: "YOUR_API_KEY",
};

export const wagmiConfig = createConfig({
  chains: [sepolia],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
