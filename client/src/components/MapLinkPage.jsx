import React, { useState } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import { analysisBodyAtom, analysisPageEligibleAtom, mapPageEligibleAtom } from '../recoil/atom';
import { useSetRecoilState } from 'recoil';

function MapLinkPage() {
  const setAnalysisPageEligible = useSetRecoilState(analysisPageEligibleAtom);
  const setMapPageEligible = useSetRecoilState(mapPageEligibleAtom);
  const [mapLink, setMapLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("")
  const [isMapLinkSubmitted, setIsMapLinkSubmitted] = useState(false);
  const setAnalysisData = useSetRecoilState(analysisBodyAtom);

  function handleMapSubmit() {

    if(mapLink === "") {
      alert("Map Link is required.")
      return
    }

    setIsMapLinkSubmitted(true)
  }

  async function handleSubmit() {
    setAnalysisData({
      google_link: mapLink,
      website: websiteLink
    })
    setMapPageEligible(false)
    setAnalysisPageEligible(true)
  }

  return (
    <div
    className='flex flex-col justify-between h-full min-h-[640px] p-3'
    >
        <div className='flex flex-col p-10 pl-25'>
            <p>Hi, I am Samanta from DoWell UX Living Lab</p>
            <p className='mt-10'>I am happy to visit you.. Share me your Google Map link </p>
            <input type="text" className='p-2 w-full border rounded-2xl'
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            />
            {!isMapLinkSubmitted && <button className='bg-green-500 p-2 rounded-2xl w-full'
            onClick={handleMapSubmit}
            >Visit</button>}
            {isMapLinkSubmitted && <div className='mt-5'>
              <p className='text-red-500' >Visiting...</p>
              <p>Do you have website?</p>
              <input type="text" className='p-2 w-full border rounded-2xl'
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              />
              <button className='bg-green-500 p-2 rounded-2xl w-full'
              onClick={handleSubmit}
              >Visit</button>
            </div> }
        </div>
        <div className='flex'>
            <div>
                <p>Samanta will innovate your business from people’s minds</p>
            </div>
            <img src={SamantaLogo} alt="" className="w-30 h-30 object-contain" />
        </div>
    </div>
  )
}

export default MapLinkPage