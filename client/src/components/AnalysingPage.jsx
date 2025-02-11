import { useEffect, useState } from 'react'
import MapComponent from './MapComponent'
import SamantaLogo from "../assets/samanta.svg";
import DowellLogo from "../assets/dowell.png"
import { analysis, sendEmail, sowtAnalysis } from '../services/api.services'
import { useRecoilValue } from 'recoil'
import { analysisBodyAtom, occurenceAtom, userEmailAtom } from '../recoil/atom'
import { Loader2 } from 'lucide-react';

function AnalysingPage() {
    const occurrences = useRecoilValue(occurenceAtom);
    const userEmail = useRecoilValue(userEmailAtom);
    const analysisBody = useRecoilValue(analysisBodyAtom);
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
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
    
    const formatResponse = () => {
        if (!swotAnalysisData) return [];
        const sections = swotAnalysisData.split('\n\n');
        console.log(sections);
        
        return sections.map(section => {
          const lines = section.split('\n');
          const heading = lines[0].replace(/\*\*/g, '').trim();
          const content = lines.slice(1)
            .map(line => line.replace(/\*|\*/g, '').trim())
            .filter(line => line.length > 0);
          return { heading, content };
        });
    };

    const handleEmail = async () => {
        const analysisData = formatResponse();
        console.log(analysisData);
        
        const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${analysisData[0]?.heading || 'Business Analysis'}</title>
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
              color: #2d3748;
              margin-top: 30px;
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
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="Company Logo" class="logo" />
            <h1>${analysisData[0]?.heading || 'Business Analysis'}</h1>
            <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${analysisData.slice(1).map(section => `
            <div>
              <h2>${section.heading}</h2>
              <ul>
                ${section.content.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          <div class="footer">
            <p>© 2025 DoWell UX Living Lab. All rights reserved.</p>
            <p>Contact us at <a href="mailto:dowell@dowellresearch.uk">dowell@dowellresearch.uk</a></p>
          </div>
        </body>
      </html>
    `;

        try {
            const emailData = {
              toname: email, 
              toemail: email, 
              subject: '🚀 Unlock Data-Driven Business Insights with Samanta AI – Get Customer perspective',
              email_content: htmlContent,
            };
        
            const response = await sendEmail(emailData);
        
            if (response.success) {
              alert('Email sent successfully!');
            } else {
              alert('Failed to send email: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again later.');
        }
    };

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
                onClick={handleEmail}
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
    );
}

export default AnalysingPage