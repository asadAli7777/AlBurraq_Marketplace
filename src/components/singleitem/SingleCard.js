import React from 'react'
import {Link ,useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import AlertMessage from '../AlertMessage'
import SpinnerExp from '../Spiner'
import { useSelector} from 'react-redux';
export default function SingleCard() {
  const account=useSelector((state) =>(state.account.value))
  const marketplace=useSelector((state) =>(state.marketplace.value))
  const nft=useSelector((state) =>(state.nft.value))
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("1");
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [transactionState,setTransactionState] = useState(false);


    const location = useLocation();
    const listedItem = location.state;
  const loadMarketplaceItems = async () => {
    // Load all unsold items
   
    // if (account === null) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, provider);
    //   nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, provider);
    // }

    const itemCount = await marketplace.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i)
      const ammount = Number(item.amount);
      if (ammount >= 1) {
        // get uri url from nft contract
        const uri = await nft.uri(item.tokenId);

        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(`https://asadkhan.infura-ipfs.io/ipfs/${uri}`)
        const metadata = await response.json();


        // get total price of item (item price + fee)
        const _pricePlusFee = await item.pricePlusFee;
        const eth_pricePlusFee = ethers.utils.formatEther(_pricePlusFee);

        // Add item to items array
        items.push({

          eth_pricePlusFee,
          itemId: Number(item.itemId),
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          amount: Number(item.amount),
          tokenId: Number(item.tokenId),
          itemRarity: metadata.rarity
        })
      }
    }

    setLoading(false)
    setItems(items)

  } 
  const buyMarketItem = async (item) => {
    try {
       setTransactionState(true)
      const payableAmount = (ethers.utils.parseEther(item.eth_pricePlusFee) * amount).toString();
      await (await marketplace.purchaseItem(item.itemId, amount, nft.address, { value: payableAmount })).wait()
      setTransactionState(false)
      setError(`You Have Purchased ${amount} tokens of ID : ${item.tokenId}`);
      setTimeout(() => {
        setError("");
      }, 5000)
    } catch (error) {
      setTransactionState(false)
      account === null ? setError("Please Connect MeataMask") : setError(error.error.data.message.slice(77));
      console.log(error.error.data.message.slice(77))
      setTimeout(() => {
        setError(error.error.data.message.slice(77))
      }, 5000)
    }
  }
    
    return (<>  
            <div className='container pt-5'>
              {transactionState ?  <div className="row artWorkCards justify-content-between single mt-5 pt-5"> <SpinnerExp /> </div> :  <div className="row artWorkCards justify-content-between single mt-5 pt-5">
                  {error && <AlertMessage message={error} />}
                    <div className="col-md-5 col-12 my-3">
                        <img className="rounded" style={{ width: "100%", height: "auto" }}
                            src={`https://asadkhan.infura-ipfs.io/ipfs/${listedItem.image}`}alt="" />
                    </div>
                    <div className="col-md-6 col-12 p-3 d-flex flex-column justify-content-center">
                        <h5 className='card-text'>ID : <span className="buttonText">{listedItem.tokenId}</span></h5>
                        <h5 className='card-text'>Name : <span className="buttonText">{listedItem.name}</span></h5>
                        <h5 className='card-text'>Description : <span className="buttonText">{listedItem.description}</span></h5>
                        <h5 className='card-text'>Rarity : <span className="buttonText">{listedItem.itemRarity}</span></h5>
                        <h5 className='card-text'>Available Quantity : <span className="buttonText">{Number(listedItem.amount)}</span></h5>
                        <h5 className='card-text'>Price : <span className="buttonText">{listedItem.eth_pricePlusFee} <svg width="10" height="17" viewBox="0 0 10 17" fill="none" className="me-1"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9.99671 8.58983L5 11.6463L0 8.58983L5 0L9.99671 8.58983ZM5 12.6278L0 9.57133L5 16.8635L10 9.57133L5 12.6278Z"
                                fill="#2E3880" />
                        </svg> </span></h5>
                        <h5 className='card-text'>Owner : <span className="buttonText">{listedItem.seller.slice(0, 10) + '......' + listedItem.seller.slice(35, 42)}</span></h5>
                        <div className="input-group mb-3">
                            <input type="number" onChange={(e) => setAmount(e.target.value)}  className="form-control"  placeholder="Enter Quantity "  aria-label="Username" aria-describedby="basic-addon1" />
                        </div>
                        <button type="button"  onClick={() => buyMarketItem(listedItem)} className="btn btn-primary btn-lg btn-block w-100 my-2" >Buy Now</button>
                        <Link to="/">
                        <button type="button" className="btn btn-primary btn-lg btn-block w-100">Back</button>
                        </Link>
                        
                    </div>
                </div>}
                
            </div>
        </>
    )
}