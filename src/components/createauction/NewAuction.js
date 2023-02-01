import React from 'react'
import { useEffect, useState } from 'react'
import { ethers } from "ethers"
import { create } from "ipfs-http-client";
import SpinnerExp from '../Spiner';
import { useSelector} from 'react-redux';


export default function NewAuction() {
    const account=useSelector((state) =>(state.account.value))
    const marketplace=useSelector((state) =>(state.marketplace.value))
    const nft=useSelector((state) =>(state.nft.value))
    const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [rarity, setRarity] = useState('')
  const [error, setError] = useState('Please Conecct MetaMask');
  const amount = 1; // amount of tokens created for auction 
  const [transactionState,setTransactionState] = useState(false);

  const projectId = "2HfX6IQOQGFnJDbdcqVZAwKVQ1Z";
  const projectSecret = "6e49faf03164af5553f9deb8da903a85";
  const authorization = "Basic " + btoa(projectId + ":" + projectSecret);
  const ipfs = create({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await ipfs.add(file)
        setImage(result.path)
      } catch (error) {
        alert("ipfs image upload error: check ypurn internet connection");
      }
    }
  }

  useEffect(() => {

  }, [])

  const createNFT = async (e) => {
    e.preventDefault();
    if (!image || !price || !name || !description || !account || amount === 0 || !rarity) {
      setError("Please Fill All The Fields");
      setTimeout(()=>{
        setError("");        
    },5000)
    }
    else {
      try {
        const regstration = await marketplace.registration(account);
        if (regstration === false) {
          alert(`"You Are Not Register Please Register YourSelf"`);
        } else {

          const result = await ipfs.add(JSON.stringify({ image, name, description, rarity, account }))
          mintThenList(result);
        }

      } catch (error) {
        console.log(error)
      }
    }

  }

  const mintThenList = async (result) => {
    try {
        setTransactionState(true);
      const uri = result.path;
      // mint nft 
      const _amount = amount.toString();
      await (await nft.mint(uri, _amount)).wait()
      // get tokenId of new nft 
      const id = await nft.tokenCount()
      // approve marketplace to spend nft
      await (await nft.setApprovalForAll(marketplace.address, true)).wait()
      // add nft to marketplace
      const _price = price.toString();
      const listingPrice = ethers.utils.parseEther(_price);
      // const _id = Number(id);
      await (await marketplace.createAuction(nft.address, id, listingPrice, _amount, duration)).wait();
      setTransactionState(false)
      alert("Congratulations! you have created your Auction successfully")

    } catch (error) {
        setTransactionState(false)
      alert(error.data);
    }
  
  }
  return (
    <>
 <section className="container">
        <div className="row createPage">
        {transactionState ? <SpinnerExp /> :<div className="col-lg-6 offset-lg-3">
                <form className="createPageForm">
                    {console.log("Account",account)}
                    <h3>Create New Auction</h3>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label pageSubHeading">Image, Video, Audio, or 3D Model
                            <span>*</span></label>
                        <p className="description">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB,
                            GLTF. Max size 100MB
                        </p>
                        <div className="selectImage d-flex flex-row justify-content-center align-items-center">
                            <input type="file" name="" id="" required onChange={uploadToIPFS}/>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label pageSubHeading">Name <span>*</span></label>
                        <input type="text"onChange={(e) => setName(e.target.value)} className="form-control" id="name" placeholder="Name" required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="Description" className="form-label pageSubHeading">Description <span>*</span></label>
                        <input type="text" onChange={(e) => setDescription(e.target.value)} className="form-control" id="name" placeholder="Description" required/>
                    </div>
                    

                    <div className="mb-3">
                        <label htmlFor="Rarity" className="form-label pageSubHeading">Rarity <span>*</span></label>
                        <input type="text" onChange={(e) => setRarity(e.target.value)} className="form-control" id="name" placeholder="Rarity" required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="" className="form-label pageSubHeading">Price <span>*</span></label>
                        <input type="number" onChange={(e) => setPrice(e.target.value)} className="form-control" id="name" placeholder="Price in Eth" required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="" className="form-label pageSubHeading">End Time <span>*</span></label>
                        <input type="number" onChange={(e) => setDuration(e.target.value)} className="form-control" id="name" placeholder="Duration In Seconds" required/>
                    </div>
                   


                    {/* <!-- Start Properties Modal --> */}
                    {/* <!-- End Properties Modal --> */}
                  
                    {/* <!-- Start Levels Modal --> */}
                    {/* <!-- End Levels Modal --> */}
                   
                    {/* <!-- Start Stats Modal --> */}
                    {/* <!-- End Stats Modal --> */}
                    
                    {/* <div className="d-flex flex-row justify-content-between pb-3 mt-3 border-bottom">
                        <div className="d-flex flex-row justify-content-between">
                            <div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.25 21L12 3L21.75 21H2.25Z" stroke="#2e3880" strokeWidth="1.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.75 13.071H12.25V18.5085" stroke="#2e3880" strokeWidth="1.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                    <path
                                        d="M11.9688 8.85229C11.7277 8.85229 11.4921 8.92377 11.2917 9.05769C11.0912 9.19161 10.935 9.38195 10.8428 9.60465C10.7505 9.82735 10.7264 10.0724 10.7734 10.3088C10.8204 10.5452 10.9365 10.7624 11.107 10.9328C11.2774 11.1033 11.4946 11.2194 11.731 11.2664C11.9674 11.3134 12.2125 11.2893 12.4352 11.197C12.6578 11.1048 12.8482 10.9486 12.9821 10.7482C13.116 10.5477 13.1875 10.3121 13.1875 10.071C13.1875 9.74782 13.0591 9.43782 12.8305 9.20926C12.602 8.9807 12.292 8.85229 11.9688 8.85229V8.85229Z"
                                        fill="#2e3880" />
                                </svg>
                            </div>
                            <div className="ms-3 assetsDetails">
                                <label htmlFor="collection" className="form-label pageSubHeading">Explicit & Sensitive
                                    Content</label>
                                <p>Set this item as explicit and sensitive content</p>
                            </div>
                        </div>
                        <div className="d-flex flex-row align-items-center justify-content-center">
                            <label className="switch">
                                <input type="checkbox"/>
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div> */}
                    {/* <div className="my-3">
                        <label className="form-label pageSubHeading">Supply</label>
                        <p className="description">The number of copies that can be minted. No gas cost to you! Quantities
                            above one coming soon.
                            <span>
                                <svg width="25" height="25" viewBox="0 0 25 25" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12.281 3.75854C7.51804 3.75854 3.65601 7.62058 3.65601 12.3835C3.65601 17.1465 7.51804 21.0085 12.281 21.0085C17.044 21.0085 20.906 17.1465 20.906 12.3835C20.906 7.62058 17.044 3.75854 12.281 3.75854Z"
                                        stroke="#707A83" strokeWidth="1.5" strokeMiterlimit="10" />
                                    <path d="M10.9685 11.071H12.4685V16.5085" stroke="#707A83" strokeWidth="1.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.406 16.696H14.531" stroke="#707A83" strokeWidth="1.5"
                                        strokeMiterlimit="10" strokeLinecap="round" />
                                    <path
                                        d="M12.281 6.85229C12.04 6.85229 11.8043 6.92377 11.6039 7.05769C11.4035 7.19161 11.2473 7.38195 11.155 7.60465C11.0628 7.82735 11.0386 8.0724 11.0857 8.30882C11.1327 8.54523 11.2488 8.76239 11.4192 8.93284C11.5897 9.10328 11.8068 9.21936 12.0432 9.26638C12.2797 9.31341 12.5247 9.28928 12.7474 9.19703C12.9701 9.10479 13.1604 8.94857 13.2944 8.74815C13.4283 8.54773 13.4998 8.3121 13.4998 8.07105C13.4998 7.74782 13.3714 7.43782 13.1428 7.20926C12.9142 6.9807 12.6042 6.85229 12.281 6.85229V6.85229Z"
                                        fill="#707A83" />
                                </svg>
                            </span>
                        </p>
                        <input type="email" className="form-control" id="externalLink" placeholder="1" required/>
                    </div> */}
                    {/* <div className="mb-3">
                        <label htmlFor="collection" className="form-label pageSubHeading">Blockchain</label>
                        <select className="form-select" aria-label="Default select example">
                            <option selected>Ethereum</option>
                            <option value="1">Polygon</option>
                        </select>
                    </div> */}
                    {/* <div className="pb-5 border-bottom">
                        <label className="form-label pageSubHeading">
                            Freeze metadata
                            <span href="#" data-toggle="tooltip" data-placement="top"
                                title="Once locked, your content cannot be edited or removed as it is permanently stored in decentralized file storage, which will be accessible for other clients to view and use.">
                                <svg width="25" height="25" viewBox="0 0 25 25" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12.281 3.75854C7.51804 3.75854 3.65601 7.62058 3.65601 12.3835C3.65601 17.1465 7.51804 21.0085 12.281 21.0085C17.044 21.0085 20.906 17.1465 20.906 12.3835C20.906 7.62058 17.044 3.75854 12.281 3.75854Z"
                                        stroke="#707A83" strokeWidth="1.5" strokeMiterlimit="10" />
                                    <path d="M10.9685 11.071H12.4685V16.5085" stroke="#707A83" strokeWidth="1.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.406 16.696H14.531" stroke="#707A83" strokeWidth="1.5"
                                        strokeMiterlimit="10" strokeLinecap="round" />
                                    <path
                                        d="M12.281 6.85229C12.04 6.85229 11.8043 6.92377 11.6039 7.05769C11.4035 7.19161 11.2473 7.38195 11.155 7.60465C11.0628 7.82735 11.0386 8.0724 11.0857 8.30882C11.1327 8.54523 11.2488 8.76239 11.4192 8.93284C11.5897 9.10328 11.8068 9.21936 12.0432 9.26638C12.2797 9.31341 12.5247 9.28928 12.7474 9.19703C12.9701 9.10479 13.1604 8.94857 13.2944 8.74815C13.4283 8.54773 13.4998 8.3121 13.4998 8.07105C13.4998 7.74782 13.3714 7.43782 13.1428 7.20926C12.9142 6.9807 12.6042 6.85229 12.281 6.85229V6.85229Z"
                                        fill="#707A83" />
                                </svg>
                            </span>
                        </label>
                        <p className="description">Freezing your metadata will allow you to permanently lock and store all
                            of this item's content in decentralized file storage.</p>
                        <input type="email" className="form-control"
                            placeholder="To freeze your metadata, you must create your item first."/>
                    </div> */}
                    <button onClick={createNFT} className="submitButton">
                        Create Auction
                    </button>
                </form>
            </div>}
        </div>
    </section>
    </>
  )
}
