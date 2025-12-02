import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { TextInputForm } from "../components/Forms";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { ClickButton } from "../components/ClickButton";
import API_DOMAIN from "../config/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Consolidated validation for empty fields
      if (!username.trim() || !password.trim()) {
        throw new Error("Username and password are required");
      }

      const loginData = {
        phone: username,
        password: password,
      };

      const response = await fetch(`${API_DOMAIN}/users.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const responseData = await response.json();

      if (responseData.head.code === 400) {
        setError(responseData.head.msg);
      } else if (responseData.head.code === 200) {
        // Call parent callback to handle login state
        onLogin();

        // Save login data to localStorage for persistence
        localStorage.setItem("user", JSON.stringify(responseData.body.user));

        toast.success("Successfully login!", {
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
          navigate("/console/dashboard");
        }, 2000);
      } else {
        setError(responseData.head.msg);
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="login-bg">
      <Container fluid className="px-5 pad">
        <Row className="justify-content-center">
          <Col lg="3" md="6" xs="12" className="align-self-center p-0 m-0">
            <div className="shadow login-box">
              <div className="text-center py-3">
                <img
                  src={require("../components/sidebar/images/logo1.png")}
                  className="img-fluid logo"
                  alt="Tirupathi Balaji"
                />
              </div>

              <div className="py-3">
                <TextInputForm
                  placeholder={"User Name"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="py-3">
                <TextInputForm
                  placeholder={"Password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suffix_icon={
                    showPassword ? (
                      <VscEye onClick={() => setShowPassword(false)} />
                    ) : (
                      <VscEyeClosed onClick={() => setShowPassword(true)} />
                    )
                  }
                />
              </div>
              <div className="py-3 text-center">
                <ClickButton label={<>Login</>} onClick={handleLogin} />
              </div>
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
              {error && <Alert variant="danger">{error}</Alert>}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
