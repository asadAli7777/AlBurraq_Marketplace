import {ethers} from 'ethers'
import { Routes,Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import CreateNft from './pages/CreateNft';
import CreateAuction from './pages/CreateAuction';
import Art from './pages/Art';
import AllAuctions from './pages/AllAuctions';
import SingleItem from './pages/SingleItem';
import SingleAuction from './pages/SingleAuction';
import Admin from './components/Admin';

import MarketplaceAbi from './contractsData/Marketplace.json'
import NFTAbi from './contractsData/NFT.json'
import MarketplaceAddress from "./contractsData/Marketplace-address.json"
import NFTAddress from './contractsData/NFT-address.json'
import Registration from './components/registration/Registration';

import {useDispatch} from "react-redux"
import { getaccount } from './features/account/accountSlice';
import { getmarketplace } from './features/marketplace/marketplaceSlice';
import { getnft } from './features/nft/nftSlice';

function App() {
  const dispatch = useDispatch()

  // // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    dispatch(getaccount(accounts[0]))

    // Get provider from Metamask
    const _provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = _provider.getSigner();

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
    dispatch(getaccount(accounts[0]))
      await web3Handler()
    })
    loadContracts(signer)
  }
  
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    dispatch(getmarketplace(marketplace))
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    dispatch(getnft(nft))
  }

  return (
    <div className="App">
    <Navbar web3Handler={web3Handler}/>
    <Routes>
      <Route path="/" element={ <Home/>}></Route> 
      <Route path="/create_nft" element={<CreateNft/>}></Route>
      <Route path="/create_auction" element={<CreateAuction/>}></Route>
      <Route path="/all_nfts" element={<Art />}></Route>
      <Route path="/all_auctions" element={<AllAuctions/>}></Route>
      <Route path="/singleItem" element={<SingleItem/>}></Route>
      <Route path="/singleAuction" element={<SingleAuction/>}></Route>
      <Route path="/registration" element={<Registration/>}></Route>
      <Route path="/admin" element={<Admin/>}></Route>
      
    </Routes>
    <Footer/>

    </div>
  );
}

export default App;
