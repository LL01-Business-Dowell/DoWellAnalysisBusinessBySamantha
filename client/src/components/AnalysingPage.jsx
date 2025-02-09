import React, { useEffect, useState } from 'react'
import MapComponent from './MapComponent'
import SamantaLogo from "../assets/samanta.svg"
import { analysis } from '../services/api.services'
import { useRecoilValue } from 'recoil'
import { analysisBodyAtom } from '../recoil/atom'

function AnalysingPage() {

    const analysisBody = useRecoilValue(analysisBodyAtom);
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
      
        async function analyze() {
            try {
                const response = await analysis(analysisBody);

                setIsAnalysisComplete(true)

            } catch (error) {
                alert("Error, Please try again later.")

            }
        }

    }, [])
    

  return (
    <div className='flex flex-col justify-between w-full h-full min-h-[640px]'>
        <div className='flex flex-col space-y-3 px-15'>
            <p>Analysing your business...</p>
            <div className='border rounded-2xl w-full h-full overflow-hidden min-h-60'>
                <MapComponent lat={12.222} lng={34.4334}/>
            </div>
        </div>
        {isAnalysisComplete && <div className='flex flex-col'>
            <p>Share your email to send report.</p>    
            <input type="text" className='p-2 w-full border rounded-2xl'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <button
            className='bg-green-500 p-2 rounded-2xl w-full'
            >Send</button>
        </div>}
        <div className='flex'>
            <div>
                <p>Samanta will innovate your business from people's minds</p>
            </div>
            <img src={SamantaLogo} alt="" className="w-30 h-30 object-contain" />
        </div>
    </div>
  )
}

export default AnalysingPage