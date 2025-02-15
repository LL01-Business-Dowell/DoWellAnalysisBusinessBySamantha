import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const DOWELL_BACKEND_URL = import.meta.env.VITE_DOWELL_BACKEND_URL;


export async function getUser(email) {
    const response = await axios.get(`${DOWELL_BACKEND_URL}/experience_database_services/?type=get_user_email&product_number=UXLIVINGLAB010&email=${email}`)
    console.log(response);
    
    return response.data;
}

export async function register(email) {
    const response = await axios.post(`${DOWELL_BACKEND_URL}/experience_database_services/?type=register_user`, {
        email: email,
        product_number: "UXLIVINGLAB010"
    });
    return response.data;
}

export async function analysis(body) {
    const response = await axios.post(`${BACKEND_URL}/v1/business-analysis/?type=business_info`, body);
    return response.data
}   

export async function sowtAnalysis(body) {
    const response = await axios.post(`${BACKEND_URL}/v1/business-analysis/?type=sowt_analysis_report`, body);
    return response.data;
    
}

export async function sendEmail(data){
    const response = await axios.post('https://100085.pythonanywhere.com/api/email/', data);
    return response.data;
}