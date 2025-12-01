import React, { useState } from "react";
import { Col, Container, Row, Alert, Modal } from "react-bootstrap";
import { TextInputForm, DropDownUI } from "../../components/Forms";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { ClickButton, Delete } from "../../components/ClickButton";
import Select from "react-select";
import PageNav from "../../components/PageNav";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_DOMAIN from "../../config/config";
import { useLanguage } from "../../components/LanguageContext"; // Adjust path

const SchemeCreation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData } = location.state || {};
  const initialState =
    type === "edit"
      ? { ...rowData }
      : {
          id: "",
          scheme_name: "",
          duration: "",
          duration_unit: "",
          schemet_due_amount: "",
          scheme_bonus: "",
          scheme_maturtiy_amount: "",
        };
  const [formData, setFormData] = useState(initialState);

  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const durationOptions = [
    { value: "month", title: t("Month") },
    { value: "week", title: t("Week") },
  ];

  const redirectModal = () => {
    navigate("/console/master/scheme");
  };

  // const handleChange = (e, fieldName) => {
  //   const value = e.target ? e.target.value : e.value;

  //   setFormData({
  //     ...formData,
  //     [fieldName]: value,
  //   });
  // };

  // Function to calculate maturity amount
  const calculateMaturityAmount = (currentFormData) => {
    const duration = parseFloat(currentFormData.duration) || 0;
    const dueAmount = parseFloat(currentFormData.schemet_due_amount) || 0;
    const bonus = parseFloat(currentFormData.scheme_bonus) || 0;
    const totalDuesAmount = duration * dueAmount;
    const maturityAmount = totalDuesAmount + bonus;
    return maturityAmount.toFixed(2);
  };

  const handleChange = (e, fieldName) => {
    const newValue = e.target.value;
    const newFormData = {
      ...formData,
      [fieldName]: newValue,
    };
    if (
      ["duration", "schemet_due_amount", "scheme_bonus"].includes(fieldName)
    ) {
      const updatedMaturityAmount = calculateMaturityAmount(newFormData);
      setFormData({
        ...newFormData,
        scheme_maturtiy_amount: updatedMaturityAmount,
      });
    } else {
      setFormData(newFormData);
    }
  };
  const userTitleSegment =
    type === "view"
      ? ` ${t("view")}`
      : type === "edit"
      ? ` ${t("Edit")}`
      : ` ${t("Creation")}`;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_DOMAIN}/scheme_api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          action: "create",
        }),
      });

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
          navigate("/console/master/scheme");
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
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/scheme_api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          id: rowData.id,
          scheme_name: formData.scheme_name,
          schemet_due_amount: formData.schemet_due_amount,
          scheme_bonus: formData.scheme_bonus,
          scheme_maturtiy_amount: formData.scheme_maturtiy_amount,
          duration_unit: formData.duration_unit,
          duration: formData.duration,
        }),
      });

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
          navigate("/console/master/scheme");
        }, 2000);
        setLoading(false);
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
      }
    } catch (error) {
      console.error("Error updating product:", error.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
            {/* 3. Apply translation to the PageNav title */}
            <PageNav pagetitle={`${t("Scheme")}${userTitleSegment}`}></PageNav>
          </Col>

          <Col lg="3" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Scheme Name")}
                labelname={t("Scheme Name")}
                name="scheme_name"
                value={formData.scheme_name}
                onChange={(e) => handleChange(e, "scheme_name")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Scheme Name")}
                labelname={t("Scheme Name")}
                name="scheme_name"
                value={
                  type === "view" ? rowData.scheme_name : formData.scheme_name
                }
                onChange={(e) => handleChange(e, "scheme_name")}
              ></TextInputForm>
            )}
          </Col>
          <Col lg="3" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Duration")}
                labelname={t("Duration")}
                name="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange(e, "duration")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Duration")}
                labelname={t("Duration")}
                name="duration"
                type="number"
                value={type === "view" ? rowData.duration : formData.duration}
                onChange={(e) => handleChange(e, "duration")}
              ></TextInputForm>
            )}
          </Col>
          <Col lg="3" md="6" xs="12" className="py-3">
            <label className="form-label" htmlFor="duration_unit">
              {t("Duration Unit")}
            </label>
            <Select
              options={durationOptions.map((opt) => ({
                value: opt.value,
                label: opt.title,
              }))}
              value={
                durationOptions.length > 0
                  ? durationOptions
                      .map((opt) => ({ value: opt.value, label: opt.title }))
                      .find(
                        (option) =>
                          option.value ===
                          (type === "view"
                            ? rowData.duration_unit
                            : formData.duration_unit)
                      )
                  : null
              }
              onChange={(selectedOption) => {
                handleChange(
                  { target: { value: selectedOption.value } },
                  "duration_unit"
                );
              }}
              placeholder={t("Select Unit")}
              isDisabled={type === "view"}
            />
          </Col>
          <Col lg="3" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Scheme Due Amount")}
                labelname={t("Scheme Due Amount")}
                type="number"
                name="schemet_due_amount"
                value={formData.schemet_due_amount}
                onChange={(e) => handleChange(e, "schemet_due_amount")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Scheme Due Amount")}
                labelname={t("Scheme Due Amount")}
                name="schemet_due_amount"
                type="number"
                value={
                  type === "view"
                    ? rowData.schemet_due_amount
                    : formData.schemet_due_amount
                }
                onChange={(e) => handleChange(e, "schemet_due_amount")}
              ></TextInputForm>
            )}
          </Col>
          <Col lg="3" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Bonus Amount")}
                labelname={t("Bonus Amount")}
                type="number"
                name="scheme_bonus"
                value={formData.scheme_bonus}
                onChange={(e) => handleChange(e, "scheme_bonus")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Bonus Amount")}
                labelname={t("Bonus Amount")}
                type="number"
                name="scheme_bonus"
                value={
                  type === "view" ? rowData.scheme_bonus : formData.scheme_bonus
                }
                onChange={(e) => handleChange(e, "scheme_bonus")}
              ></TextInputForm>
            )}
          </Col>

          <Col lg="3" md="6" xs="12" className="py-3">
            <TextInputForm
              placeholder={t("Maturity Amount")}
              labelname={t("Maturity Amount")}
              name="scheme_maturtiy_amount"
              type="number"
              readOnly
              value={
                type === "view"
                  ? rowData.scheme_maturtiy_amount
                  : formData.scheme_maturtiy_amount
              }
            ></TextInputForm>
          </Col>
          {/* <Col lg="3" md="6" xs="12" className="py-3">
            {type === "edit" ? (
              <TextInputForm
                placeholder={t("Maturity Amount")}
                labelname={t("Maturity Amount")}
                name="scheme_maturtiy_amount"
                value={formData.scheme_maturtiy_amount}
                onChange={(e) => handleChange(e, "scheme_maturtiy_amount")}
              ></TextInputForm>
            ) : (
              <TextInputForm
                placeholder={t("Maturity Amount")}
                labelname={t("Maturity Amount")}
                name="scheme_maturtiy_amount"
                value={
                  type === "view"
                    ? rowData.scheme_maturtiy_amount
                    : formData.scheme_maturtiy_amount
                }
                onChange={(e) => handleChange(e, "scheme_maturtiy_amount")}
              ></TextInputForm>
            )}
          </Col>
        */}

          <Col lg="12" md="12" xs="12" className="py-5 align-self-center">
            <div style={{ textAlign: "right", paddingRight: "5px" }}>
              {type === "view" ? (
                <ClickButton
                  label={<>{t("Back")}</>} // 4. Apply t() (Capitalized for key consistency)
                  onClick={() => navigate("/console/master/scheme")}
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
                  {type === "edit" ? (
                    <>
                      <span className="mx-2">
                        <ClickButton
                          label={<>{t("Update")}</>} // 4. Apply t()
                          onClick={handleUpdateSubmit}
                        ></ClickButton>
                      </span>

                      <span className="mx-2">
                        <Delete
                          label={<>{t("Cancel")}</>} // 4. Apply t()
                          onClick={() => navigate("/console/master/scheme")}
                        ></Delete>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mx-2">
                        <ClickButton
                          label={
                            loading ? (
                              <>{t("Submitting...")}</>
                            ) : (
                              <>{t("Submit")}</>
                            )
                          } // 4. Apply t()
                          onClick={handleSubmit}
                          disabled={loading}
                        ></ClickButton>
                      </span>
                      <span className="mx-2">
                        <Delete
                          label={t("Cancel")} // 4. Apply t()
                          onClick={() => navigate("/console/master/scheme")}
                        ></Delete>
                      </span>
                    </>
                  )}
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
          <p>{t("User saved successfully!")}</p>
        </Modal.Body>
        <Modal.Footer>
          <ClickButton
            variant="secondary"
            label={<> Close</>}
            onClick={() => redirectModal()}
          >
            {t("Close")}
          </ClickButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchemeCreation;
