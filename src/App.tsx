import {
  ConnectButton,
  useActiveAccount,
  useActiveWalletChain,
  useConnectModal,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { createThirdwebClient, getContract } from "thirdweb";
import { Account } from "thirdweb/wallets";
import { viemAdapter } from "thirdweb/adapters/viem";
import { type Abi } from "viem";
import { sepolia } from "thirdweb/chains";
import { resolveContractAbi } from "thirdweb/contract";
import { useState } from "react";
import { Execute, getClient } from "@reservoir0x/reservoir-sdk";
import { BuyModal } from "@reservoir0x/reservoir-kit-ui";
import { wagmiConfig } from "./config";
import { injected } from "wagmi/connectors";
import { connect } from "wagmi/actions";

function App() {
  const activeAccount = useActiveAccount();
  return (
    <div className="flex flex-col p-4 pt-12 justify-center gap-3">
      <div className="text-center mx-auto max-w-[600px]">
        In this example, we will be connecting wallet to the app using thirdweb
        and then mint the NFTs using viem. The purpose of this demo is to
        showcase how you can use thirdweb sdk with viemAdapter
      </div>
      <div className="mx-auto">
        <ConnectButton client={thirdwebClient} />
      </div>

      {activeAccount ? (
        <MintNftWithViem thirdwebAccount={activeAccount} />
      ) : (
        <div className="mx-auto">Connect wallet to mint</div>
      )}
    </div>
  );
}

export default App;

const contractAddress = "0xBC163a11AEbc3c445953828BeD96fB5f5A60105f"; //NFT Contract sepolia
export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_CLIENT_ID || "THIRD_WEB_CLIENT_ID",
});

