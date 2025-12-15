import { useState, useEffect } from 'react';
import API_DOMAIN from "../../config/config"; 

const COMPANY_API = `${API_DOMAIN}/company.php`;

/**
 * Custom hook to fetch the company name.
 * @returns {string} 
 */
export const useCompanyDetails = () => {
    const [companyName, setCompanyName] = useState(""); 

    const fetchCompanyName = async () => {
        try {
            const response = await fetch(COMPANY_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "search_text": "" }),
            });
            const responseData = await response.json();
            console.log("API Response:", responseData);
            if (responseData.head.code === 200 && responseData.body.company) {
            
                const companyData = responseData.body.company;
                console.log("Company Data:", companyData);
                if (companyData && companyData?.company_name) {
                    setCompanyName(companyData?.company_name);
                }
                console.log("Company Name:", companyName);
            } else {
                console.error("API Error fetching company name:", responseData.head.msg);
            }
        } catch (error) {
            console.error("Error fetching company details:", error.message);
        }
    };

    useEffect(() => {
        fetchCompanyName();
    }, []);

    return companyName;
};