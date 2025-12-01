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
import { useLanguage } from "../../components/LanguageContext";

const CompanyCreation = () => {
  const { t } = useLanguage();

  const location = useLocation();
  const { type, rowData } = location.state || {};
  console.log("rowData", rowData);
  const initialState =
    type === "edit"
      ? { ...rowData }
      : {
          company_name: "",
          address: "",
          phone: "",
          mobile: "",
          gst_no: "",
          city: "",
          pincode: "",
          state: "",
          acc_number: "",
          acc_holder_name: "",
          bank_name: "",
          ifsc_code: "",
          bank_branch: "",
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

    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        company_name: formData.company_name,
        address: formData.address,
        pincode: formData.pincode,
        phone_number: formData.phone,
        mobile_number: formData.mobile,
        gst_number: formData.gst_no,
        state: formData.state,
        city: formData.city,
        acc_number: formData.acc_number,
        acc_holder_name: formData.acc_holder_name,
        bank_name: formData.bank_name,
        ifsc_code: formData.ifsc_code,
        bank_branch: formData.bank_branch,
        company_profile_img: "",
      };
      console.log("Payload:", payload);

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

          {/* Address Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Address")}
                labelname={t("Address")}
                name="address"
                value={formData.address}
                onChange={(e) => handleChange(e, "address")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Address")}
                labelname={t("Address")}
                name="address"
                value={type === "view" ? rowData.address : formData.address}
                onChange={(e) => handleChange(e, "address")}
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

          {/* Phone Number Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Phone Number")}
                type={"text"}
                labelname={t("Phone Number")}
                name="phone"
                value={formData.phone}
                onChange={(e) => handleChange(e, "phone")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Phone Number")}
                type={"text"}
                labelname={t("Phone Number")}
                name="phone"
                value={type === "view" ? rowData.phone : formData.phone}
                onChange={(e) => handleChange(e, "phone")}
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
                onChange={(e) => handleChange(e, "gst_no")}
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

          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("State")} // ✅
                type={"text"}
                labelname={t("State")} // ✅
                name="state"
                value={formData.state}
                onChange={(e) => handleChange(e, "state")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("State")} // ✅
                type={"text"}
                labelname={t("State")} // ✅
                name="state"
                value={type === "view" ? rowData.state : formData.state}
                onChange={(e) => handleChange(e, "state")}
              ></TextInputForm>
            )}
          </Col>

          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Account Number")} // ✅
                type={"Number"}
                labelname={t("Account Number")} // ✅
                name="acc_number"
                value={formData.acc_number}
                onChange={(e) => handleChange(e, "acc_number")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Account Number")} // ✅
                type={"Number"}
                labelname={t("Account Number")} // ✅
                name="acc_number"
                value={
                  type === "view" ? rowData.acc_number : formData.acc_number
                }
                onChange={(e) => handleChange(e, "acc_number")}
              ></TextInputForm>
            )}
          </Col>

          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Bank Name")} // ✅
                type={"text"}
                labelname={t("Bank Name")} // ✅
                name="bank_name"
                value={formData.bank_name}
                onChange={(e) => handleChange(e, "bank_name")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Bank Name")} // ✅
                type={"text"}
                labelname={t("Bank Name")} // ✅
                name="bank_name"
                value={type === "view" ? rowData.bank_name : formData.bank_name}
                onChange={(e) => handleChange(e, "bank_name")}
              ></TextInputForm>
            )}
          </Col>

          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Account Holder Name")} // ✅
                type={"text"}
                labelname={t("Account Holder Name")} // ✅
                name="acc_holder_name"
                value={formData.acc_holder_name}
                onChange={(e) => handleChange(e, "acc_holder_name")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Account Holder Name")} // ✅
                type={"text"}
                labelname={t("Account Holder Name")} // ✅
                name="acc_holder_name"
                value={
                  type === "view"
                    ? rowData.acc_holder_name
                    : formData.acc_holder_name
                }
                onChange={(e) => handleChange(e, "acc_holder_name")}
              ></TextInputForm>
            )}
          </Col>

          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("IFSC Code")} // ✅
                type={"text"}
                labelname={t("IFSC Code")} // ✅
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => handleChange(e, "ifsc_code")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("IFSC Code")} // ✅
                type={"text"}
                labelname={t("IFSC Code")} // ✅
                name="ifsc_code"
                value={type === "view" ? rowData.ifsc_code : formData.ifsc_code}
                onChange={(e) => handleChange(e, "ifsc_code")}
              ></TextInputForm>
            )}
          </Col>

          {/* Bank Branch Field */}
          <Col lg="4" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Bank Branch")}
                type={"text"}
                labelname={t("Bank Branch")}
                name="bank_branch"
                value={formData.bank_branch}
                onChange={(e) => handleChange(e, "bank_branch")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Bank Branch")}
                type={"text"}
                labelname={t("Bank Branch")}
                name="bank_branch"
                value={
                  type === "view" ? rowData.bank_branch : formData.bank_branch
                }
                onChange={(e) => handleChange(e, "bank_branch")}
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
          <p>{t("Company saved successfully!")}</p>
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
