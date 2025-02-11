import React, { useEffect, useState } from 'react'
import MapComponent from './MapComponent'
import SamantaLogo from "../assets/samanta.svg";
import DowellLogo from "../assets/dowell.png"
import { analysis, sowtAnalysis } from '../services/api.services'
import { useRecoilValue } from 'recoil'
import { analysisBodyAtom, occurenceAtom, userEmailAtom } from '../recoil/atom'
import { Loader2 } from 'lucide-react';

function AnalysingPage() {
    const occurrences = useRecoilValue(occurenceAtom);
    const userEmail = useRecoilValue(userEmailAtom);
    const analysisBody = useRecoilValue(analysisBodyAtom);
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(true);
    const [email, setEmail] = useState(userEmail);
    const [analysisData, setAnalysisData] = useState(null);
    const [isAnalysing, setIsAnalysing] = useState(true);
    const [swotAnalysisData, setSwotAnalysisData] = useState("");

    useEffect(() => {
      
        async function analyze() {
            try {
                setIsAnalysing(true)
                const response = await analysis(analysisBody);
                console.log(response);
                
                setAnalysisData(response.response)

                const swotResponse = await sowtAnalysis({
                    ...response.response,
                    email: userEmail,
                    rating: parseInt(response.response.rating, 10),
                    reviews: parseInt(response.response.reviews.match(/\d+/)[0], 10),
                    occurrences: occurrences
                })
                console.log(res);
                setSwotAnalysisData(swotResponse.response)
                setIsAnalysing(false)
                setIsAnalysisComplete(true)

            } catch (error) {
                alert("Error, Please try again later.")
                console.error("Error in analysing.", error);
            }
        }
        analyze()

    }, [])

    async function sendEmail() {
        
    }
    

  return (
    <div className='flex flex-col justify-between w-full h-full min-h-[640px]'>
        <div className='flex flex-col space-y-3 px-15'>
            {isAnalysing ? <p className='text-red-500 text-sm'>Analysing your business...{isAnalysing && <Loader2 size={12} className='animate-spin flex'/>}</p> : <p className='text-sm'>Report prepared.</p>}
            <div className='border rounded-2xl w-full h-full overflow-hidden min-h-60 min-w-50'>
                {analysisData && <MapComponent lat={analysisData.latitude} lng={analysisData.longitude}/>}
            </div>
        </div>
        {isAnalysisComplete && <div className='flex flex-col space-y-2'>
            <p>Share your email to send report.</p>    
            <input type="text" className='p-2 w-full border rounded-2xl'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <button
            className='bg-green-500 p-2 rounded-2xl w-full'
            onClick={sendEmail}
            >Send</button>
        </div>}
        <div className='relative flex pr-5 pb-5 overflow-hidden'>
            <div className='flex-grow'>
                <p className='absolute left-0 z-50 w-40'>Samanta will tell the story on analysed data</p>
                <img src={DowellLogo} alt="Noo" className='absolute z-50 w-10 h-10 left-0 bottom-5' />
            </div>
            <img src={SamantaLogo} alt="" className="w-30 h-30 scale-180" />
        </div>
    </div>
  )
}

export default AnalysingPage