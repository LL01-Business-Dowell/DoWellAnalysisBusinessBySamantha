import { useState, useEffect } from 'react';
import { Mail, Printer, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BusinessAnalysis = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/v1/business-analysis/?type=sowt_analysis_report',
        {
          "email": "manish@gmail.in",
          "occurrences": 5,
          "name": "VRK DESIGNS",
          "address": "SMLV Plaza, 2054, Kanakapura Main Rd, next to Vajarahalli metro station, Raghuvanahalli, Bangalore City Municipal Corporation Layout, Bengaluru, Karnataka 560062",
          "url": "https://maps.app.goo.gl/bQuQZdf4DpTFMCZE6",
          "phone": "N/A",
          "rating": 4.5,
          "reviews": 120,
          "plus_code": "VGGW+Q5 Bengaluru, Karnataka",
          "website": "https://business.google.com/create?fp=9187135936770067946&hl=en&authuser=0&gmbsrc=in-en-et-ip-z-gmb-s-z-l~mrc%7Cclaimbz%7Cu&ppsrc=GMBMI&utm_campaign=in-en-et-ip-z-gmb-s-z-l~mrc%7Cclaimbz%7Cu&utm_source=gmb_mrc81&utm_medium=et&getstarted&lis=0",
          "latitude": 12.8769184,
          "longitude": 77.5429095
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setResponse(res.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const formatResponse = () => {
    if (!response?.response) return [];
    const sections = response.response.split('\n\n');
    return sections.map(section => {
      const lines = section.split('\n');
      const heading = lines[0].replace(/\*\*/g, '').trim();
      const content = lines.slice(1)
        .map(line => line.replace(/\*|\*/g, '').trim())
        .filter(line => line.length > 0);
      return { heading, content };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const analysisData = formatResponse();
    
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
    
    console.log('Email HTML content:', htmlContent);
    // You can now send this HTML content via email using your preferred email service.
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle size={24} />
            <p className="text-lg">Error loading analysis: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedData = formatResponse();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {formattedData[0]?.heading || 'Business Analysis'}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Report
                </span>
                <span>•</span>
                <span>Generated on {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail size={18} />
                <span>Email Report</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Printer size={18} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
              <p className="text-gray-600">Loading analysis...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formattedData.slice(1).map((section, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>{section.heading}</span>
                  <ArrowRight size={18} className="text-gray-400" />
                </h2>
                <ul className="space-y-4">
                  {section.content.map((item, i) => {
                    const [title, description] = item.split(':').map(s => s.trim());
                    return (
                      <li 
                        key={i} 
                        className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-900">{title}</span>
                        {description && (
                          <span className="text-gray-600 text-sm">{description}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAnalysis;