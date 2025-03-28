import axios from "axios";
export const getCountryAndCurrencyData = async () => {
  try {
    const response = await axios.get(
      "https://100088.pythonanywhere.com/api/v1/ppp"
    );
    const countries = response.data?.country || [];
    const currencies = response.data?.currency || [];
    return { countries, currencies };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { countries: [], currencies: [] };
  }
};

// Function to get user's country and currency from browser
export const getUserInfo = async () => {
  try {
    const response = await axios.get("https://ipapi.co/json/");
    return {
      country: response.data.country_name,
      currency: response.data.currency,
      currency_name: response.data.currency_name,
      timeZone: response.data.timezone
    };
  } catch (error) {
    console.error("Error fetching user location:", error);
    return {
      country: "Unknown",
      currency: "Unknown",
      currency_name: "Unknown",
    };
  }
};

export const getPPP = async (data) => {
    try {
        const response = await axios.post(
            "https://100088.pythonanywhere.com/api/v1/ppp/check_ppp",
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching PPP data:", error);
        return null;
    }
};
