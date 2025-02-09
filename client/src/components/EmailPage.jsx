import React, { useState } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import { getUser, register } from '../services/api.services';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { emailPageEligibleAtom, mapPageEligibleAtom, occurenceAtom } from '../recoil/atom';


function EmailPage() {
  const setEmailPageEligible = useSetRecoilState(emailPageEligibleAtom);
  const setMapPageEligible = useSetRecoilState(mapPageEligibleAtom);
  const [ occurence, setOccurence ] = useRecoilState(occurenceAtom);
  const [email, setEmail] = useState("");
  const [isEligible, setIsEligible] = useState(null);

  async function checkUser() {

    if(email === "") return

    try {
      let response = await getUser(email)
      console.log(response);
      
      if(!response.data) {
        const responseRegister = await register(email)

        response = await getUser(email);

      }

      if (response.data.occurence <=5 ) {
        setIsEligible(true)
        setOccurence(response.data.occurence);
      } else {
        setIsEligible(false)
      }

    } catch (error) {
      console.log("Error in checking user.", error);
      alert("Error, Please try again.")
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
        className='w-full p-2 rounded-2xl border'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
        <button className='bg-green-500 w-full p-2 rounded-2xl text-white font-semibold'
        onClick={checkUser}
        >Start</button>
        {isEligible !== null && <div>
          {occurence && <div>
            You have {occurence} occurences.
          </div> }
          {!isEligible ? <button className='bg-red-400 w-full p-2 rounded-2xl text-white font-semibold'>
            Buy Credits
          </button> : <button className='bg-green-500 w-full p-2 rounded-2xl text-white font-semibold'
          onClick={handleContinue}
          >Continue</button> }
          </div>}
        <p className='text-gray-500 text-sm mt-5'>DoWell UX Living Lab</p>
    </div>
  )
}

export default EmailPage