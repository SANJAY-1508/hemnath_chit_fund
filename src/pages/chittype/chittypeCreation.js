import React, { useState } from "react";
import { Col, Container, Row, Alert, Modal } from "react-bootstrap";
import { TextInputForm, DropDownUI } from "../../components/Forms";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { ClickButton,Delete } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_DOMAIN from "../../config/config";
import { useLanguage } from "../../components/LanguageContext"; // Adjust path


const ChitTypeCreation = () => {
   const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData } = location.state || {};
  const initialState =
    type === "edit"
      ? { ...rowData }
      : {
         chit_type:"",
        };
  const [formData, setFormData] = useState(initialState);
  console.log(formData);
   const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

 
  const redirectModal = () => {
    navigate("/console/master/chittype");
  };

  const handleChange = (e, fieldName) => {
    const value = e.target ? e.target.value : e.value;

    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const userTitleSegment = 
    type === "view"
      ? ` ${t("view")}`
      : type === "edit"
      ? ` ${t("Edit")}`
      : ` ${t("Creation")}`;
 
  const handleSubmit = async () => {
    console.log("6754776");
    try {
      setLoading(true);
      
      const response = await fetch(`${API_DOMAIN}/chittype.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log(formData);
      const responseData = await response.json();

      console.log(responseData);

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
          navigate("/console/master/chittype");
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
    console.log("Inside handleUpdateSubmit");
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chittype.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          edit_chit_type_id: rowData.chit_type_id,
          chit_type: formData.chit_type,
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
          navigate("/console/master/chittype");
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
        <PageNav
          pagetitle={`${t("Chit Type")}${userTitleSegment}`}
        ></PageNav>
      </Col>

          <Col lg="4" md="6" xs="12" className="py-3">
        {type === "edit" ? (
          <TextInputForm
            placeholder={t("Chit Type Name")} 
            labelname={t("Chit Type Name")} 
            name="chit_type"
            value={formData.chit_type}
            onChange={(e) => handleChange(e, "chit_type")}
          ></TextInputForm>
        ) : (
          <TextInputForm
            placeholder={t("Chit Type Name")} 
            labelname={t("Chit Type Name")} 
            name="chit_type"
            value={type === "view" ? rowData.chit_type : formData.chit_type}
            onChange={(e) => handleChange(e, "chit_type")}
          ></TextInputForm>
        )}
      </Col>
     

         <Col lg="12" md="12" xs="12" className="py-5 align-self-center">
        <div style={{ textAlign: "right", paddingRight: "5px" }}>
          {type === "view" ? (
            <ClickButton
              label={<>{t("Back")}</>} // 4. Apply t() (Capitalized for key consistency)
              onClick={() => navigate("/console/user")}
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
                      onClick={() => navigate("/console/master/chittype")}
                    ></Delete>
                  </span>
                </>
              ) : (
                <>
                  <span className="mx-2">
                    <ClickButton
                      label={loading ? <>{t("Submitting...")}</> : <>{t("Submit")}</>} // 4. Apply t()
                      onClick={handleSubmit}
                      disabled={loading}
                    ></ClickButton>
                  </span>
                  <span className="mx-2">
                    <Delete
                      label={t("Cancel")} // 4. Apply t()
                      onClick={() => navigate("/console/master/chittype")}
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

export default ChitTypeCreation;
