import axios from "axios";


export async function getUser(email) {
    const response = await axios.get(`${process.env.BACKEND}/api/v3/experience_database_services/?type=get_user_email&product_number=UXLIVINGLAB010&email=${email}`)
    return response.data;
}

export async function register(email) {
    const response = await axios.post(`${process.env.BACKEND}/api/v3/experience_database_services/?type=register_user`, {
        email: email,
        product_number: "UXLIVINGLAB010"
    });
    return response.data;
}

export async function analysis(body) {
    const response = await axios.post(`${process.env.BACKEND}/api/v1/business-analysis/?type=business_info`, body)
}