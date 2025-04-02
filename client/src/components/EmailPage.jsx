/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import { getUser, register } from '../services/api.services';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { emailPageEligibleAtom, mapPageEligibleAtom, occurenceAtom, priceAtom, stripePaymentDataAtom, userEmailAtom } from '../recoil/atom';
import { Loader2, RotateCw, CheckCircle, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCountryAndCurrencyData, getPPP, getUserInfo } from '../services/utils';
import axios from 'axios';

function EmailPage() {
  const setUserEmail = useSetRecoilState(userEmailAtom);
  const setEmailPageEligible = useSetRecoilState(emailPageEligibleAtom);
  const setMapPageEligible = useSetRecoilState(mapPageEligibleAtom);
  const [occurence, setOccurence] = useRecoilState(occurenceAtom);
  const [email, setEmail] = useState("");
  const [isEligible, setIsEligible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [price,setPrice] = useRecoilState(priceAtom);
  const [paymentLink, setPaymentLink] = useRecoilState(stripePaymentDataAtom);

  useEffect(() => {
    // Show tooltip for 3 seconds when component mounts
    setShowTooltip(true);
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkUserCountryAndCurrency = async () => {
    try {
      // Get API data
      const apiData = await getCountryAndCurrencyData();
      
      // Get user info from IP
      const userInfo = await getUserInfo();
      
      // Check if user's country exists in the API data
      const matchedCountry = apiData.countries.find(
        (country) => country.toLowerCase() === userInfo.country.toLowerCase()
      );
      
      // Check if user's currency exists in the API data
      const matchedCurrency = apiData.currencies.find((currency) => {
        return (
          currency.toLowerCase().includes(userInfo.currency.toLowerCase()) ||
          (userInfo.currency_name &&
            currency
              .toLowerCase()
              .includes(userInfo.currency_name.toLowerCase()))
        );
      });
      
      if (matchedCountry && matchedCurrency) {
        return {
          success: true, 
          country: matchedCountry, 
          currency: matchedCurrency
        };
      } else {
        return {
          success: false, 
          country: null, 
          currency: null
        };
      }
    } catch (error) {
      console.error("Error checking user data:", error);
      return {
        success: false,
        country: null, 
        currency: null
      };
    }
  };

  const initializeStripePayment = async () => {
    try {
      // const userMatchData = await checkUserCountryAndCurrency();
      const userInfo = await getUserInfo();
      
      const paymentData = {
        callback_url: "https://dowellpay.online/thank-you",
        currency_code: userInfo.currency || "INR", // Fallback to INR if no currency found
        description: "Payment link for linkedin analyzer",
        price: parseFloat(price.replace(/[^\d.]/g, '')),
        product: "Samanta Linkedin Analyzer",
        timezone: userInfo.timeZone || "Asia/Kolkata"
      };

      const response = await axios.post(
        "https://100088.pythonanywhere.com/api/stripe/initialize", 
        paymentData
      );

      if (response.data.success) {
        setPaymentLink(response.data.approval_url);
        return response.data;
      } else {
        toast.error("Failed to initialize payment");
        return null;
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Error initializing payment");
      return null;
    }
  };

  async function checkUser() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email is invalid.");
      return;
    }

    try {
      setIsLoading(true)
      let response = await getUser(email)
      console.log(response);
      
      if(response.occurrences == 0) {
        await register(email)
      }

      if (response.occurrences <= 5) {
        setIsEligible(true)
        setOccurence(response.occurrences);
        setUserEmail(email);
        // Show payment popup after email verification
        setShowPaymentPopup(true);
        const userMatchData = await checkUserCountryAndCurrency();
        console.log("User country and currency match data:", userMatchData);

        if (userMatchData.success) {
          try{
            const res = await getPPP(
              {
                "base_currency": "British pound",
                "base_price": "15",
                "base_country": "United Kingdom",
                "target_country": userMatchData.country,
                "target_currency": userMatchData.currency
              }
            )
            setPrice(res.calculated_price_base_on_ppp)
          } catch(e){
            setPrice("5 GBP")
          }
        }
      } else {
        setIsEligible(false)
      }

    } catch (error) {
      console.log("Error in checking user.", error);
      toast.error(error.response.data.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  function handleContinue() {
    setEmailPageEligible(false)
    setMapPageEligible(true)
  }

  function handleCancel() {
    setShowPaymentPopup(false);
    setIsEligible(null);
    setEmail("");
  }

  function handlePrice() {
    // Redirect to pricing page
    window.open("https://dowellpay.online/analysis-by-samanta-ai/", "_blank");
  }

  function handleWebsite(){
    window.open("https://samanta.uk/", "_blank");
  }

  async function handleAgree() {
    const paymentInitResponse = await initializeStripePayment();
        if (!paymentInitResponse) {
          toast.error("Payment initialization failed");

        } else {
          setShowPaymentPopup(false);
          handleContinue();
        }
    
  }

  function openHelpVideo() {
    window.open("https://youtube.com/shorts/esuXEo8rulA?si=RT97O3t6An54ZLwV", "_blank");
  }

  return (
    <div className='relative text-center p-10'>
        <RotateCw
          size={20}
          className='absolute top-2 right-8 p-1 bg-green-500 rounded-full cursor-pointer'
          onClick={() => window.location.reload()}
        />
        <img src={SamantaLogo} alt="Samanta Logo" />
        <p>Samanta can travel anywhere in the world digitally and collect data for analysis</p>
        <input 
          type="text"
          className='w-full p-2 rounded-2xl border my-2'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isEligible === null && 
          <div className="relative flex items-center">
            <div className="relative mr-2">
              <button 
                className='flex items-center justify-center bg-yellow-400 p-1 rounded-full text-white'
                onClick={openHelpVideo}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={20} />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Help video
                </div>
              )}
            </div>
            <button 
              className='flex items-center justify-center bg-green-500 w-full p-2 rounded-2xl text-white font-semibold'
              onClick={checkUser}
            >
              Start {isLoading && <Loader2 className='ml-2 animate-spin'/>}
            </button>
          </div>
        }
        
        {isEligible !== null && !showPaymentPopup && 
          <div>
            {occurence !== undefined && occurence !== null && occurence !== 0 && 
              <div className="mb-2">
                You have {occurence} occurrences.
              </div>
            }
            {!isEligible ? 
              <button onClick= {handlePrice} className='bg-red-400 w-full p-2 rounded-2xl text-white font-semibold'>
                Contribute
              </button> 
              : 
              <button 
                className='bg-green-500 w-full p-2 rounded-2xl text-white font-semibold'
                onClick={handleContinue}
              >
                Continue
              </button>
            }
          </div>
        }

        {/* Enhanced Payment Popup */}
        {showPaymentPopup && 
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="bg-green-500 p-4 text-white">
                <h2 className="text-xl font-bold">Terms and Conditions</h2>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex flex-col items-center mb-4">
                <p className="text-gray-700">
                    To leverage the in-depth insights provided by Samanta Business Analysis, a fee is required. 
                    You will receive a detailed invoice and a secure payment link directly to your email, 
                    accompanied by your analysis report. 
                  </p>
                  <p className="text-red-700 font-bold">
                    Price for this report is {price} 
                  </p>
                  <p className="text-gray-700">
                    Your agreement is required to continue.
                  </p>
                </div>
                
                {/* Footer with gradient buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
                  <button 
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center"
                    onClick={handleCancel}
                  >
                    <X size={16} className="mr-1" />
                    Cancel
                  </button>
                  {/* <button 
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                    onClick={handlePrice}
                  >
                    Price {price}
                  </button> */}
                  <button
                  className={`px-4 py-2 text-white rounded-lg font-medium transition-colors flex items-center justify-center ${price ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                  onClick={handleAgree}
                  disabled={!price}
                >
                  <CheckCircle size={16} className="mr-1" />
                  Agree & continue
                </button>
                </div>
              </div>
            </div>
          </div>
        }
        
        <p onClick= {handleWebsite} className='text-gray-500 text-sm mt-5 cursor-pointer'>DoWell UX Living Lab</p>
        <div className="flex justify-center items-center mt-5">
  <img 
    src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fsamantaanalysis.uxlivinglab.online%2F&labelColor=%2337d67a&countColor=%23d9e3f0&style=plastic" 
    alt="Visitor Badge" 
  />
</div>
    </div>
  )
}

export default EmailPage