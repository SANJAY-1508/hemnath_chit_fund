import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { TextInputForm } from "../../components/Forms";
import { ClickButton } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import API_DOMAIN from "../../config/config";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../components/LanguageContext";

const CustomerCreations = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData } = location.state || {};

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const initialState =
    type === "edit"
      ? {
          ...rowData,
          password: "",
        }
      : {
          customer_name: "",
          mobile_number: "",
          email_id: "",
          password: "",
        };

  const [formData, setFormData] = useState(initialState);
  console.log("Form Data:", formData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  // CREATE CUSTOMER ----------------------
  const handleSubmit = async () => {
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/customer_signup.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          action: "signup",
          created_by_id: user.user_id,
          created_by_name: user.name,
        }),
      });

      const data = await response.json();

      if (data.head.code === 200) {
        toast.success(data.head.msg);
        setTimeout(() => navigate("/console/master/customer"), 1500);
      } else {
        toast.error(data.head.msg);
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE CUSTOMER ----------------------
  const handleUpdateSubmit = async () => {
    setLoading(true);

    let updatePayload = {
      edit_customer_id: rowData.customer_id,
      customer_name: formData.customer_name,
      mobile_number: String(formData.mobile_number),
      email_id: formData.email_id,
      password: formData.password,
      created_by_id: user.user_id,
      created_by_name: user.name,
    };
    console.log("Update Payload:", updatePayload);
    // Only send password if user entered something
    if (formData.password.trim() !== "") {
      updatePayload.password = formData.password;
    }

    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();
      if (data.head.code === 200) {
        toast.success(data.head.msg);
        setTimeout(() => navigate("/console/master/customer"), 1500);
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
                type === "view"
                  ? t("Customer View")
                  : type === "edit"
                  ? t("Customer Edit")
                  : t("Customer Creation")
              }
            />
          </Col>

          {type !== "create" && (
            <Col lg="3" md="4" xs="12" className="py-3">
              <TextInputForm
                labelname={t("Customer No")}
                value={formData.customer_no}
                disabled
              />
            </Col>
          )}

          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              labelname={t("Customer Name")}
              name="customer_name"
              value={formData.customer_name}
              onChange={(e) => handleChange(e, "customer_name")}
            />
          </Col>

          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              labelname={t("Mobile Number")}
              name="mobile_number"
              value={formData.mobile_number}
              onChange={(e) => handleChange(e, "mobile_number")}
            />
          </Col>

          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              type="password"
              labelname={t("Password")}
              name="password"
              value={formData.password}
              onChange={(e) => handleChange(e, "password")}
            />
          </Col>

          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              labelname={t("Email ID")}
              name="email_id"
              value={formData.email_id}
              onChange={(e) => handleChange(e, "email_id")}
            />
          </Col>

          <Col lg="12" className="py-5 text-center">
            {type === "view" ? (
              <ClickButton label={t("Back")} onClick={() => navigate(-1)} />
            ) : type === "edit" ? (
              <>
                <ClickButton
                  label={loading ? t("Updating...") : t("Update")}
                  onClick={handleUpdateSubmit}
                />
                <span className="mx-2"></span>
                <ClickButton
                  label={t("Cancel")}
                  onClick={() => navigate("/console/master/customer")}
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
                  onClick={() => navigate("/console/master/customer")}
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

export default CustomerCreations;
