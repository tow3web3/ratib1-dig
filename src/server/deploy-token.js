const {
  Connection,
  Keypair,
  SendTransactionError,
  VersionedTransaction,
} = require("@solana/web3.js");
const axios = require("axios");
const bs58 = require("bs58");
const FormData = require("form-data");

const RPC_ENDPOINT =
  "https://mainnet.helius-rpc.com/?api-key=5d031a52-84a2-45d0-b1d3-013db368e953";
const web3Connection = new Connection(RPC_ENDPOINT);

// Export function as CommonJS module
module.exports.default = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // For Express.js, we can directly access req.body
    const {
      imageUrl,
      name,
      symbol,
      description,
      mintSecretKey,
      mintPublicKey,
      walletSecretKey,
      walletPublicKey,
      solAmount,
      slippage,
      priorityFee,
      twitter,
      telegram,
      website,
    } = req.body;

    console.log("Request received for:", {
      name,
      symbol,
      mintPublicKey,
      walletPublicKey,
    });

    // Reconstruct keypairs from secret keys
    const mintKeypair = Keypair.fromSecretKey(bs58.decode(mintSecretKey));
    const walletKeypair = Keypair.fromSecretKey(bs58.decode(walletSecretKey));

    // Fetch image on the server side
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = imageResponse.data;

    // Create form data for metadata
    const formData = new FormData();
    formData.append("file", Buffer.from(imageBuffer), {
      filename: "image.png",
      contentType: "image/png",
    });
    formData.append("name", name);
    formData.append("symbol", symbol);
    formData.append("description", `${name} - ${description}`);
    formData.append("twitter", twitter || "");
    formData.append("telegram", telegram || "");
    formData.append("website", website || "");
    formData.append("showName", "true");

    // Create IPFS metadata storage
    const metadataResponse = await axios.post(
      "https://pump.fun/api/ipfs",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    const metadataResponseJSON = metadataResponse.data;
    console.log("metadataResponseJSON", metadataResponseJSON);

    console.log("walletPublicKey", walletPublicKey);


    console.log("solAmount", solAmount);
    // Get the local transaction
    const response = await axios.post(
      "https://pumpportal.fun/api/trade-local",
      {
        publicKey: walletPublicKey,
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        },
        mint: mintPublicKey,
        denominatedInSol: "true",
        amount: solAmount,
        slippage: slippage || 10,
        priorityFee: 0.0005,
        pool: "pump",
      },
      {
        responseType: "arraybuffer",
      }
    );

    console.log("response", response.data);

    const txData = response.data;
    const tx = VersionedTransaction.deserialize(new Uint8Array(txData));

    console.log("tx", tx);

    // Get latest blockhash
    const { blockhash } = await web3Connection.getLatestBlockhash();
    tx.message.recentBlockhash = blockhash;

    const simulation = await web3Connection.simulateTransaction(tx);
    console.log("simulation", simulation);

    {
      /*
     // Simulate transaction before sending
    try {
      const simulation = await web3Connection.simulateTransaction(tx);
      console.log("simulation", simulation);
      console.log(
        "Full simulation result:",
        JSON.stringify(simulation, null, 2)
      );

      if (simulation.value.err) {
        console.log("simulation.value.err", simulation.value.err);
        throw new Error(
          `Transaction simulation failed: ${JSON.stringify(
            simulation.value.err
          )}`
        );
      }
    } catch (err) {
      console.error("Simulation error:", JSON.stringify(err, null, 2));
      throw err;
    }
      */
    }

    // Sign and send transaction on the backend
    tx.sign([mintKeypair, walletKeypair]);

    try {
      const signature = await web3Connection.sendTransaction(tx);
      console.log("signature", signature);

      // Wait for confirmation with timeout
      let confirmation = null;
      const startTime = Date.now();
      while (Date.now() - startTime < 30000) {
        // 30 seconds timeout
        confirmation = await web3Connection.getSignatureStatus(signature);
        console.log("confirmation", confirmation);

        if (confirmation?.value?.confirmationStatus === "confirmed") {
          return res.status(200).json({
            signature,
            confirmed: true,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Check every second
      }

      // If we reach here, transaction wasn't confirmed in time
      return res.status(408).json({
        signature,
        confirmed: false,
        error: "Transaction confirmation timed out",
      });
    } catch (err) {
      if (err instanceof SendTransactionError) {
        console.error("Transaction logs:", err.logs);
      }
      throw err;
    }
  } catch (error) {
    console.error("Error in deploy-token API:", error);
    console.error(
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
