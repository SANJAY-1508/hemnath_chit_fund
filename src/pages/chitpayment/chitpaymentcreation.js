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

const Chitpaymentcreation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData, duesData: passedDuesData } = location.state || {};
  const { chit_id, ...otherRowData } = rowData || {};
  const [duesData, setDuesData] = useState(passedDuesData || []);
  const [paymentAmount, setPaymentAmount] = useState("");
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

  const user = JSON.parse(localStorage.getItem("user")) || {};

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

  const handlePaymentSubmit = async (amount) => {
    // Convert the amount input (which is a string) to a number
    const paymentValue = parseFloat(amount);

    // Check for valid payment amount logic BEFORE sending the request
    if (
      paymentValue <= 0 ||
      isNaN(paymentValue) ||
      paymentValue > dueToPay.due_amount
    ) {
      toast.error("Invalid payment amount.");
      return;
    }

    const payload = {
      action: "pay_due",
      due_id: dueToPay.id,
      amount: paymentValue, // Use the actual value from the input field
      created_by_id: user.user_id,
      created_by_name: user.name,
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

      // ... (Error handling and JSON parsing remains the same) ...

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
        setDuesData((prevDuesData) => {
          return prevDuesData.map((due) => {
            if (due.id === dueToPay.id) {
              const currentPaid = parseFloat(due.paid_amount || 0);
              const newPaidAmount = currentPaid + paymentValue;
              let newStatus = "pending";
              if (newPaidAmount >= parseFloat(due.due_amount)) {
                newStatus = "paid";
              } else if (
                newPaidAmount > 0 &&
                newPaidAmount < parseFloat(due.due_amount)
              ) {
                newStatus = "partial";
              } else if (newPaidAmount === 0) {
                newStatus = "pending";
              }
              return {
                ...due,
                status: newStatus,
                paid_amount: newPaidAmount.toFixed(2), // Use the actual new total paid amount
              };
            }
            return due;
          });
        });
        // --- 🎯 END CRITICAL FIX ---

        setDueToPay(null);
        setPaymentAmount(""); // Clear the input field after success
      } else {
        toast.error(resData.head?.msg || "Payment failed");
      }
    } catch (error) {
      // ... (Error catch remains the same)
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
      created_by_id: user.user_id,
      created_by_name: user.name,
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
    if ((type === "edit" || type === "view") && rowData) {
      if (customerOptions.length > 0 && rowData.customer_id) {
        const targetId = Number(rowData.customer_id);
        const preSelectedCust = customerOptions.find(
          (opt) => Number(opt.fullData.id) === targetId
        );

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
            <PageNav pagetitle={`${t("Chit Payment")}${userTitleSegment}`} />
          </Col>

          {type !== "edit" && type !== "view" && (
            <Col md="2" className="py-2">
              <Form.Group controlId="fromDate">
                <Form.Label className="mb-3">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  // The 'disabled' prop here is redundant if the whole Col is hidden,
                  // but it doesn't hurt to keep it for safety in case of future logic changes.
                  disabled={type === "edit" || type === "view"}
                />
              </Form.Group>
            </Col>
          )}

          {type !== "edit" && type !== "view" && (
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
            </Col>
          )}

          {type !== "edit" && type !== "view" && (
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
            </Col>
          )}

          <Row>
            <Col>
              <>
                {selectedCustomer &&
                  type !== "edit" &&
                  type !== "view" && ( // ADDED CONDITION HERE
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
                        {/* ... Customer Information Details ... */}
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
                        {/* ... other customer details ... */}
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
                      </Card.Body>
                    </Card>
                  )}
              </>
            </Col>
            <Col>
              <>
                {selectedScheme &&
                  type !== "edit" &&
                  type !== "view" && ( // ADDED CONDITION HERE
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
                        {/* ... Scheme Information Details ... */}
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
                        {/* ... other scheme details ... */}
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
                      </Card.Body>
                    </Card>
                  )}
              </>
            </Col>
          </Row>

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
                              {record.due_number
                                ? `${record.due_number}`
                                : "N/A"}
                            </td>
                            <td>
                              {record.due_amount && record.paid_amount
                                ? `₹${(
                                    parseFloat(record.due_amount) -
                                    parseFloat(record.paid_amount)
                                  ).toFixed(2)}`
                                : record.due_amount
                                ? `₹${record.due_amount}`
                                : "N/A"}
                            </td>

                            <td>
                              {record.paid_amount
                                ? `₹${record.paid_amount}`
                                : "N/A"}
                            </td>

                            <td>
                              {/* Check 1: Paid (Green Badge) */}
                              {record.status === "paid" ? (
                                <span className="badge bg-success">
                                  {record.status || t("N/A")}
                                </span>
                              ) :record.status ==="Waiting Approval" ? (
                                <span className="badge bg-info">
                                  {record.status || t("N/A")}s
                                </span>
                              ) : record.status === "partial" ? (
                                // Check 2: Partial Pay (Warning Badge)
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
                              ) : (
                                // Check 3: Any Other Status (Danger Badge)
                                <span
                                  className="badge bg-danger"
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
                        {/* <ClickButton
                          label={<>{t("Update")}</>}
                          // onClick={handleUpdateSubmit}
                        ></ClickButton> */}
                      </span>

                      <span className="mx-2">
                        <Delete
                          label={<>{t("Cancel")}</>}
                          onClick={() => navigate("/console/master/chitpayment")}
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
            // Reset paymentAmount state here if you added it
          }}
          centered
          backdrop="static"
        >
          <Modal.Header>
            <Modal.Title>{t("Confirm Payment")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              {t("Do you want to proceed with the payment for Due No.")}
              {dueToPay?.due_number}?
            </p>

            {/* --- MODIFICATION START --- */}
            <div className="d-flex align-items-center mb-3">
              <label htmlFor="paymentAmountInput" className="me-2 fw-bold">
                {t("Amount to Pay")}: ₹
              </label>
              <input
                id="paymentAmountInput"
                type="number"
                className="form-control w-50"
                // Assuming you have a state variable 'paymentAmount'
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0" // Ensures amount is not negative
                max={dueToPay?.due_amount} // Optional: Prevents paying more than the due amount
              />
            </div>
            <small className="text-muted">
              {t("Original Due Amount")}: ₹{dueToPay?.due_amount}
            </small>
            {/* --- MODIFICATION END --- */}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="none"
              onClick={() => {
                setShowConfirmationModal(false);
                setDueToPay(null);
                // Reset paymentAmount state here if you added it
              }}
              className="rounded-pill px-4 bg-danger text-white"
            >
              {t("Later")}
            </Button>
            <Button
              variant="primary"
              // You will need to pass 'paymentAmount' to handlePaymentSubmit
              onClick={() => handlePaymentSubmit(paymentAmount)}
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

export default Chitpaymentcreation;
