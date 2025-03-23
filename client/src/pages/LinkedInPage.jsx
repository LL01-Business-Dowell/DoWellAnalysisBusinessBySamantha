/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react'
import SamantaLogo from "../assets/samanta.svg"
import { getUserLinkedIn, linkedInAnalysis, register, registerLinkedIn, sendEmail, sendEmailLinkedIn } from '../services/api.services';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { occurenceAtom, userEmailAtom } from '../recoil/atom';
import { Loader2, RotateCw, CheckCircle, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCountryAndCurrencyData, getPPP, getUserInfo } from '../services/utils';

function LinkedInPage() {
const setUserEmail = useSetRecoilState(userEmailAtom);
const [occurence, setOccurence] = useRecoilState(occurenceAtom);
const [email, setEmail] = useState("");
const [isEligible, setIsEligible] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [showPaymentPopup, setShowPaymentPopup] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
const [price,setPrice] = useState("");
const [linkedInLink, setLinkedInLink] = useState("");
const [isEmailed, setIsEmailed] = useState(false);
const [isResendDisabled, setIsResendDisabled] = useState(false);
const [countdown, setCountdown] = useState(0);
const [isAnalysing, setIsAnalysing] = useState(false);
const [analysisData, setAnalysisData] = useState(null);

useEffect(() => {
  setShowTooltip(true);
  const timer = setTimeout(() => {
    setShowTooltip(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  let timer;
  if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
  } else {
      setIsResendDisabled(false);
  }
  return () => clearTimeout(timer);
}, [countdown]);

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

async function checkUser() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company|school)\/[a-zA-Z0-9-_%]+\/?$/;

  if (!emailRegex.test(email)) {
    toast.error("Email is invalid.");
    return;
  }
  
  if(!linkedInRegex.test(linkedInLink)) {
    toast.error("Linked In link is invalid.");
    return;
  }

  try {
    setIsLoading(true)
    let response = await getUserLinkedIn(email)
    console.log(response);
    
    if(response.occurrences == 0) {
      await registerLinkedIn(email)
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
              "base_price": "8",
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
const formatResponse = (data) => {
  if (!data) return [];
  
  // Split by section headers (Strengths, Weaknesses, etc.)
  const sections = [];
  let currentSection = null;
  let title = '';
  
  // First, extract the title from the first lines
  const lines = data.split('\n');
  if (lines[0].startsWith('## ')) {
    title = lines[0].replace('## ', '').replace('SWOT Analysis of ', '');
    lines.shift(); // Remove the title line
  }
  
  sections.push({ heading: title, content: [] });
  
  // Process each line to extract sections properly
  lines.forEach(line => {
    if (line.startsWith('**') && line.endsWith(':**')) {
      // This is a section header like "**Strengths:**"
      currentSection = line.replace(/\*\*/g, '').replace(':', '');
      sections.push({ heading: currentSection, content: [] });
    } else if (line.trim().startsWith('* ') && currentSection) {
      // This is a bullet point under a section
      const bulletPoint = line.trim().replace('* ', '').replace(/\*\*/g, '');
      if (bulletPoint.trim().length > 0) {
        sections[sections.length - 1].content.push(bulletPoint);
      }
    }
  });
  
  return sections;
};

const handleEmail = async (data) => {
  const analysisData = formatResponse(data);
  setIsResendDisabled(true);
  setCountdown(60);
  setIsEmailed(true);
  console.log(analysisData, "data");
  
  const feedbackBaseUrl = "https://www.scales.uxlivinglab.online/api/v1/create-response/?user=True&scale_type=nps&channel=channel_1&instance=instance_1&workspace_id=6385c0e48eca0fb652c9447b&username=HeenaK&scale_id=665d95ae7ee426d671222a7b&item=";
  
  const productUrl = "https://samantaanalysis.uxlivinglab.online/linkedin"
  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Linkedin Analysis</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #c53030; /* Red color for section headings */
          margin-top: 30px;
          font-weight: bold;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 10px;
        }
        .date {
          color: #718096;
          font-size: 0.9em;
          text-align: center;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 0.9em;
          color: #718096;
        }
        .feedback-section {
          margin: 40px auto;
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          max-width: 600px;
        }
        .rating-question {
          font-weight: bold;
          font-size: 18px;
          color: #1a365d;
          margin-bottom: 15px;
          text-align: center;
        }
        .rating-table {
          width: 100%;
          margin: 20px auto;
          text-align: center;
          border-collapse: separate;
          border-spacing: 5px;
        }
        .rating-button {
          display: inline-block;
          width: 45px;
          height: 45px;
          line-height: 45px;
          text-align: center;
          border-radius: 50%;
          font-weight: bold;
          text-decoration: none;
        }
        .low-rating {
          background-color: #fed7d7;
          color: #c53030;
        }
        .mid-rating {
          background-color: #fefcbf;
          color: #b7791f;
        }
        .high-rating {
          background-color: #c6f6d5;
          color: #2f855a;
        }
        .rating-button:hover {
          opacity: 0.8;
        }
        .rating-labels {
          width: 100%;
          margin: 10px auto;
          display: table;
        }
        .label-left {
          text-align: left;
          display: table-cell;
          color: #4a5568;
          font-size: 14px;
        }
        .label-right {
          text-align: right;
          display: table-cell;
          color: #4a5568;
          font-size: 14px;
        }
        .swot-section {
          margin-bottom: 25px;
          border-left: 4px solid #c53030;
          padding-left: 15px;
        }
          .product-button-container {
          text-align: center;
          margin: 30px auto;
        }
        .product-button {
          display: inline-block;
          background-color: #00C950;
          color: white;
          font-weight: bold;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 16px;
          transition: background-color 0.3s;
        }
          
        .product-button:hover {
          background-color: #00C950;
    }
        @media only screen and (max-width: 600px) {
          .rating-button {
            width: 35px;
            height: 35px;
            line-height: 35px;
            font-size: 14px;
          }
          .product-button {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="Company Logo" class="logo" />
        <h1>LinkedIn Profile Analysis from Samanta AI... Unlocking Valuable Insights</h1>
        <p class="date">Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      
      ${analysisData.slice(1).map(section => `
        <div class="swot-section">
          <h2>${section.heading}</h2>
          <ul>
            ${section.content.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `).join('')}

      <!-- Product Button Section -->
      <div class="product-button-container">
        <a href="${productUrl}" class="product-button">Try Samanta AI for Your Linkedin Profile</a>
      </div>
      
      <!-- Feedback Rating Section -->
      <div class="feedback-section">
        <p class="rating-question">Would you recommend our analysis to your friends and colleagues?</p>
        <p>Tell us what you think using the scale below!</p>
        
        <!-- Using a table for better centering in email clients -->
        <table class="rating-table" cellpadding="0" cellspacing="5" align="center">
          <tr>
            ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => `
              <td>
                <a href="${feedbackBaseUrl}${rating}" class="rating-button ${
                  rating <= 6 ? 'low-rating' : rating <= 8 ? 'mid-rating' : 'high-rating'
                }">${rating}</a>
              </td>
            `).join('')}
          </tr>
        </table>
        
        <div class="rating-labels">
          <div class="label-left">Not at all likely</div>
          <div class="label-right">Extremely likely</div>
        </div>
      </div>
      
      <div class="footer">
        <p>© DoWell UX Living Lab. All rights reserved.</p>
        <p>Contact us at <a href="mailto:dowell@dowellresearch.uk">dowell@dowellresearch.uk</a></p>
        <p>Powered by uxlivinglab</p>
      </div>
    </body>
  </html>
`;

  try {
    const emailData = {
      toname: email, 
      toemail: email, 
      subject: '🚀 LinkedIn Analysis from Samanta AI... Unlocking Valuable Insights',
      email_content: htmlContent,
    };

    const response = await sendEmail(emailData);
    

    if (response.success) {
      toast.success('Email sent successfully!');
    } else {
      toast.error('Failed to send email: ' + (response.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    toast.error('Failed to send email. Please try again later.');
  }
};

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
  try {
    try {
      setShowPaymentPopup(false);
      setIsAnalysing(true);
      try {
        const body = {
          email,
          occurrences: occurence,
          linkedin_link: linkedInLink
        }
        const response = await linkedInAnalysis(body);
        handleEmail(response.response);
        setAnalysisData(response.response);
        
      } catch (error) {
        toast.error("Please try again later.")
      }
      
    } catch (error) {
      
    }
  } catch (error) {
    toast("Error in sending email.")
  }
  
}

function openHelpVideo() {
  window.open("https://youtube.com/shorts/esuXEo8rulA?si=RT97O3t6An54ZLwV", "_blank");
}

return (
  <div className='flex w-screen h-screen items-center justify-center'>
    <div className='flex flex-col items-center justify-center max-w-[430px] p-3'>
      <div className='relative text-center p-10'>
          <RotateCw
            size={20}
            className='absolute top-2 right-8 p-1 bg-green-500 rounded-full cursor-pointer'
            onClick={() => window.location.reload()}
          />
          <img src={SamantaLogo} alt="Samanta Logo" />
          {!isAnalysing ? !isEmailed  &&
            <div>
              <p>Samanta can analyze your LinkedIn profile and suggest improvements.</p>
              <input 
                type="text"
                className='w-full p-2 rounded-2xl border my-2'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="text"
                className='w-full p-2 rounded-2xl border my-2'
                placeholder='Linked In Link'
                value={linkedInLink}
                onChange={(e) => setLinkedInLink(e.target.value)}
              />
            </div> : ""
          }
          {!isEmailed ? isAnalysing ? <p className='text-red-500 text-sm text-center'>Analysing your linkedin...{ <Loader2 size={12} className='animate-spin mx-auto'/>}</p> : "" : ""}

          {isEmailed &&
            <div className='flex flex-col space-y-2 items-start'>
            Report sent to {email} <br/> check your inbox <br/>
            Thank you
              <button
              className='bg-green-500 p-2 rounded-2xl w-full disabled:cursor-not-allowed'
              onClick={() => handleEmail(analysisData)}
              disabled={isResendDisabled}
              >
                {isResendDisabled ? `Please wait ${countdown} seconds to resend.` : 'Resend'}
              </button>
          </div>
          }

          {isEligible === null && 
            <div className="relative flex items-center">
              {/* <div className="relative mr-2">
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
              </div> */}
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
              {!isEligible && 
                <button onClick= {handlePrice} className='bg-red-400 w-full p-2 rounded-2xl text-white font-semibold'>
                  Contribute
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
                  To access the in-depth insights from Samanta LinkedIn Analysis, a fee is required. You’ll receive a detailed invoice and a secure payment link via email, along with your analysis report. 
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
      src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fsamantaanalysis.uxlivinglab.online%2Flinkedin&labelColor=%2337d67a&countColor=%23555555&style=plastic" 
      alt="Visitor Badge" 
    />
  </div>
      </div>
    </div>
  </div>
)
}

export default LinkedInPage