import React, { useState, useEffect } from "react";
import { Col, Container, Row, Alert, Modal, Card } from "react-bootstrap";
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
          chit_due_amount: "",
          emi_method: "",
        };

  const [formData, setFormData] = useState(initialState);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [chitTypeOptions, setChitTypeOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [selectedChitTypeObject, setSelectedChitTypeObject] = useState(null);
  const [dueRecords, setDueRecords] = useState([]);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    console.log("Form Data:", formData);
    const selectedChitTypeOption = chitTypeOptions.find(
      (opt) => opt.value === formData.chit_type
    );
    console.log("Selected Chit Type Option:", selectedChitTypeOption);
    const chitTypeName = selectedChitTypeOption
      ? selectedChitTypeOption.label
      : "";

    console.log("Chit Type Name:", chitTypeName);
    const customerDetailsString = `${selectedCustomer?.customer_no} - ${selectedCustomer?.name}`;

    console.log("Customer Details String:", customerDetailsString);
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

    console.log("Payload being sent:", payload);

    try {
      console.log("Inside try block");
      setLoading(true);
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("Response:", JSON.stringify(payload));

      const responseData = await response.json();
      console.log("Response Data:", responseData);

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

        // Pre-select logic
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

  // --- useEffect Hooks ---

  useEffect(() => {
    fetchDataCustomer();
    fetchChitType();
  }, []);

  useEffect(() => {
    if (
      type === "edit" &&
      rowData &&
      rowData.chit_id &&
      rowData.due_amt !== undefined
    ) {
      const singleDueRecord = {
        due_date: rowData.due_date,
        due_amt: rowData.due_amt,
        balance_amt: rowData.balance_amt,
        payment_method: rowData.payment_method,
        payment_status: rowData.payment_status,
      };

      setDueRecords([singleDueRecord]);
    } else {
      setDueRecords([]);
    }
  }, [type, rowData]);

  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
           <PageNav 
        pagetitle={'Chit Management'}
        
      />
        
          </Col>

          {/* COLUMN 1: CUSTOMER DROPDOWN */}
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

          {/* COLUMN 2: CHIT TYPE DROPDOWN */}
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
                              <span
                                className={`badge bg-${
                                  record.payment_status === "pending"
                                    ? "warning"
                                    : record.payment_status === "paid"
                                    ? "success"
                                    : "secondary"
                                }`}
                              >
                                {record.payment_status || t("N/A")}
                              </span>
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
      </Container>
    </div>
  );
};

export default ChitCreation;
