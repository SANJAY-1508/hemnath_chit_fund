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


const UserCreation = () => {
   const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData } = location.state || {};
  const initialState =
    type === "edit"
      ? {
       
          name: rowData.name || "",     
          role: rowData.role || "",           
          phone_number: rowData.phone || "",
          user_name: rowData.user_name ||"",
          password: rowData.password || "",   
          nickname: rowData.nickname || "",   
        }
      : {
          name: "",
          role: "",
          phone_number: "",
          user_name: "",
          password: "",
          nickname: "",
        };
  const [formData, setFormData] = useState(initialState);
   const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

  //Role dropdrown
  const DropList = [
    {
      value: "Admin",
      label: t("Admin"), 
    },
    {
      value: "Super admin",
      label: t("Super admin"), 
    },
    {
      value: "Employee",
      label: t("Employee"), 
    },
  ];

  const redirectModal = () => {
    navigate("/console/user");
  };

  const handleChange = (e, fieldname) => {
    const value = e.target ? e.target.value : e.value;

    setFormData({
      ...formData,
      [fieldname]: value,
    });
  };

  const userTitleSegment = 
    type === "view"
      ? ` ${t("view")}`
      : type === "edit"
      ? ` ${t("Edit")}`
      : ` ${t("Creation")}`;
 
  const handleSubmit = async () => {
    for (const key in formData) {
      if (formData[key] === "") {
        toast.error(`${key} cannot be empty!`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        return; 
      }
    }
    try {
      setLoading(true);
      const phoneNumber = formData.phone_number;
      if (!/^\d{10}$/.test(phoneNumber)) {
        toast.error("phone number must be a 10-digit number!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        return;
        setLoading(false);
      }
      
      const requestBody = {
      
        name:formData.name,
        user_name: formData.user_name,         
        phone_number: formData.phone_number, 
        password: formData.password,       
        role: formData.role,             
        user_profile_img: "", 
      };
      
      const response = await fetch(`${API_DOMAIN}/users.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), 
      });
      console.log("userssss");
      console.log(JSON.stringify(requestBody)); 
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
          navigate("/console/user");
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
      const response = await fetch(`${API_DOMAIN}/users.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
          edit_user_id: rowData.user_id,
          name:formData.name,
          user_name: formData.user_name,        
          phone_number: formData.phone_number, 
          password: formData.password,     
          role: formData.role,             
          user_profile_img: "",           
         
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
          navigate("/console/user");
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
          pagetitle={`${t("User")}${userTitleSegment}`}
        ></PageNav>
      </Col>

          <Col lg="4" md="6" xs="12" className="py-3">
        {type === "edit" ? (
          <TextInputForm
            placeholder={t("name")} 
            labelname={t("name")} 
            name="name"
            value={formData.name}
            onChange={(e) => handleChange(e, "name")}
          ></TextInputForm>
        ) : (
          <TextInputForm
            placeholder={t("name")} 
            labelname={t("name")} 
            name="name"
            value={type === "view" ? rowData.name : formData.name}
            onChange={(e) => handleChange(e, "name")}
          ></TextInputForm>
        )}
      </Col>
          <Col lg="4" md="6" xs="12" className="py-3">
        {type === "edit" ? (
          <DropDownUI
            optionlist={DropList}
            placeholder={t("role")}
            labelname={t("role")} 
            name="role"
            value={formData.role}
            onChange={(updatedFormData) =>
              setFormData({
                ...formData,
                role: updatedFormData.role,
              })
            }
          />
        ) : (
          <DropDownUI
            optionlist={DropList}
            placeholder={t("role")} // 4. Apply t()
            labelname={t("role")} // 4. Apply t()
            name="role"
            value={
              type === "view"
                ? rowData.role
                : formData.role
            }
            onChange={(updatedFormData) =>
              setFormData({
                ...formData,
                role: updatedFormData.role,
              })
            }
          />
        )}
      </Col>
         <Col lg="4" md="12" xs="12" className="py-3">
        {type === "edit" ? (
          <TextInputForm
            placeholder={t("phone number")}
            type={"number"}
            labelname={t("phone number")} 
            name="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleChange(e, "phone_number")}
          ></TextInputForm>
        ) : (
          <TextInputForm
            placeholder={t("phone number")} 
            type={"number"}
            labelname={t("phone number")} 
            name="phone_number"
            value={
              type === "view"
                ? rowData.phone_number
                : formData.phone_number
            }
            onChange={(e) => handleChange(e, "phone_number")}
          ></TextInputForm>
        )}
      </Col>
          <Col lg="3" md="6" xs="12" className="py-3">
        {type === "edit" ? (
          <TextInputForm
            placeholder={t("User Name")} 
            labelname={t("User Name")} 
            name="user_name"
            value={formData.user_name}
            onChange={(e) => handleChange(e, "user_name")}
          ></TextInputForm>
        ) : (
          <TextInputForm
            placeholder={t("User Name")}
            labelname={t("User Name")}
            name="user_name"
            value={type === "view" ? rowData.user_name : formData.user_name}
            onChange={(e) => handleChange(e, "user_name")}
          ></TextInputForm>
        )}
      </Col>
          <Col lg="3" md="6" xs="12" className="py-3">
        {type === "edit" ? (
          <TextInputForm
            placeholder={t("Nick Name")} 
            labelname={t("Nick Name")} 
            value={formData.nickname}
            onChange={(e) => handleChange(e, "nickname")}
          ></TextInputForm>
        ) : (
          <TextInputForm
            placeholder={t("Nick Name")} 
            labelname={t("Nick Name")}
            name="nickname"
            value={type === "view" ? rowData.nickname : formData.nickname}
            onChange={(e) => handleChange(e, "nickname")}
          ></TextInputForm>
        )}
      </Col>
         <Col lg="3" md="6" xs="12" className="py-3">
        {type === "view" ? null : (
          <TextInputForm
            placeholder={t("password")}
            suffix_icon={
              showPassword ? (
                <VscEye onClick={() => setShowPassword(false)} />
              ) : (
                <VscEyeClosed onClick={() => setShowPassword(true)} />
              )
            }
            labelname={t("password")}
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={(e) => handleChange(e, "password")}
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
                      onClick={() => navigate("/console/user")}
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
                      onClick={() => navigate("/console/user")}
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

export default UserCreation;
