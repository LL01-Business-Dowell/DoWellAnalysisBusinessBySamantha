import React, { useState } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import DowellLogo from "../assets/dowell.png"
import { analysisBodyAtom, analysisDataAtom, analysisPageEligibleAtom, mapPageEligibleAtom } from '../recoil/atom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Loader2, RotateCw } from 'lucide-react';
import { analysis } from '../services/api.services';
import MapComponent from './MapComponent';
import toast from 'react-hot-toast';

function MapLinkPage() {
  const setAnalysisPageEligible = useSetRecoilState(analysisPageEligibleAtom);
  const setMapPageEligible = useSetRecoilState(mapPageEligibleAtom);
  const [mapLink, setMapLink] = useState("");
  const [isMapLinkSubmitted, setIsMapLinkSubmitted] = useState(false);
  const setAnalysisBody = useSetRecoilState(analysisBodyAtom);
  const [analysisData, setAnalysisData] = useRecoilState(analysisDataAtom);
  const [isLoading, setIsLoading] = useState(false);

  async function handleMapSubmit() {

    if(mapLink === "") {
      toast.error("Map Link is required.")
      return
    }
    try {
      setIsLoading(true)
      const response = await analysis({
        google_link: mapLink,
      });
      setAnalysisData(response.response)
      setIsMapLinkSubmitted(true)
      
    } catch (error) {
      alert("Please try again later.")
      console.error(error);
      
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    setAnalysisBody({
      google_link: mapLink,
    })
    setMapPageEligible(false)
    setAnalysisPageEligible(true)
  }

  return (
    <div
    className='relative flex flex-col justify-between h-full min-h-[640px] p-3'
    >
        <RotateCw
        size={20}
        className='absolute top-2 right-8 p-1 bg-green-500 rounded-full'
        onClick={() => window.location.reload()}
        />
        <div className='flex flex-col p-5 pl-25'>
            <p>Hi, I am Samanta from DoWell UX Living Lab</p>
            <p className='mt-10'>I am happy to visit you.. Share me your Google Map link </p>
            <div className='flex w-full justify-between text-sm text-blue-500'>
              <button
              onClick={() => {
                setMapLink("")
              }}
              >Clear</button>
              <button
              onClick={async() => {
                try {
                  const text = await navigator.clipboard.readText();
                  setMapLink(text);
                } catch (err) {
                  console.error("Failed to read clipboard: ", err);
                }
              }}
              >Paste</button>
            </div>
            <input type="text" className='p-2 w-full border rounded-2xl mb-2'
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            />
            {!analysisData && <button className='flex justify-center bg-green-500 p-2 rounded-2xl w-full disabled:cursor-not-allowed'
            disabled={isLoading}
            onClick={handleMapSubmit}
            >Visit {isLoading && <Loader2 className='animate-spin'/>} </button>}
            { analysisData &&
              <>
                <div className='border rounded-2xl w-full h-full overflow-hidden min-h-60 min-w-50'>
                  {analysisData && <MapComponent lat={analysisData.latitude} lng={analysisData.longitude}/>}
                </div>
                <button
                className='bg-green-500 p-2 rounded-2xl w-full mt-2'
                onClick={handleSubmit}
                >Continue</button>
              </>
            }
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