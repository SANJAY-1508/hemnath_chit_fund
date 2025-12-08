import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { TextInputForm } from "../../components/Forms";
import { ClickButton } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import API_DOMAIN from "../../config/config";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../components/LanguageContext";


const extractDetail = (mergedString, prefix) => {
  const parts = mergedString.split(", ");
  const part = parts.find((p) => p.startsWith(prefix));
  return part ? part.replace(prefix, "").trim() : "";
};

// Function to generate the merged string format required by the API
const generateBankDetailsString = (formData) => {
    // Note: The fields are assumed to be bank_name, ac_no, and ifsc_no in formData
    return [
        `Bank Name: ${formData.bank_name}`,
        `A/C No: ${formData.ac_no}`,
        `IFSC: ${formData.ifsc_no}`
    ].join(", ");
};

const BankDetailsCreation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData } = location.state || {};

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const initialState =
    type === "edit"
      ? {
          qr_code_img: rowData.qr_code_img || "",
          upl_id: rowData.upl_id || "",
          // Extract individual fields from the merged 'bank_details' string for editing
          bank_name: rowData.bank_details
            ? extractDetail(rowData.bank_details, "Bank Name:")
            : "",
          ac_no: rowData.bank_details
            ? extractDetail(rowData.bank_details, "A/C No:")
            : "",
          ifsc_no: rowData.bank_details
            ? extractDetail(rowData.bank_details, "IFSC:")
            : "",
        }
      : {
          qr_code_img: "",
          upl_id: "",
          bank_name: "",
          ac_no: "",
          ifsc_no: "",
        };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for image preview URL (used for display, either fetched URL or new Base64)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    type === "edit" && rowData.qr_code_img ? rowData.qr_code_img : null
  );

  const handleChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setFormData((prev) => ({
                ...prev,
                qr_code_img: base64String, 
            }));
            setImagePreviewUrl(base64String); 
        };
        reader.readAsDataURL(file); 
    } else {
        // Reset if no file is selected (e.g., user cancels the file picker)
        setFormData((prev) => ({
            ...prev,
            qr_code_img: '',
        }));
        setImagePreviewUrl(null);
    }
  };

  // CREATE BANK DETAILS ----------------------
  const handleSubmit = async () => {
    setLoading(true);
    const mergedBankDetails = generateBankDetailsString(formData);

    try {
      const response = await fetch(`${API_DOMAIN}/bank_details.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: formData.qr_code_img, 
          bank_details: mergedBankDetails, 
          upi_id: formData.upl_id,
          current_user_id: user.user_id, 
        }),
      });

      const data = await response.json();

      if (data.head.code === 200) {
        toast.success(data.head.msg);
        setTimeout(() => navigate("/console/master/bankdetails"), 1500);
      } else {
        toast.error(data.head.msg);
      }
    } catch (err) {
      toast.error("Something went wrong during creation!");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE BANK DETAILS ----------------------
  const handleUpdateSubmit = async () => {
    setLoading(true);
    const mergedBankDetails = generateBankDetailsString(formData);

    let updatePayload = {
      bank_details_id: rowData.id, 
      bank_details: mergedBankDetails,
      upi_id: formData.upl_id,
      current_user_id: user.user_id, 
    };
    if (formData.qr_code_img && formData.qr_code_img.startsWith("data:")) {
      updatePayload.image_url = formData.qr_code_img;
    }

    try {
      const response = await fetch(`${API_DOMAIN}/bank_details.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();
      if (data.head.code === 200) {
        toast.success(data.head.msg);
        setTimeout(() => navigate("/console/master/bankdetails"), 1500);
      } else {
        toast.error(data.head.msg);
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Container>
      <Row className="regular">
        <Col lg="12" className="py-3">
            <PageNav
                pagetitle={
                    type === "edit"
                        ? t("Bank Details Edit")
                        : t("Bank Details Creation")
                }
            />
        </Col>

        {/* ======================================= */}
        {/* ROW 1: QR Code Image and Preview */}
        {/* ======================================= */}
        <Col lg="12">
            <Row>
                {/* QR Code Image Input (Takes 3 columns) */}
                <Col lg="3" md="4" xs="12" className="py-3">
                    <TextInputForm
                        type="file"
                        labelname={t("Choose QR Code Image")}
                        name="qr_code_file"
                        onChange={handleFileChange}
                        accept="image/*"
                        // IMPORTANT: The 'value' prop is intentionally omitted for type="file"
                    />

                    {/* Display the selected file name separately */}
                    {selectedFile && (
                        <div className="text-muted mt-1">
                            {t("Selected:")} **{selectedFile.name}**
                        </div>
                    )}
                </Col>
                
                {/* Image Preview (Takes 3 columns) */}
                <Col lg="3" md="4" xs="12" className="py-3 text-center">
                    {imagePreviewUrl ? (
                        <div style={{ 
                                border: '1px solid #ccc', 
                                padding: '10px', 
                                display: 'inline-block', 
                                maxWidth: '200px',
                                maxHeight: '200px' 
                            }}>
                            <img 
                                src={imagePreviewUrl} 
                                alt={t("QR Code Preview")} 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '180px', 
                                    display: 'block' 
                                }} 
                            />
                            <small className="d-block mt-1">{t("Image Preview")}</small>
                        </div>
                    ) : (
                        <div className="text-muted" style={{ border: '1px solid #ccc', padding: '10px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {t("No Image Selected")}
                        </div>
                    )}
                </Col>
            </Row>
        </Col>

        {/* ======================================= */}
        {/* ROW 2: UPI ID */}
        {/* ======================================= */}
        <Col lg="12">
            <Row>
                {/* UPI ID Input Form (Takes 3 columns) */}
                <Col lg="3" md="4" xs="12" className="py-3">
                    <TextInputForm
                        labelname={t("UPI ID ")}
                        name="upl_id"
                        value={formData.upl_id}
                        onChange={(e) => handleChange(e, "upl_id")}
                    />
                </Col>
            </Row>
        </Col>

        {/* ======================================= */}
        {/* ROW 3: Bank Details (Bank Name, A/C No, IFSC) - All in one line */}
        {/* ======================================= */}
        <Col lg="12">
            <Row>
                {/* Bank Name Input */}
                <Col lg="3" md="4" xs="12" className="py-3">
                    <TextInputForm
                        labelname={t("Bank Name")}
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => handleChange(e, "bank_name")}
                    />
                </Col>

                {/* Account Number Input */}
                <Col lg="3" md="4" xs="12" className="py-3">
                    <TextInputForm
                        labelname={t("Account Number")}
                        name="ac_no"
                        value={formData.ac_no}
                        onChange={(e) => handleChange(e, "ac_no")}
                    />
                </Col>

                {/* IFSC Code Input */}
                <Col lg="3" md="4" xs="12" className="py-3">
                    <TextInputForm
                        labelname={t("IFSC Code")}
                        name="ifsc_no"
                        value={formData.ifsc_no}
                        onChange={(e) => handleChange(e, "ifsc_no")}
                    />
                </Col>
            </Row>
        </Col>

        {/* ======================================= */}
        {/* BUTTONS ROW */}
        {/* ======================================= */}
        <Col lg="12" className="py-5 text-center">
            {type === "edit" ? (
                <>
                    <ClickButton
                        label={loading ? t("Updating...") : t("Update")}
                        onClick={handleUpdateSubmit}
                    />
                    <span className="mx-2"></span>
                    <ClickButton
                        label={t("Cancel")}
                        onClick={() => navigate("/console/master/bankdetails")}
                    />
                </>
            ) : (
                <>
                    <ClickButton
                        label={loading ? t("Submitting...") : t("Submit")}
                        onClick={handleSubmit}
                    />
                    <span className="mx-2"></span>
                    <ClickButton
                        label={t("Cancel")}
                        onClick={() => navigate("/console/master/bankdetails")}
                    />
                </>
            )}
        </Col>
    </Row>
      </Container>

      <ToastContainer theme="colored" />
    </div>
  );
};

export default BankDetailsCreation;