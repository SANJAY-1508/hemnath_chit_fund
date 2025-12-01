import React, { useState } from "react";
import { Col, Container, Row, Alert, Modal } from "react-bootstrap";
import { TextInputForm } from "../../components/Forms";
import { ClickButton, Delete } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_DOMAIN from "../../config/config";
// ✅ Import the useLanguage hook
import { useLanguage } from "../../components/LanguageContext";

const CompanyCreation = () => {
  // ✅ Use the translation hook
  const { t } = useLanguage();

  const location = useLocation();
  const { type, rowData } = location.state || {};
  console.log("rowData", rowData);
  const initialState =
    type === "edit"
      ? { ...rowData }
      : {
          company_name: "",
          mobile_number: "",
          gst: "",
          place: "",
          pincode: "",
        };

  const [formData, setFormData] = useState(initialState);
  console.log("formdata values", formData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const redirectModal = () => {
    navigate("/console/company");
  };

  const handleChange = (e, fieldName) => {
    const value = e.target ? e.target.value : e.value;

    if (fieldName === "jewel_price" && type !== "view") {
      const newJewel = parseFloat(value) || 0;
      const updates = {
        "22_carat_price": newJewel - 1500,
        "21_carat_price": newJewel - 2500,
        "20_carat_price": newJewel - 3500,
        "19_carat_price": newJewel - 4500,
        "18_carat_price": newJewel - 5500,
        "17_carat_price": newJewel - 6500,
        "16_carat_price": newJewel - 7500,
      };
      setFormData({
        ...formData,
        jewel_price: value,
        ...updates,
      });
    } else {
      setFormData({
        ...formData,
        [fieldName]: value,
      });
    }
  };

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        company_name: formData.company_name,
        mobile_number: formData.mobile_number,
        gst: formData.gst,
        place: formData.place,
        pincode: formData.pincode,
      };
      console.log("Payload:", payload);

      if (type === "edit") {
        payload.edit_company_id = rowData.user_id;
      }

      const response = await fetch(`${API_DOMAIN}/company.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log(response);

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });

        setTimeout(() => {
          navigate("/console/company");
        }, 2000);
      } else {
        toast.error(responseData.head.msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.error(
          responseData.message || "Unknown error occurred during submission"
        );
      }
    } catch (error) {
      console.error("Error submitting company:", error.message);
      // ✅ Translate static error message
      toast.error(t("An error occurred. Please try again."), {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }

    setLoading(false);
  };

  const priceFields = [
    { key: "jewel_price", label: "Jewel Price", placeholder: "Jewel Price" },
    // {
    //   key: "22_carat_price",
    //   label: "22 Carat Price",
    //   placeholder: "22 Carat Price",
    // },
    // (Rest of the fields are commented out)
  ];

  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
            <PageNav
              // ✅ Translate PageNav title
              pagetitle={`${t("Company")} ${
                type === "view"
                  ? t("view")
                  : type === "edit"
                  ? t("Edit")
                  : t("Creation")
              }`}
            ></PageNav>
          </Col>

          {/* Company Name Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Company Name")} // ✅
                labelname={t("Company Name")} // ✅
                name="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange(e, "company_name")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Company Name")} // ✅
                labelname={t("Company Name")} // ✅
                name="company_name"
                value={
                  type === "view" ? rowData.company_name : formData.company_name
                }
                onChange={(e) => handleChange(e, "company_name")}
              ></TextInputForm>
            )}
          </Col>
          {/* Mobile Number Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Mobile Number")} // ✅
                type={"text"}
                labelname={t("Mobile Number")} // ✅
                name="mobile"
                value={formData.mobile}
                onChange={(e) => handleChange(e, "mobile")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Mobile Number")} // ✅
                type={"text"}
                labelname={t("Mobile Number")} // ✅
                name="mobile"
                value={type === "view" ? rowData.mobile : formData.mobile}
                onChange={(e) => handleChange(e, "mobile")}
              ></TextInputForm>
            )}
          </Col>
          {/* License Number Field (gst) */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("GST")} // ✅
                labelname={t("GST")} // ✅
                name="gst_no"
                value={formData.gst_no}
                onChange={(e) => handleChange(e, "gst")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("GST")} // ✅
                labelname={t("GST")} // ✅
                name="gst_no"
                value={type === "view" ? rowData.gst_no : formData.gst_no}
                onChange={(e) => handleChange(e, "gst_no")}
              ></TextInputForm>
            )}
          </Col>
          {/* Place Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Place")} // ✅
                labelname={t("Place")} // ✅
                name="city"
                value={formData.city}
                onChange={(e) => handleChange(e, "city")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Place")} // ✅
                labelname={t("Place")} // ✅
                name="city"
                value={type === "view" ? rowData.city : formData.city}
                onChange={(e) => handleChange(e, "city")}
              ></TextInputForm>
            )}
          </Col>
          {/* Pincode Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Pincode")} // ✅
                labelname={t("Pincode")} // ✅
                name="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange(e, "pincode")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Pincode")} // ✅
                labelname={t("Pincode")} // ✅
                name="pincode"
                value={type === "view" ? rowData.pincode : formData.pincode}
                onChange={(e) => handleChange(e, "pincode")}
              ></TextInputForm>
            )}
          </Col>

          <Col lg="12" md="12" xs="12" className="py-5 align-self-center">
            <div className="text-center">
              {type === "view" ? (
                <ClickButton
                  label={<>{t("back")}</>} // ✅
                  onClick={() => navigate("/console/company")}
                ></ClickButton>
              ) : (
                <>
                  <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                  />
                  <span className="mx-2">
                    <ClickButton
                      // ✅ Translate button label
                      label={<>{type === "edit" ? t("Update") : t("Submit")}</>}
                      onClick={handleSubmit}
                      disabled={loading}
                    ></ClickButton>
                  </span>
                  <span className="mx-2">
                    <Delete
                      label={<>{t("Cancel")}</>} // ✅
                      onClick={() => navigate("/console/company")}
                    ></Delete>
                  </span>
                </>
              )}
            </div>
          </Col>
        </Row>
        {error && (
          <Alert variant="danger" className="error-alert">
            {error}
          </Alert>
        )}
      </Container>
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Body className="text-center">
          <img
            src={require("../../components/sidebar/images/output-onlinegiftools.gif")}
            alt="Success GIF"
          />
          {/* ✅ Translate modal text */}
          <p>{t("User saved successfully!")}</p>
        </Modal.Body>
        <Modal.Footer>
          <ClickButton
            variant="secondary"
            // ✅ Translate modal button
            label={<> {t("Close")}</>}
            onClick={() => redirectModal()}
          >
            {t("Close")}
          </ClickButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default CompanyCreation;
