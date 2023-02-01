import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Link } from 'react-router-dom'
  
import MarketplaceAbi from '../../contractsData/Marketplace.json'
import NFTAbi from '../../contractsData/NFT.json'
import MarketplaceAddress from '../../contractsData/Marketplace-address.json'
import NFTAddress from '../../contractsData/NFT-address.json'
import { useSelector} from 'react-redux';
export default function AuctionsCards() {
  const account=useSelector((state) =>(state.account.value))
  const marketplace=useSelector((state) =>(state.marketplace.value))
  const nft=useSelector((state) =>(state.nft.value))
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [bidAmount, setBidAmount] = useState("");
    const [minBidInc,setMinBidInc] = useState("") 
       
    const loadMarketplaceItems = async () => {
      // Load all unsold items
      if (account === null) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, provider);
        nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, provider);
      }
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
        const biddingAmount = ethers.utils.parseEther(bidAmount) ;
        const totalBidAmount = Number(biddingAmount) + minBidInc ;
        console.log(totalBidAmount)
        await (await marketplace.placeBid(item.auctionId, { value: totalBidAmount.toString() })).wait()
        loadMarketplaceItems()
      } catch (error) {
        account === null ? setError("Please Connect MeataMask") : setError(error.data.message.slice(77));
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
        <section className="container">
            <div className="artWork">
                <div className="artWorkContent">
                    <h1 className="allHeadings">
                        Auctions
                    </h1>
                    <p className="allParagraphs">
                        Find a selection of the most sought-after digital art pieces, available for bidding. Don't miss your chance to own a piece of digital art history. Check out our current auctions and place your bid today.</p>
                </div>
                <div className="row artWorkCards">
                    {items.map((item, idx) => {
                        return (
                            <div key={idx} className="col-lg-3 p-0">
                                  {idx < 4 ? <div> <div className="m-2 card">
                                   
                        <Link to="/singleAuction" state = {item}>
                                        <img src={`https://asadkhan.infura-ipfs.io/ipfs/${item.image}`}  alt="" className="cardImage" />
                                        <h5 className='card-text'>{item.name}</h5>
                                        <div className="cardButton d-flex flex-row justify-content-between align-items-center">
                                            <p className="buttonText">
                                                Current Bid
                                            </p>
                                            <p className="buttonValue d-flex flex-row">
                                                <svg width="10" height="17" viewBox="0 0 10 17" fill="none" className="me-1"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M9.99671 8.58983L5 11.6463L0 8.58983L5 0L9.99671 8.58983ZM5 12.6278L0 9.57133L5 16.8635L10 9.57133L5 12.6278Z"
                                                        fill="#2E3880" />
                                                </svg>
                                                0.45 ETH
                                            </p>
                                        </div>
                                        </Link>
                                </div> </div> : "" }
                            </div>
                        )
                    })}



                </div>
                <div className="d-flex flex-row justify-content-end mt-5">
                    <a href="/#" className="viewAll">
                        <p>View all creator
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"
                                className="ms-2">
                                <path
                                    d="M9.30176 1.42822L10.3857 0.344238C10.8447 -0.114746 11.5869 -0.114746 12.041 0.344238L21.5332 9.83154C21.9922 10.2905 21.9922 11.0327 21.5332 11.4868L12.041 20.979C11.582 21.438 10.8398 21.438 10.3857 20.979L9.30176 19.895C8.83789 19.4312 8.84766 18.6743 9.32129 18.2202L15.2051 12.6147H1.17188C0.522461 12.6147 0 12.0923 0 11.4429V9.88037C0 9.23096 0.522461 8.7085 1.17188 8.7085H15.2051L9.32129 3.10303C8.84277 2.64893 8.83301 1.89209 9.30176 1.42822Z"
                                    fill="#000000" />
                            </svg>
                        </p>
                    </a>
                </div>
            </div>
        </section>
    </>
)
}
