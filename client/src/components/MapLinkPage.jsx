import React, { useState } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import DowellLogo from "../assets/dowell.png"
import { analysisBodyAtom, analysisPageEligibleAtom, mapPageEligibleAtom } from '../recoil/atom';
import { useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';

function MapLinkPage() {
  const setAnalysisPageEligible = useSetRecoilState(analysisPageEligibleAtom);
  const setMapPageEligible = useSetRecoilState(mapPageEligibleAtom);
  const [mapLink, setMapLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("")
  const [isMapLinkSubmitted, setIsMapLinkSubmitted] = useState(false);
  const setAnalysisData = useSetRecoilState(analysisBodyAtom);

  function handleMapSubmit() {

    if(mapLink === "") {
      toast.error("Map Link is required.")
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
        <div className='flex flex-col p-5 pl-25'>
            <p>Hi, I am Samanta from DoWell UX Living Lab</p>
            <p className='mt-10'>I am happy to visit you.. Share me your Google Map link </p>
            <input type="text" className='p-2 w-full border rounded-2xl mb-2'
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
              <button className='bg-green-500 p-2 rounded-2xl w-full mt-2'
              onClick={handleSubmit}
              >Visit</button>
            </div> }
        </div>
        <div className='relative flex pr-8 pb-0 overflow-hidden'>
          <div className='flex-grow'>
              <p className='absolute left-0 z-50 w-40'>Samanta will innovate your business from people's minds</p>
              <img src={DowellLogo} alt="Noo" className='absolute z-50 w-10 h-10 left-0 bottom-0' />
          </div>
          <img src={SamantaLogo} alt="" className="w-30 h-30 scale-180" />
        </div>
    </div>
  )
}

export default MapLinkPage