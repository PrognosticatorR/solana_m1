import { useState, useEffect } from "react";
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;
import "./App.css";
import { Button, ButtonGroup } from "@chakra-ui/react";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";

function App() {
  const [keyPair, setKeyPair] = useState(null);
  const [connection, setConnection] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    async function hydrate() {
      const connection = new Connection(clusterApiUrl("devnet"));
      setConnection(connection);
    }
    hydrate();
  }, []);

  const handelCreateAccountClick = async () => {
    const keyPair = Keypair.generate();
    setKeyPair(keyPair);
    const airdroptTxnHash = await connection.requestAirdrop(keyPair.publicKey, 2 * LAMPORTS_PER_SOL);
    const confirmed = await connection.confirmTransaction(airdroptTxnHash, "confirmed");
    console.log("🦀 ~ file: App.jsx:27 ~ handelCreateAccountClick ~ confirmed:", confirmed);
    const balance = await connection.getBalance(keyPair.publicKey);
    console.log("🦀 ~ file: App.jsx:29 ~ handelCreateAccountClick ~ balance:", 2 + "SOL");
  };

  const connectToWallet = async () => {
    const { solana } = window;
    if (!!solana) {
      if (solana.isPhantom) {
        const wallet = await solana.connect();
        setWallet(wallet);
        console.log(wallet);
      } else {
        setWallet(null);
        console.log("Please install phantom solana wallet");
        alert("phantom wallet is not installed");
      }
    } else {
      setWallet(null);
      console.log("Please install solana wallet");
      alert("wallet is not installed");
    }
  };

  const transfetSOL = async () => {
    try {
      const balance = await connection.getBalance(keyPair.publicKey);
      console.log("🦀 ~ file: App.jsx:29 ~ handelCreateAccountClick ~ balance:", balance);
      const instruction = SystemProgram.transfer({
        fromPubkey: keyPair.publicKey,
        toPubkey: new PublicKey(wallet.publicKey),
        lamports: 2 * LAMPORTS_PER_SOL,
      });
      console.log("🦀 ~ file: App.jsx:67 ~ transfetSOL ~ wallet:", wallet);
      console.log("🦀 ~ file: App.jsx:65 ~ transfetSOL ~ instruction:", instruction);
      const transaction = new Transaction().add(instruction);
      transaction.feepayer = keyPair.publicKey;
      console.log("🦀 ~ file: App.jsx:67 ~ transfetSOL ~ transaction:", transaction);
      let txnHash = await connection.sendTransaction(transaction, [keyPair]);
      await connection.confirmTransaction(txnHash);
      console.log("🦀 ~ file: App.jsx:58 ~ transfetSOL ~ txnHash:", txnHash);
      setSuccess(true);
    } catch (error) {
      setSuccess(false);
    }
  };
  return (
    <>
      <ButtonGroup flexDirection="column">
        {!success && (
          <>
            <Button colorScheme="telegram" variant="outline" onClick={handelCreateAccountClick} margin="2">
              Create a new Solana account
            </Button>
            <Button colorScheme="telegram" variant="outline" onClick={connectToWallet} margin="2">
              Connect to Phantom Wallet
            </Button>
          </>
        )}
        <Button colorScheme="telegram" variant="outline" onClick={transfetSOL} margin="2" disabled={!!success}>
          {!success ? "Transfer to new wallet" : "Transfered SOL"}
        </Button>
      </ButtonGroup>
    </>
  );
}

export default App;
