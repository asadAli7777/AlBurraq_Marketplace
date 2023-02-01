import React from 'react'
import {Link ,useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import AlertMessage from '../AlertMessage'
import SpinnerExp from '../Spiner'
import { useSelector} from 'react-redux';

export default function SingleAuctionCard() {
  const account=useSelector((state) =>(state.account.value))
  const marketplace=useSelector((state) =>(state.marketplace.value))
  const nft=useSelector((state) =>(state.nft.value))
  console.log(AlertMessage)
  const location = useLocation();
  const auctionedItem = location.state;
  console.log(auctionedItem)
    
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [minBidInc,setMinBidInc] = useState("")
  const [transactionState,setTransactionState] = useState(false);
     
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    // if (account === null) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, provider);
    //   nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, provider);
    // }
    const itemCount = await marketplace.auctionCount()
    const minBiddIncrement = await marketplace.minBidIncrement();
    const _minBiddIncrementInNumber = Number(minBiddIncrement);
    setMinBidInc(_minBiddIncrementInNumber);

    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.auctions(i);
      const auctionEndTime = Number(item.endTime);
      const date = new Date(auctionEndTime * 1000);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const month = date.getMonth();
      const curentTime = Date.now() / 1000;

      if (!item.sold && auctionEndTime > curentTime) {
        // get uri url from nft contract

        const uri = await nft.uri(item.tokenId);
        //  https://asadkhan.infura-ipfs.io

        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(`https://asadkhan.infura-ipfs.io/ipfs/${uri}`)
        const metadata = await response.json();

        // get total price of item (item price + fee) anf=d other data from marketplace contarct
        const _pricePlusFee = await item.pricePlusFee;
        const eth_pricePlusFee = ethers.utils.formatEther(_pricePlusFee);
        const bidInfo = await marketplace.bids(i);
        const highestBidd = await bidInfo.highestBid;
        const eth_highestBid = ethers.utils.formatEther(highestBidd)
        const highestBidder = await bidInfo.highestbidder;

        // Add item to items array
        items.push({
          eth_pricePlusFee,
          auctionId: item.auctionId,
          tokenId: Number(item.tokenId),
          creater: item.creater,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          amount: Number(item.amount),
          EndTime: Number(item.endTime),
          eth_highestBid,
          highestBidder,
          hours,
          minutes,
          month,
          itemRarity: metadata.rarity
        })
      }   
    }
    setLoading(false)
    setItems(items)

  }

  const placeBidd = async (item) => {
    try {
      setTransactionState(true)
      const biddingAmount = ethers.utils.parseEther(bidAmount) ;
      const totalBidAmount = Number(biddingAmount) + minBidInc ;
      await (await marketplace.placeBid(item.auctionId, { value: totalBidAmount.toString() })).wait()
      setTransactionState(false)

      await loadMarketplaceItems()
    } catch (error) {
      setTransactionState(false)
      account === null ? setError("Please Connect MeataMask") : setError(error.error.data.message.slice(77));
      setTimeout(() => {
        setError("");
      }, 5000)
    }

  }

  useEffect(() => {
    loadMarketplaceItems();
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

    return (
        <>
            <div className='container pt-5'>
            {transactionState ?  <div className="row artWorkCards justify-content-between single mt-5 pt-5"> <SpinnerExp /> </div> :  <div className="row artWorkCards justify-content-between single mt-5 pt-5">
                {error && <AlertMessage message={error} />}
                    <div className="col-md-5 col-12 my-3">
                        <img className="rounded" style={{ width: "100%", height: "auto" }}
                            src={`https://asadkhan.infura-ipfs.io/ipfs/${auctionedItem.image}`}alt="" />
                    </div>
                    <div className="col-md-6 col-12 p-3 d-flex flex-column justify-content-center">
                        <h5 className='card-text'>ID : <span className="buttonText">{auctionedItem.tokenId}</span></h5>
                        <h5 className='card-text'>Name : <span className="buttonText">{auctionedItem.name}</span></h5>
                        <h5 className='card-text'>Description : <span className="buttonText">{auctionedItem.description}</span></h5>
                        <h5 className='card-text'>Rarity : <span className="buttonText">{auctionedItem.itemRarity}</span></h5>
                        <h5 className='card-text'>Basic Price : <span className="buttonText">{auctionedItem.eth_pricePlusFee} <svg width="10" height="17" viewBox="0 0 10 17" fill="none" className="me-1"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.99671 8.58983L5 11.6463L0 8.58983L5 0L9.99671 8.58983ZM5 12.6278L0 9.57133L5 16.8635L10 9.57133L5 12.6278Z"
                                fill="#2E3880" />
                        </svg> </span></h5>
                        <h5 className='card-text'>Creator : <span className="buttonText">{auctionedItem.creater.slice(0, 10) + '......' + auctionedItem.creater.slice(35, 42)}</span></h5>
                        <h5 className='card-text'>Highest Bidder : <span className="buttonText">{`${auctionedItem.highestBidder.slice(0, 10) + '......' + auctionedItem.highestBidder.slice(35, 42)}`}</span></h5>
                        <h5 className='card-text'>Highest Bidd : <span className="buttonText">{auctionedItem.highestBidder === 0x0000000000000000000000000000000000000000 ? "No Bidd Yet" : `${auctionedItem.eth_highestBid}`}</span></h5>
                        <h5 className='card-text'>Auction End Time : <span className="buttonText">{auctionedItem.hours}:{auctionedItem.minutes}{auctionedItem.hours > 12 ? "PM" : "AM"}</span></h5>
                        <div class="input-group mb-3">
                            <input type="number" onChange={(e) => setBidAmount(e.target.value)} class="form-control" placeholder="Enter Quantity" aria-label="Username" aria-describedby="basic-addon1" />
                        </div>
                        <button type="button" onClick={() => placeBidd(auctionedItem)} class="btn btn-primary btn-lg btn-block w-100 my-2" >Bid Now</button>
                        
                        <Link to="/">
                        <button type="button" class="btn btn-primary btn-lg btn-block w-100">Back to Auctions</button>
                        </Link>
                        
                    </div>
                </div>}
            </div>
        </>
    )
}