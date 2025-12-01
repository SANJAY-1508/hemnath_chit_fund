import React, { useState, useEffect } from "react";
import {
  Col,
  Container,
  Row,
  Alert,
  Modal,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import { ClickButton, Delete } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_DOMAIN from "../../config/config";
import Select from "react-select";
import { useLanguage } from "../../components/LanguageContext";

const ChitCreation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData, duesData: passedDuesData } = location.state || {};
  console.log("type", type);
  console.log("rowData", rowData);
  console.log("passedDuesData", passedDuesData);
  const { chit_id, ...otherRowData } = rowData || {};
  const [duesData, setDuesData] = useState(passedDuesData || []);

  const initialState =
    type === "edit" || type === "view"
      ? {
          ...otherRowData,
          // scheme_id: rowData.scheme_id,
          // customer_id: rowData.customer_id,
          // start_date: rowData.start_date,
        }
      : {
          scheme_id: "",
          customer_id: "",
          start_date: "",
        };

  const [formData, setFormData] = useState(initialState);
  console.log("formdata values", formData);
  const [fromDate, setFromDate] = useState("");
  const [customerOptions, setCustomerOptions] = useState([]);
  const [schemeOptions, setSchemeOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedSchemeOption, setSelectedSchemeOption] = useState(null);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [dueToPay, setDueToPay] = useState(null); 
  // ...
  const navigate = useNavigate();
  const chitNumber = rowData?.chit_no || "";

  

  // --- Handlers ---
  const redirectModal = () => {
    navigate("/console/master/chit");
  };

  const handleCustomerChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({ ...formData, customer_id: selectedOption.value });
      setSelectedCustomer(selectedOption.fullData);
      setSelectedCustomerOption(selectedOption);
    } else {
      setFormData({ ...formData, customer_id: "" });
      setSelectedCustomer(null);
      setSelectedCustomerOption(null);
    }
  };

  const handleSchemeChange = (selectedOption) => {
    if (selectedOption) {
      console.log("selectedOption", selectedOption);
      setFormData({ ...formData, scheme_id: selectedOption.value });
      setSelectedScheme(selectedOption.fullData);
      setSelectedSchemeOption(selectedOption);
    } else {
      setFormData({ ...formData, scheme_id: "" });
      setSelectedScheme(null);
      setSelectedSchemeOption(null);
    }
  };


  const handleOpenPayment = (record) => {
    setDueToPay(record);
    setShowConfirmationModal(true);
  };

 const handlePaymentSubmit = async () => {
    const payload = {
      action: "pay_due", 
      due_id: dueToPay.id, 
      amount: parseFloat(dueToPay.due_amount), 
    };
    
    console.log("Payment Payload:", payload);
    console.log("Due to Pay:", dueToPay);

    try {
      setLoading(true);
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let resData;
      try {
        let cleanText = text.trim();
        if (cleanText.endsWith("[]")) {
          cleanText = cleanText.slice(0, -2).trim();
        }
        resData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("Invalid JSON response:", text);
        throw new Error("Invalid response format from server");
      }

      setLoading(false);
      if (resData.head && resData.head.code === 200) {
        toast.success(resData.head.msg || "Payment successful");
        setShowConfirmationModal(false); 

        setDuesData(prevDuesData => {
            return prevDuesData.map(due => {
                if (due.id === dueToPay.id) {
                    return {
                        ...due,
                        status: 'paid', 
                        paid_amount: dueToPay.due_amount, 
                    };
                }
                return due; 
            });
        });
        setDueToPay(null); 

      } else {
        toast.error(resData.head?.msg || "Payment failed");
      }

    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred during payment.");
    } finally {
      setLoading(false);
    }
};
  
  const handleSubmit = async () => {
    const payload = {
      action: "create_chit",
      customer_id: formData.customer_id,
      scheme_id: formData.scheme_id,
      start_date: fromDate,
    };
    try {
      setLoading(true);
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg, {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
        setTimeout(() => {
          navigate("/console/master/chit");
        }, 2000);
      } else {
        toast.error(responseData.head.msg, {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during submission.", {
        position: "top-center",
      });
    }
    setLoading(false);
  };

  // --- Fetch Data Functions ---

  const fetchDataCustomer = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });
      const responseData = await response.json();
      console.log(responseData);
      if (responseData.head.code === 200) {
        const options = responseData.body.customer.map((cust) => ({
          value: cust.customer_id.toString(),
          label: cust.customer_name,
          fullData: cust,
        }));
        setCustomerOptions(options);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error.message);
    }
  };

  const fetchScheme = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/scheme_api.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        const options = responseData.body.schemes.map((item) => ({
          value: item.scheme_id.toString(),
          label: item.scheme_name,
          fullData: item,
        }));

        setSchemeOptions(options);
      }
    } catch (error) {
      console.error("Error fetching chit type data:", error.message);
    }
  };

  //USEEFECT FUNCTION
  useEffect(() => {
    fetchDataCustomer();
    fetchScheme();
  }, []);

  useEffect(() => {
    console.log("Type:", type, "Row Data:", rowData);
    if ((type === "edit" || type === "view") && rowData) {
      if (customerOptions.length > 0 && rowData.customer_id) {
        console.log("Target Customer ID:", rowData.customer_id);
        const targetId = Number(rowData.customer_id);
        const preSelectedCust = customerOptions.find(
          (opt) => Number(opt.fullData.id) === targetId
        );
        console.log("Customer Options:", customerOptions);
        console.log("Pre-selected Customer:", preSelectedCust);
        if (preSelectedCust) {
          setSelectedCustomer(preSelectedCust.fullData);
          setSelectedCustomerOption(preSelectedCust);
        }
      }
      if (schemeOptions.length > 0 && rowData.scheme_id) {
        const targetSchemeId = Number(rowData.scheme_id);

        const preSelectedScheme = schemeOptions.find(
          (opt) => Number(opt.fullData.id) === targetSchemeId
        );

        if (preSelectedScheme) {
          setSelectedScheme(preSelectedScheme.fullData);
          setSelectedSchemeOption(preSelectedScheme);
        }
      }
      if (rowData.start_date) {
        setFromDate(rowData.start_date);
      }
    }
  }, [type, rowData, customerOptions, schemeOptions]);

  const userTitleSegment =
    type === "view"
      ? ` ${t("view")}`
      : type === "edit"
      ? ` ${t("Edit")}`
      : ` ${t("Creation")}`;
  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
            <PageNav pagetitle={`${t("Chit")}${userTitleSegment}`} />
          </Col>

          <Col md="2" className="py-2">
            <Form.Group controlId="fromDate">
              <Form.Label className="mb-3">Start Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col lg="4" md="12" xs="12" className="py-3">
            <div className="mb-4">
              <label htmlFor="customer-select" className="mb-2">
                {t("Customer Name")}
              </label>
              <Select
                id="customer-select"
                placeholder={t("Select Customer")}
                isSearchable={true}
                options={customerOptions}
                onChange={handleCustomerChange}
                value={selectedCustomerOption}
                isDisabled={type === "edit" || type === "view"}
              />
            </div>
            {selectedCustomer && (
              <Card
                className="shadow border-0"
                style={{ borderRadius: "10px" }}
              >
                <Card.Body className="p-4">
                  <h6
                    className="text-center mb-4"
                    style={{ fontWeight: "bold", color: "#333" }}
                  >
                    Customer Information
                  </h6>

                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Customer No:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedCustomer.customer_no || "-"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Name:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedCustomer.customer_name}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Email ID:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {selectedCustomer.email_id}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Mobile Number:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedCustomer.mobile_number}
                    </span>
                  </div>
                  {/* <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                     Place:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedCustomer.place || "-"}
                    </span>
                  </div> */}
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg="4" md="12" xs="12" className="py-3">
            <div className="mb-4">
              <label htmlFor="chittype-select" className="mb-2">
                {t("Scheme Type")}
              </label>
              <Select
                id="chittype-select"
                placeholder={t("Select Scheme Type")}
                isSearchable={true}
                options={schemeOptions}
                onChange={handleSchemeChange}
                value={selectedSchemeOption}
                isDisabled={type === "edit" || type === "view"}
              />
            </div>
            {selectedScheme && (
              <Card
                className="shadow border-0"
                style={{ borderRadius: "10px" }}
              >
                <Card.Body className="p-4">
                  <h6
                    className="text-center mb-4"
                    style={{ fontWeight: "bold", color: "#333" }}
                  >
                    Scheme Information
                  </h6>

                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Scheme ID:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedScheme.scheme_id || "-"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Scheme Name:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedScheme.scheme_name}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Duration:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {selectedScheme.duration}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Due Amount:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {selectedScheme.schemet_due_amount}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Bonus Amount:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedScheme.scheme_bonus}
                    </span>
                  </div>
                  {/* 
                   <div className="d-flex justify-content-between">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Maturity Amount:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedScheme.scheme_maturtiy_amount}
                    </span>
                  </div> */}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* ⭐ 4. DUE PAYMENT TABLE (Only visible in edit mode with data) */}
          {(type === "edit" || type === "view") && duesData.length > 0 && (
            <Col lg={12} md={12} xs={12} className="mt-4">
              <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light" align="center">
                  {t("Current Due Payment Details")}{" "}
                  {chitNumber && `- ${chitNumber}`}
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead className="thead-dark">
                        <tr>
                          <th>{t("Chit ID")}</th>
                          <th>{t("Due Date")}</th>
                          <th>{t("Due Number")}</th>
                          <th>{t("Due Amount")}</th>
                          <th>{t("Paid Amount")}</th>
                          <th>{t("Status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duesData.map((record, index) => (
                          <tr key={index}>
                            <td>
                              {record.chit_id ? `${record.chit_id}` : "N/A"}
                            </td>
                            <td>
                              {record.due_date
                                ? new Date(record.due_date).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td>
                              {record.due_number ? `${record.due_number}` : "N/A"}
                            </td>
                            <td>
                              {record.due_amount
                                ? `₹${record.due_amount}`
                                : "N/A"}
                            </td>

                            <td>
                              {record.paid_amount
                                ? `₹${record.paid_amount}`
                                : "N/A"}
                            </td>

                            <td>
                              {record.status === "paid" ? (
                                <span className="badge bg-success">
                                  {record.status || t("N/A")}
                                </span>
                              ) : (
                                <span
                                  className="badge bg-warning"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    if (type !== "view") {
                                      handleOpenPayment(record);
                                    }
                                  }}
                                >
                                  {record.status || t("N/A")}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
          <Col lg="12" md="12" xs="12" className="py-5 align-self-center">
            <div style={{ textAlign: "right", paddingRight: "5px" }}>
              {type === "view" ? (
                <ClickButton
                  label={<>{t("Back")}</>}
                  onClick={() => navigate("/console/master/chit")}
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
                          label={<>{t("Update")}</>}
                          // onClick={handleUpdateSubmit}
                        ></ClickButton>
                      </span>

                      <span className="mx-2">
                        <Delete
                          label={<>{t("Cancel")}</>}
                          onClick={() => navigate("/console/master/chit")}
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
                          }
                          onClick={handleSubmit}
                          disabled={loading}
                        ></ClickButton>
                      </span>
                      <span className="mx-2">
                        <Delete
                          label={t("Cancel")}
                          onClick={() => navigate("/console/master/chit")}
                        ></Delete>
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="error-alert">
            {error}
          </Alert>
        )}

        {/* Success Modal */}
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
            <p>{t("Chit saved successfully!")}</p>
          </Modal.Body>
          <Modal.Footer>
            <ClickButton
              variant="secondary"
              label={<> {t("Close")}</>}
              onClick={() => redirectModal()}
            >
              {t("Close")}
            </ClickButton>
          </Modal.Footer>
        </Modal>

        {/* Payment Modal */}
        {/* ✅ NEW: Due Payment Confirmation Modal */}
        <Modal
          show={showConfirmationModal}
          onHide={() => {
            setShowConfirmationModal(false);
            setDueToPay(null);
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("Confirm Payment")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              {t("Do you want to proceed with the payment for Due No.")} 
              {dueToPay?.due_number}?
            </p>
            <p>
              {t("Due Amount")}:₹{dueToPay?.due_amount}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="none"
              onClick={() => {
                setShowConfirmationModal(false);
                setDueToPay(null);
              }}
              className="rounded-pill px-4 bg-danger text-white"
            >
              {t("Later")}
            </Button>
            <Button
              variant="primary"
              onClick={handlePaymentSubmit}
              className="rounded-pill px-4"
            >
              {t("Pay Now")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ChitCreation;
