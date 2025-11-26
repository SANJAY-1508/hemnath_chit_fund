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
  const { type, rowData } = location.state || {};
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { chit_id, ...otherRowData } = rowData || {};

  const initialState =
    type === "edit"
      ? {
          ...otherRowData,
          chit_type: rowData?.chit_type_id || "",
          customer_id: rowData?.customer_id || "",
        }
      : {
          chit_type_id: "",
          customer_id: "",
          chit_no: "",
          chit_due_amount: "1000",
          emi_method: "Weekly",
        };

  const [formData, setFormData] = useState(initialState);
  console.log("Form Data:", formData);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [chitTypeOptions, setChitTypeOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [selectedChitTypeObject, setSelectedChitTypeObject] = useState(null);
  const [dueRecords, setDueRecords] = useState([]);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDueRecord, setSelectedDueRecord] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    payment_method: "",
    paid_amount: "",
    payment_date: "",
  });
  const navigate = useNavigate();

  const paymentMethods = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "UPI", label: "UPI" },
    // Add more options as needed
  ];

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

  const handleChitTypeChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({ ...formData, chit_type: selectedOption.value });
      setSelectedChitTypeObject(selectedOption);
    } else {
      setFormData({ ...formData, chit_type: "" });
      setSelectedChitTypeObject(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenPayment = (record) => {
    setSelectedDueRecord(record);
    setPaymentFormData({
      payment_method: "Cash",
      paid_amount: record.due_amt.toString(),
      payment_date: new Date().toISOString().split("T")[0],
    });
    setShowPaymentModal(true);
  };
  // --- Fetch Data Functions ---

  const handlePaymentSubmit = async () => {
    if (
      !selectedDueRecord ||
      !paymentFormData.payment_method ||
      !paymentFormData.paid_amount ||
      !paymentFormData.payment_date
    ) {
      toast.error("Please fill all fields");
      return;
    }
    const payload = {
      chit_id: selectedDueRecord.chit_id,
      due_no: selectedDueRecord.due_no,
      payment_method: paymentFormData.payment_method,
      current_user_id: user.user_id,
      paid_amount: parseFloat(paymentFormData.paid_amount),
      payment_date: paymentFormData.payment_date,
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let resData;
      try {
        let cleanText = text.trim();
        // Hack to fix malformed response with trailing empty array
        if (cleanText.endsWith("[]")) {
          cleanText = cleanText.slice(0, -2).trim();
        }
        resData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("Invalid JSON response:", text);
        throw new Error("Invalid response format from server");
      }
      if (resData.status === "success") {
        toast.success(resData.message || "Payment successful");
        setShowPaymentModal(false);
        fetchDueRecords(selectedDueRecord.chit_id);
      } else {
        toast.error(resData.message || "Payment failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    const selectedChitTypeOption = chitTypeOptions.find(
      (opt) => opt.value === formData.chit_type
    );
    const chitTypeName = selectedChitTypeOption
      ? selectedChitTypeOption.label
      : "";

    const customerDetailsString = `${selectedCustomer?.customer_no} - ${selectedCustomer?.name}`;

    const payload = {
      customer_details: customerDetailsString,
      customer_id: formData.customer_id,
      chit_type_id: formData.chit_type,
      chit_type: chitTypeName,
      chit_no: formData.chit_no,
      chit_due_amount: formData.chit_due_amount,
      emi_method: formData.emi_method,
      current_user_id: user.user_id,
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
          value: cust.customer_id,
          label: cust.name,
          fullData: cust,
        }));

        setCustomerOptions(options);

        if (type === "edit" && rowData?.customer_id) {
          const preSelected = options.find(
            (opt) => opt.value === rowData.customer_id
          );
          if (preSelected) {
            setSelectedCustomer(preSelected.fullData);
            setSelectedCustomerOption(preSelected);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching customer data:", error.message);
    }
  };

  const fetchChitType = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/chittype.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        const options = responseData.body.chit_type.map((item) => ({
          value: item.chit_type_id,
          label: item.chit_type,
        }));

        setChitTypeOptions(options);

        // Pre-select logic
        if (type === "edit" && rowData?.chit_type_id) {
          const preSelectedChitType = options.find(
            (opt) => opt.value === rowData.chit_type_id
          );
          if (preSelectedChitType) {
            setSelectedChitTypeObject(preSelectedChitType);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chit type data:", error.message);
    }
  };

  const fetchDueRecords = async (chitId) => {
    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chit_id: chitId }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        setDueRecords(responseData.data.chit || []);
      } else {
        setDueRecords([]);
      }
    } catch (error) {
      console.error("Error fetching due records:", error.message);
      setDueRecords([]);
    }
  };
 

  const fetchNextChitNo = async (customerId, chitTypeId) => {
    console.log("Customer ID:", customerId);
    console.log("Chit Type ID:", chitTypeId);
    if (!customerId || !chitTypeId) {
      setFormData((prevData) => ({ ...prevData, chit_no: "" }));
      return;
    }

    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });

      const responseData = await response.json();
      console.log("Fetch Response Data for COUNT:", responseData);
      if (responseData.head.code !== 200 && responseData.head.code !== 404) {
        console.error(
          "Critical API error fetching chits:",
          responseData.head.msg
        );
        setFormData((prevData) => ({ ...prevData, chit_no: "Fetch Error" }));
        return;
      }
      const existingChits = responseData?.data?.all;
      const chitsArray = Array.isArray(existingChits) ? existingChits : [];
      const chitsOfCurrentCustomer = chitsArray.filter(
        (chit) => String(chit.customer_id) === String(customerId)
      );
      let maxNumber = 0;
      const regex = /^CH(\d+)$/;

      chitsOfCurrentCustomer.forEach((chit) => {
        if (chit.chit_no) {
          const match = String(chit.chit_no).match(regex);
          if (match) {
            const number = parseInt(match[1], 10);
            if (number > maxNumber) {
              maxNumber = number;
            }
          }
        }
      });

      // ⭐ STEP 3: Generate the next number
      const nextNumber = maxNumber + 1;

      const formattedNumber = String(nextNumber).padStart(3, "0");
      const nextChitNo = `CH${formattedNumber}`; // CH001, CH002, etc.

      // 4. Update the form data
      setFormData((prevData) => ({
        ...prevData,
        chit_no: nextChitNo,
      }));
    } catch (error) {
      console.error("Client-side Chit No. generation failed:", error.message);
      setFormData((prevData) => ({
        ...prevData,
        chit_no: "Local Error",
      }));
    }
  };
 
  //USEEFECT FUNCTION
  useEffect(() => {
    fetchDataCustomer();
    fetchChitType();
  }, []);

  useEffect(() => {
    if (type === "edit" && rowData?.chit_id) {
      fetchDueRecords(rowData.chit_id);
    } else {
      setDueRecords([]);
    }
  }, [type, rowData]);

  useEffect(() => {
    if (
      type !== "edit" &&
      formData.customer_id !== "" && 
      formData.chit_type !== "" 
    ) {
      fetchNextChitNo(formData.customer_id, formData.chit_type);
    } else {
      setFormData((prevData) => ({ ...prevData, chit_no: "" }));
    }
  }, [formData.customer_id, formData.chit_type, type]);

  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
            <PageNav pagetitle={"Chit Management"} />
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
                isDisabled={type === "edit"}
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
                      {selectedCustomer.name}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Address:
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {selectedCustomer.address}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Place:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedCustomer.place}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Mobile Number:
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>
                      {selectedCustomer.phone}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg="4" md="12" xs="12" className="py-3">
            <div className="mb-4">
              <label htmlFor="chittype-select" className="mb-2">
                {t("Chit Type")}
              </label>
              <Select
                id="chittype-select"
                placeholder={t("Select Chit Type")}
                isSearchable={true}
                options={chitTypeOptions}
                onChange={handleChitTypeChange}
                value={selectedChitTypeObject}
                isDisabled={type === "edit"}
              />
            </div>
          </Col>

          {/* ⭐ 4. DUE PAYMENT TABLE (Only visible in edit mode with data) */}
          {type === "edit" && dueRecords.length > 0 && (
            <Col lg={12} md={12} xs={12} className="mt-4">
              <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light">
                  {t("Current Due Payment Details")}
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead className="thead-dark">
                        <tr>
                          <th>{t("Due Date")}</th>
                          <th>{t("Due Amount")}</th>
                          <th>{t("Balance Amount")}</th>
                          <th>{t("Payment Method")}</th>
                          <th>{t("Status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dueRecords.map((record, index) => (
                          <tr key={index}>
                            <td>
                              {record.due_date
                                ? new Date(record.due_date).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td>
                              {record.due_amt ? `₹${record.due_amt}` : "N/A"}
                            </td>
                            <td>
                              {record.balance_amt
                                ? `₹${record.balance_amt}`
                                : "N/A"}
                            </td>
                            <td>{record.payment_method || t("N/A")}</td>
                            <td>
                              {record.payment_status === "paid" ? (
                                <span className="badge bg-success">
                                  {record.payment_status || t("N/A")}
                                </span>
                              ) : (
                                <span
                                  className="badge bg-warning"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleOpenPayment(record)}
                                >
                                  {record.payment_status || t("N/A")}
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
        {/* Payment Modal */}
        <Modal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          centered
          size="md"
          className="payment-modal"
        >
          <Modal.Header
            closeButton
            className="bg-primary text-white border-0"
            style={{ borderRadius: "10px 10px 0 0" }}
          >
            <Modal.Title className="d-flex align-items-center">
              <i className="fas fa-credit-card me-2"></i>
              Make Payment
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="text-center mb-3">
                  <h6 className="text-muted">
                    Due Amount: ₹{selectedDueRecord?.due_amt || 0}
                  </h6>
                </div>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">
                      <i className="fas fa-wallet me-1"></i>Payment Method
                    </Form.Label>
                    <Form.Select
                      name="payment_method"
                      value={paymentFormData.payment_method}
                      onChange={handlePaymentChange}
                      className="rounded-3 shadow-sm"
                      style={{ borderColor: "#e9ecef" }}
                    >
                      <option value="">Select Method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">
                      <i className="fas fa-rupee-sign me-1"></i>Paid Amount
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="paid_amount"
                      value={paymentFormData.paid_amount}
                      onChange={handlePaymentChange}
                      placeholder="Enter amount"
                      className="rounded-3 shadow-sm"
                      style={{ borderColor: "#e9ecef" }}
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">
                      <i className="fas fa-calendar-alt me-1"></i>Payment Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="payment_date"
                      value={paymentFormData.payment_date}
                      onChange={handlePaymentChange}
                      className="rounded-3 shadow-sm"
                      style={{ borderColor: "#e9ecef" }}
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer
            className="bg-light border-0 pt-0"
            style={{ borderRadius: "0 0 10px 10px" }}
          >
            <Button
              variant="danger"
              onClick={() => setShowPaymentModal(false)}
              className="rounded-pill px-4 me-2"
            >
              <i className="fas fa-times me-1"></i>Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePaymentSubmit}
              disabled={loading}
              className="rounded-pill px-4"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-1"></i>Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-check me-1"></i>Pay Now
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ChitCreation;
