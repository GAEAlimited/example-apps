/* Required since nextjs13 to define a client component */
"use client";

import { TatumSDK, Network, Ethereum } from "@tatumcom/js";
import * as React from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { Balances, processBalances } from "@/lib/utils";

import Button from "../atoms/Button";
import Card from "../atoms/Card";
import Loading from "../atoms/Loading";
import Portfolio from "../molecules/Portfolio";

const Metamask = (): JSX.Element => {
  const [loading, setLoading] = React.useState(false);
  const [account, setAccount] = React.useState("");
  const [balances, setBalances] = React.useState<Balances>({
    coin: "",
    erc20: [],
    erc721: [],
    erc1155: [],
  });

  const fetchBalances = async (address: string) => {
    if (!loading) setLoading(true);

    try {
      const tatum = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM_SEPOLIA,
      });

      /* https://docs.tatum.com/docs/wallet-address-operations/get-all-assets-the-wallet-holds */
      const bal = await tatum.address.getBalance({
        addresses: [address],
      });

      setBalances(processBalances(bal.data));
    } catch (error) {
      console.error(error);
      toast.error("Balances failed to load");
    }

    setLoading(false);
  };

  const connectMetamask = async () => {
    setLoading(true);

    try {
      const tatum = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM_SEPOLIA,
      });

      /* https://docs.tatum.com/docs/wallet-provider/metamask/connect-a-wallet */
      const acc = await tatum.walletProvider.metaMask.connect();

      setAccount(acc);
      fetchBalances(acc);
    } catch (error) {
      console.error(error);
      toast.error("Connection failed");
    }
  };

  return (
    <div>
      <Card
        className={`absolute justify-center inset-0 transition-opacity duration-500 ${
          account ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Image
          src="/metamask.svg"
          alt="Metamask Logo"
          width={200}
          height={50}
          priority
        />
        <Button onClick={connectMetamask} disabled={loading}>
          {loading ? <Loading /> : "Connect"}
        </Button>
      </Card>
      <Card
        className={`transition-opacity min-w-[300px] duration-500 ${
          account ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Card className="text-sm text-white bg-gray-800 rounded-lg shadow-lg p-6">
          <Card className="space-y-3">
            <Image
              className="mb-3"
              src="/metamask.svg"
              alt="Metamask Logo"
              width={60}
              height={15}
              priority
            />
            <div className="text-xl">{balances.coin}</div>
            <input
              type="text"
              id="address"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="block w-[360px] text-center py-2 mt-1 border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700"
              placeholder="Enter address"
              required
            />
          </Card>
          <Portfolio balances={balances} />
          <Button
            className="w-full border-white"
            disabled={loading}
            onClick={() => fetchBalances(account)}
          >
            {loading ? <Loading /> : "Refresh Balances"}
          </Button>
        </Card>
      </Card>
    </div>
  );
};

export default Metamask;
