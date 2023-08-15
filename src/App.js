import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Web3 from "web3";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [connectedAddress, setconnectedAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [totalSupply, settotalSupply] = useState();
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: true,
    ABI: [],
  });
  const connectWallet = async () => {
    let chain_id = CONFIG.NETWORK.ID;
    if (window.ethereum) {
      try {
        // Connect using Web3 provider
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        // Create an ethers provider from the Web3 provider
        const provider = web3.eth.currentProvider;
        provider.on("accountsChanged", (accounts) => {
          console.log(accounts);
          window.location.reload();
        });

        // Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
          console.log(chainId);
          window.location.reload();
        });

        // Subscribe to provider connection
        provider.on("connect", (info) => {
          console.log(info);
          //window.location.reload();
        });

        // Subscribe to provider disconnection
        provider.on("disconnect", (error) => {
          console.log(error);
          //window.location.reload();
        });
        // Get the signer (account) from the provider
        // const signer = provider.getSigner();
        if (provider.isMetamask) {
          web3.eth.net.getId().then((result) => {
            console.log("Network id: " + result);
            if (parseInt(result) != parseInt(chain_id)) {
              //result !== 1
              //alert("Wrong Network Selected. Select Goerli Test Network and Refresh Page");
              try {
                window.ethereum.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: web3.utils.toHex(chain_id) }],
                });
              } catch (e) {
                alert(
                  "Error in Switching Chain, Make Sure you have added Ethereum chain in your web3 wallet."
                );
                // toast.error("Error in Switching Chain, Make Sure you have added Polygon chain in your web3 wallet.");
                window.location.reload();
              }
            }
          });
        } else {
          console.log("Not Metamask");
        }

        let accounts = await web3.eth.getAccounts();
        console.log(accounts[0]);
        setconnectedAddress(accounts[0]);
        setIsWalletConnected(true);
        await fetch_data();
        //handleClose();
      } catch (error) {
        console.log("Error: " + error);
        alert("Error connecting to wallet:", error);
      }
    } else {
      alert("Web3 Not Found. Try refreshing if you have metamask installed.");
    }
  };
  // const claimNFTs = () => {
  //   let cost = CONFIG.WEI_COST;
  //   let gasLimit = CONFIG.GAS_LIMIT;
  //   let totalCostWei = String(cost * mintAmount);
  //   let totalGasLimit = String(gasLimit * mintAmount);
  //   console.log("Cost: ", totalCostWei);
  //   console.log("Gas limit: ", totalGasLimit);
  //   setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
  //   setClaimingNft(true);
  //   blockchain.smartContract.methods
  //     .mint(mintAmount)
  //     .send({
  //       gasLimit: String(totalGasLimit),
  //       to: CONFIG.CONTRACT_ADDRESS,
  //       from: blockchain.account,
  //       value: totalCostWei,
  //     })
  //     .once("error", (err) => {
  //       console.log(err);
  //       setFeedback("Sorry, something went wrong please try again later.");
  //       setClaimingNft(false);
  //     })
  //     .then((receipt) => {
  //       console.log(receipt);
  //       setFeedback(
  //         `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
  //       );
  //       setClaimingNft(false);
  //       dispatch(fetchData(blockchain.account));
  //     });
  // };
  async function claimNFTs() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      let newprice = CONFIG.WEI_COST;
      let contract_abi = CONFIG.ABI;
      let contract_address = CONFIG.CONTRACT_ADDRESS;
      let mintValue = mintAmount;

      const contract = new web3.eth.Contract(contract_abi, contract_address);

      const addresses = await web3.eth.getAccounts();
      const address = addresses[0];
      console.log("addresses[0]: " + addresses[0]);

      let price = parseInt(newprice) * parseInt(mintValue);
      //price = Math.round(price * 100) / 100;
      console.log("Price: " + price + "  .........   " + mintValue);
      //   price =0.006;
      try {
        const estemated_Gas = await contract.methods
          .preSalemint(mintValue.toString())
          .estimateGas({
            from: address,
            value: price.toString(),
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
          });
        console.log(estemated_Gas);
        const result = await contract.methods
          .preSalemint(mintValue.toString())
          .send({
            from: address,
            value: price.toString(),
            gas: estemated_Gas,
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
          });
        alert("Mint Successful.");
      } catch (e) {
        show_error_alert(e);
      }

      // await contract.methods.tokenByIndex(i).call();
    } else {
      alert("Web3 Not Found. Try refreshing if you have metamask installed.");
    }
  }
  async function fetch_data() {
    let contract_abi = CONFIG.ABI;
    let contract_address = CONFIG.CONTRACT_ADDRESS;

    //console.log(contract_abi);

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    //await Web3.givenProvider.enable()

    contract.methods.totalSupply().call((err, result) => {
      console.log("error: " + err);
      if (result != null) {
        console.log("Total Supply: " + result);
        settotalSupply(result);
      }
    });
    // contract.methods.maxSupply().call((err, result) => {
    //   console.log("error: " + err);
    //   if (result != null) {
    //     setMaxSupply(result);
    //   }
    // });
  }
  async function show_error_alert(error) {
    let temp_error = error.message.toString();
    console.log(temp_error);
    let error_list = [
      "The contract is paused!",
      "Sale is paused!",
      "Minimum 1 NFT has to be minted per transaction",
      "Sold out",
      "Please send correct amount.",

      "It's not time yet",
      "Sent Amount Wrong",
      "Max Supply Reached",
      "You have already Claimed Free Nft.",
      "Presale have not started yet.",
      "Presale Ended.",
      "You are not Whitelisted.",
      "Sent Amount Not Enough",
      "Max 20 Allowed.",
      "insufficient funds",
      "Exceeding Per Tx Limit",
      "mint at least one token",
      "incorrect ether amount",
      "Presale Ended.",
      "Sale is Paused.",
      "You are not whitelisted",
      "Invalid Voucher. Try Again.",
      "Max Supply Reached.",
      "Public sale is not started",
      "Needs to send more eth",
      "Public Sale Not Started Yet!",
      "Exceed max adoption amount",
      "Private Sale Not Started Yet!",
      "Exceed max minting amount",
    ];

    for (let i = 0; i < error_list.length; i++) {
      if (temp_error.includes(error_list[i])) {
        // set ("Transcation Failed")
        alert(error_list[i]);
      }
    }
  }
  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        {/* <StyledLogo alt={"logo"} src={"/config/images/logo.png"} /> */}
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.png"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            {/* {isWalletConnected && (
              <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 50,
                  fontWeight: "bold",
                  color: "var(--accent-text)",
                }}
              >
                {totalSupply} / {CONFIG.MAX_SUPPLY}
              </s.TextTitle>
            )} */}

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />

            <>
              <s.TextTitle
                style={{ textAlign: "center", color: "var(--accent-text)" }}
              >
                1 NFT costs {CONFIG.DISPLAY_COST} {CONFIG.NETWORK.SYMBOL}.
              </s.TextTitle>
              <s.SpacerXSmall />
              <s.TextDescription
                style={{ textAlign: "center", color: "var(--accent-text)" }}
              >
                Excluding gas fees.
              </s.TextDescription>
              <s.SpacerSmall />

              <s.Container ai={"center"} jc={"center"}>
                <s.SpacerSmall />
                {!isWalletConnected && (
                  <StyledButton
                    onClick={(e) => {
                      connectWallet();
                    }}
                  >
                    CONNECT
                  </StyledButton>
                )}
                {isWalletConnected && (
                  <>
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        claimNFTs();
                      }}
                    >
                      Mint
                    </StyledButton>
                  </>
                )}
              </s.Container>
            </>

            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.png"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          {/* <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription> */}
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
