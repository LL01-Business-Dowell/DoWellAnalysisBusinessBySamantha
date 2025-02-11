import React, { useState } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import { getUser, register } from '../services/api.services';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { emailPageEligibleAtom, mapPageEligibleAtom, occurenceAtom, userEmailAtom } from '../recoil/atom';
import { Loader2 } from 'lucide-react';


function EmailPage() {
  const setUserEmail = useSetRecoilState(userEmailAtom);
  const setEmailPageEligible = useSetRecoilState(emailPageEligibleAtom);
  const setMapPageEligible = useSetRecoilState(mapPageEligibleAtom);
  const [ occurence, setOccurence ] = useRecoilState(occurenceAtom);
  const [email, setEmail] = useState("");
  const [isEligible, setIsEligible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkUser() {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email is invalid.");
      return;
    }

    try {
      setIsLoading(true)
      let response = await getUser(email)
      console.log(response);
      
      if(response.occurrences == 0) {
        await register(email)
      }

      if (response.occurrences <=5 ) {
        setIsEligible(true)
        setOccurence(response.occurrences);
        setUserEmail(email);
      } else {
        setIsEligible(false)
      }

    } catch (error) {
      console.log("Error in checking user.", error);
      alert("Error, Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleContinue() {
    setEmailPageEligible(false)
    setMapPageEligible(true)
  }

  return (
    <div className='text-center p-10'>
        <img src={SamantaLogo}/>
        <p>Samanta can travel anywhere in the world digitally and collect data for analysis</p>
        <input type="text"
        className='w-full p-2 rounded-2xl border mb-2'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
        {isEligible === null && <button className='flex item-center  justify-center bg-green-500 w-full p-2 rounded-2xl text-white font-semibold'
        onClick={checkUser}
        >Start{isLoading && <Loader2 className='animate-spin'/>}</button>}
        
        {isEligible !== null && <div>
          {occurence !== undefined && occurence !== null && <div>
            You have {occurence} occurrences.
          </div> }
          {!isEligible ? <button className='bg-red-400 w-full p-2 rounded-2xl text-white font-semibold'>
            Contribute
          </button> : <button className='bg-green-500 w-full p-2 rounded-2xl text-white font-semibold'
          onClick={handleContinue}
          >Continue</button> }
          </div>}
        <p className='text-gray-500 text-sm mt-5'>DoWell UX Living Lab</p>
    </div>
  )
}

export default EmailPage