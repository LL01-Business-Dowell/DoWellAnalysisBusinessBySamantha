import { useEffect, useState } from 'react'
import MapComponent from './MapComponent'
import SamantaLogo from "../assets/samanta.svg";
import DowellLogo from "../assets/dowell.png"
import { analysis, googleAnalysis, sendEmail, sowtAnalysis } from '../services/api.services'
import { useRecoilValue } from 'recoil'
import { analysisDataAtom, occurenceAtom, priceAtom, stripePaymentDataAtom, userEmailAtom } from '../recoil/atom'
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';


function GoogleAnalysingPage() {
    const occurrences = useRecoilValue(occurenceAtom);
    const userEmail = useRecoilValue(userEmailAtom);
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
    const [email, setEmail] = useState(userEmail);
    const analysisData = useRecoilValue(analysisDataAtom);
    const [isAnalysing, setIsAnalysing] = useState(true);
    const [swotAnalysisData, setSwotAnalysisData] = useState("");
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const price = useRecoilValue(priceAtom)
    const paymentLink = useRecoilValue(stripePaymentDataAtom)


    const formatResponse = () => {
  if (!swotAnalysisData) return [];
  
  // Extract the actual content string from the API response
  let contentString = '';
  
  // Handle different possible response structures
  if (typeof swotAnalysisData === 'string') {
    contentString = swotAnalysisData;
  } else if (swotAnalysisData.choices && swotAnalysisData.choices[0]) {
    contentString = swotAnalysisData.choices[0].message.content;
  } else if (swotAnalysisData.response && swotAnalysisData.response.choices && swotAnalysisData.response.choices[0]) {
    contentString = swotAnalysisData.response.choices[0].message.content;
  } else if (swotAnalysisData.content) {
    contentString = swotAnalysisData.content;
  } else {
    console.error('Unable to extract content from swotAnalysisData:', swotAnalysisData);
    return [];
  }
  
  const sections = [];
  let currentSection = null;
  let title = 'Business Google Reviews analysis'; // Default title
  
  // Split content into lines for processing
  const lines = contentString.split('\n');
  
  // Add the main title section first
  sections.push({ heading: title, content: [] });
  
  // Process each line to extract sections
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Handle main section headers (### **Strengths**, ### **Weaknesses**, etc.)
    if (trimmedLine.startsWith('### **') && trimmedLine.endsWith('**')) {
      currentSection = trimmedLine.replace('### **', '').replace('**', '');
      sections.push({ heading: currentSection, content: [] });
    }
    // Handle numbered list items (1. **Item Name**: Description)
    else if (/^\d+\.\s\*\*/.test(trimmedLine) && currentSection) {
      const item = trimmedLine
        .replace(/^\d+\.\s/, '') // Remove number and dot
        .replace(/\*\*/g, ''); // Remove bold formatting
      
      if (item.trim().length > 0) {
        sections[sections.length - 1].content.push(item);
      }
    }
    // Handle bullet points with sub-items (- *Evidence*: text)
    else if (trimmedLine.startsWith('- ') && currentSection) {
      const item = trimmedLine
        .replace(/^-\s/, '') // Remove dash and space
        .replace(/\*/g, ''); // Remove asterisks
      
      if (item.trim().length > 0) {
        sections[sections.length - 1].content.push(item);
      }
    }
    // Handle simple bullet points (* text)
    else if (trimmedLine.startsWith('* ') && currentSection) {
      const item = trimmedLine
        .replace(/^\*\s/, '') // Remove asterisk and space
        .replace(/\*\*/g, ''); // Remove bold formatting
      
      if (item.trim().length > 0) {
        sections[sections.length - 1].content.push(item);
      }
    }
    // Handle other section headers (### **Methodology**, ### **Conclusion**)
    else if (trimmedLine.startsWith('### **') && !sections.some(s => s.heading === currentSection)) {
      currentSection = trimmedLine.replace('### **', '').replace('**', '');
      sections.push({ heading: currentSection, content: [] });
    }
    // Handle conclusion content and other paragraph text
    else if (currentSection && trimmedLine.length > 0 && !trimmedLine.startsWith('---') && !trimmedLine.startsWith('For now') && !trimmedLine.startsWith('Conducting')) {
      // Skip introductory paragraphs, focus on actionable content
      if (trimmedLine.includes(':') || currentSection === 'Conclusion' || currentSection === 'Methodology for Analysis' || currentSection === 'Conclusion and Recommendations') {
        sections[sections.length - 1].content.push(trimmedLine);
      }
    }
  });
  
  // Filter out empty sections and the initial empty title section
  const filteredSections = sections.filter(section => 
    section.content.length > 0 && section.heading !== 'Business Analysis'
  );
  
  // Extract business name from content if available
  const businessNameMatch = contentString.match(/(?:Cafe Name\s+)?([A-Za-z\s]+)(?:\s+\(located at|,)/);
  const businessName = businessNameMatch ? businessNameMatch[1].trim() : 'Your Business';
  
  // Add the title section back with extracted business name
  filteredSections.unshift({ heading: businessName, content: [] });
  
  return filteredSections;
};
    
    const handleEmail = async () => {
      const analysisData = formatResponse();
      setIsResendDisabled(true);
      setCountdown(60);
        
      // Build the feedback URL base
      const feedbackBaseUrl = "https://www.scales.uxlivinglab.online/api/v1/create-response/?user=True&scale_type=nps&channel=channel_1&instance=instance_1&workspace_id=6385c0e48eca0fb652c9447b&username=HeenaK&scale_id=665d95ae7ee426d671222a7b&item=";
      
      const productUrl = "https://samantaanalysis.uxlivinglab.online/google-review-analysis"
      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${analysisData[0]?.heading || 'Business Analysis'}</title>
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
        .payment-section {
          background-color: #f0f4f8;
          border: 2px solid #00C950;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .payment-price {
          font-size: 24px;
          color: #c53030;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .payment-link {
          display: block;
          background-color: #00C950;
          color: white;
          text-decoration: none;
          padding: 15px 25px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 18px;
          margin-top: 15px;
          transition: background-color 0.3s ease;
        }
        .payment-link:hover {
          background-color: #009c40;
        }
        .product-link {
          color: #1a365d;
          text-decoration: underline;
          font-weight: bold;
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
            <h1> Business Google Reviews analysis from Samanta AI... analysing customer perspectives</h1>
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
          <div class="payment-section">
            <div class="payment-price">Price for this report: ${price}</div>
            <a href="${paymentLink}" class="payment-link">Complete Payment Now</a>
            <p>Interested in more? <a href="${productUrl}" class="product-link">Try Samanta AI... for Your Business</a></p>
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
          subject: '🚀 Business Google Reviews analysis from Samanta AI... analysing customer perspectives',
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

    useEffect(() => {
        async function analyze() {
            try {

                setIsAnalysing(true)
                let swotResponse = null;
                swotResponse = await googleAnalysis({
                ...analysisData,
                email: userEmail,
                rating: parseInt(analysisData.rating, 10),
                reviews: parseInt(analysisData.reviews.match(/\d+/)[0], 10),
                occurrences: occurrences
                })
                
                setSwotAnalysisData(swotResponse.response.choices[0].message.content)
                setIsAnalysisComplete(true)
                setIsAnalysing(false)

            } catch (error) {
                alert("Error, Please try again later.")
                console.error("Error in analysing.", error);
            }
        }
        analyze()
    }, [])

    useEffect(() => {
      if (swotAnalysisData) {
          handleEmail();
      }
    }, [swotAnalysisData]);

    useEffect(() => {
      let timer;
      if (countdown > 0) {
          timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
          setIsResendDisabled(false);
      }
      return () => clearTimeout(timer);
    }, [countdown]);
    

    return (
        <div className='relative flex text-white flex-col justify-between w-full h-full min-h-[640px]'>
            <X
            size={20}
            className='absolute top-2 right-8 p-1 bg-red-500 rounded-full'
            onClick={() => window.location.reload()}
            />
            <div className='w-full flex flex-col space-y-3 px-15'>
                {isAnalysing ? <p className='text-red-500 text-sm'>Analysing your business...{isAnalysing && <Loader2 size={12} className='animate-spin flex'/>}</p> : <p className='text-sm text-red-500 '>Report prepared.</p>}
                <div className='border rounded-2xl w-full h-full overflow-hidden min-h-60 max-w-40'>
                    {analysisData && <MapComponent lat={analysisData.latitude} lng={analysisData.longitude}/>}
                </div>
            </div>
            {isAnalysisComplete && <div className='flex flex-col space-y-2'>
              Report sent to check {email} <br/> check your inbox <br/>
              Thank you
                <button
                className='bg-green-500 p-2 rounded-2xl w-full disabled:cursor-not-allowed'
                onClick={handleEmail}
                disabled={isResendDisabled}
                >
                  {isResendDisabled ? `Please wait ${countdown} seconds to resend.` : 'Resend'}
                </button>
            </div>}
            <div className='w-full relative flex pr-5 pb-5 overflow-hidden'>
                <div className='flex-grow'>
                    <p className='absolute left-0 z-50 w-40'>Samanta will tell the story on analysed data</p>
                    <img src={DowellLogo} alt="Noo" className='absolute z-50 w-10 h-10 left-0 bottom-5' />
                </div>
                <img src={SamantaLogo} alt="" className="w-30 h-30 scale-180" />
            </div>
        </div>
    );
}

export default GoogleAnalysingPage