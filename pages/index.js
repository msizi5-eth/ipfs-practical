import { Contract, providers, utils } from 'ethers';
import Head from 'next/head'
import React, { useEffect, useState, useRef } from 'react'
import '../styles/Home.module.css'
import Web3Modal from "web3modal"
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/index"

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef();

  const publicMint = async () => {
    try {
      console.log("Public mint");
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01")
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a LW3P");
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _tokenIds = await nftContract.tokenIds();
      console.log("tokenIds", _tokenIds);
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false
      });

      connectWallet();
      getTokenIdsMinted();

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className="button">
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return <button className='button'>Loading...</button>
    }

    return (
      <button className='button' onClick={publicMint}>
        Public Mint 🚀
      </button>
    )
  }

  return (
    <div>
      <Head>
        <title>
          LW3Punks
        </title>
        <meta name='description' content='LW3Punks-Dapp' />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='main'>
        <div>
          <h1 className='title'>Welcome to LW3P</h1>
          <div className='description'>
            Its an NFT collection for LearnWeb3 students.
          </div>
          <div className='description'>
            {tokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className='image' src='./LW3punks/1.png' />
        </div>
      </div>
      <footer className="footer">
        Made with &#10084; by LW3P
      </footer>
    </div>
  )
}