const MintNftWithViem = ({ thirdwebAccount }: { thirdwebAccount: Account }) => {
  const [collectAddress, setCollectAddress] = useState(
    "0xfb5b588ffcb63fd60d02ee95dcffc5ebfd9be473"
  );
  const [tokenId, setTokenId] = useState("2");

  const { connect: connectThirdweb } = useConnectModal();

  async function handleConnect() {
    try {
      const wallet = await connectThirdweb({ client: thirdwebClient }); // opens the connect modal
      console.log("connected to", wallet);

      const result = await connect(wagmiConfig, {
        connector: injected(),
      });
      console.log("result wagmi", result);
    } catch (error) {}
  }
  const switchChain = useSwitchActiveWalletChain();
  const walletChain = useActiveWalletChain();
  const activeAccount = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);

  const MintNFT = async () => {
    setIsLoading(true);
    // Make sure user is on the right chain
    if (walletChain?.id !== sepolia.id) await switchChain(sepolia);

    /**
     * Step 1: Preparing contract call params (we will be calling the `claim` function)
     * To keep a lean scope for this demo, we will be hard-coding a few variables
     * For example: you will be able to claim (for free) only 1 NFT (quantity = 1) at a time
     * However in most real world scenario you need to make things "dynamic"
     */
    // const quantity = 1;
    // const tokenId = 0; // The Edition contract in this repo has only 1 token
    // const currency = NATIVE_TOKEN_ADDRESS;
    // const receiver = thirdwebAccount.address;
    // const pricePerToken = 0;
    // const data = "0x";
    // const allowListProof = {
    //   proof: [
    //     "0x0000000000000000000000000000000000000000000000000000000000000000",
    //   ],
    //   quantityLimitPerWallet: 0,
    //   pricePerToken,
    //   currency: NATIVE_TOKEN_ADDRESS,
    // };

    /**
     * Step 2: Get viem walletClient from thirdweb's active account
     * using the `viemAdapter`
     */
    const walletClient = viemAdapter.walletClient.toViem({
      account: thirdwebAccount, // see: https://portal.thirdweb.com/typescript/v5/wallets
      client: thirdwebClient,
      chain: sepolia,
    });

    /**
     * Step 3: Use thirdweb sdk to get the ABI of the contract
     */
    const thirdwebContract = getContract({
      address: contractAddress,
      chain: sepolia,
      client: thirdwebClient,
    });
    const abi = await resolveContractAbi(thirdwebContract);

    /**
     * Step 3: Execute the transaction using viem
     */
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: abi as Abi,
        functionName: "safeMint",
        // @ts-ignore
        account: walletClient.account,
        args: [],
      });
      console.log({ hash });
      alert("Transaction submitted: " + hash);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const buyReservoirListing = async () => {
    if (!activeAccount || !walletChain) return;
    setIsLoading(true);
    if (walletChain?.id !== sepolia.id) await switchChain(sepolia);
    try {
      const address = thirdwebAccount.address;
      console.log("address", { address });

      // convert a thirdweb account to viem wallet client
      const viemClientWallet = viemAdapter.walletClient.toViem({
        client: thirdwebClient,
        chain: walletChain,
        account: activeAccount,
      });

      console.log("viemClientWallet", { viemClientWallet });

      getClient()?.actions.buyToken({
        items: [
          {
            token: `${collectAddress}:${tokenId}`,
            quantity: 1,
          },
        ],
        options: {
          taker: thirdwebAccount.address,
        },
        wallet: viemClientWallet as any, // if you remove this any it will give you an error (Invalid wallet client) probably this is the issue but I am unable to resolve this
        onProgress: (steps: Execute["steps"]) => {
          console.log("steps", { steps });
        },
      });
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const listReservoirNft = async () => {
    if (!activeAccount || !walletChain) return;
    setIsLoading(true);
    if (walletChain?.id !== sepolia.id) await switchChain(sepolia);
    try {
      const address = thirdwebAccount.address;
      console.log("address", { address });

      // convert a thirdweb account to viem wallet client
      const viemClientWallet = viemAdapter.walletClient.toViem({
        client: thirdwebClient,
        chain: walletChain,
        account: activeAccount,
      });

      console.log("viemClientWallet", { viemClientWallet });

      getClient()?.actions.listToken({
        chainId: sepolia.id,
        listings: [
          {
            token: `${collectAddress}:${tokenId}`,
            quantity: 1,
            weiPrice: "4250000000000", //  0.00000425
            orderbook: "reservoir",
            orderKind: "seaport-v1.5",
            expirationTime: "1720770039", //Fri Jul 12 2024 07:40:39 GMT+0000
            options: { "seaport-v1.5": { useOffChainCancellation: true } },
          },
        ],
        wallet: viemClientWallet as any,
        onProgress: (steps: Execute["steps"]) => {
          console.log("steps", { steps });
        },
      });
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto mt-10 lg:w-[800px] flex flex-col gap-4">
      <img
        src="/thirdweb-logo.jpeg"
        alt=""
        width={300}
        height={300}
        className="mx-auto border rounded-2xl"
      />
      <button
        className="bg-purple-700 text-white rounded-2xl py-3 w-[250px] mx-auto hover:bg-purple-500"
        onClick={MintNFT}
      >
        {isLoading ? "Minting..." : "Mint an NFT"}
      </button>
      <label>Collection:</label>
      <input
        type="text"
        value={collectAddress}
        placeholder="collection address"
        onChange={(e: any) => {
          setCollectAddress(e.target.value);
        }}
      />
      <label>Token Id:</label>
      <input
        type="text"
        value={tokenId}
        placeholder="collection token id"
        onChange={(e: any) => {
          setTokenId(e.target.value);
        }}
      />
      {/* Buying is working  */}
      <button
        className="bg-purple-700 text-white rounded-2xl py-3 w-[250px] mx-auto hover:bg-purple-500"
        onClick={buyReservoirListing}
      >
        {isLoading ? "Buying..." : "Buy listing SDK"}
      </button>
      {/* Listing is not working probably because of invalid wallet client (not sure if this the error or not)  */}
      <button
        className="bg-purple-700 text-white rounded-2xl py-3 w-[250px] mx-auto hover:bg-purple-500"
        onClick={listReservoirNft}
      >
        {isLoading ? "Listing..." : "List NFT SDK"}
      </button>

      {/* <BuyModal
        onConnectWallet={handleConnect}
        trigger={
          <button className="bg-purple-700 text-white rounded-2xl py-3 w-[250px] mx-auto hover:bg-purple-500">
            Buy Token RESRVOIR
          </button>
        }
        token={`${collectAddress}:${tokenId}`}
        onPurchaseComplete={(data) =>
          console.log("Purchase Complete", { data })
        }
        onPurchaseError={(error, data) =>
          console.log("Transaction Error", error, data)
        }
        onClose={(data, stepData, currentStep) =>
          console.log("Modal Closed", { data, stepData, currentStep })
        }
      /> */}
    </div>
  );
};
