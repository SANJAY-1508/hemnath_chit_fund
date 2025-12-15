import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import PageTitle from "../components/PageTitle";
import API_DOMAIN from "../config/config";
import { ClickButton } from "../components/ClickButton";
import { exportToPDF } from "../pdf/CustomerHistoryReportPdfandExcel";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Calculate initial dates outside the component so they are stable
const getInitialDates = () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return {
    initialToDate: formatDate(today),
    initialFromDate: formatDate(yesterday),
  };
};

const { initialFromDate, initialToDate } = getInitialDates();

const CustomerHistory = () => {
  const [customers, setCustomers] = useState([]);

  // 1. Revert initial state to empty string for UI placeholder effect
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerCode, setCustomerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatHistoryValue = (value) => {
    // ... (Your formatHistoryValue function remains the same)
    if (
      !value ||
      typeof value !== "object" ||
      Object.keys(value).length === 0
    ) {
      return "-";
    }
    return (
      <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
        {Object.entries(value).map(([key, val], index) => {
          if (key === "password") {
            return null;
          }

          const displayKey = key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          let displayValue = val;
          if (key.includes("amount") || key.includes("due_id")) {
            displayValue = `₹${val}`;
          }

          return (
            <li key={key} style={{ fontSize: "0.9em", lineHeight: "1.4" }}>
              <span className="fw-bold me-1">{displayKey}:</span>
              {displayValue || "-"}
            </li>
          );
        })}
      </ul>
    );
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });
      const responseData = await response.json();
      setLoading(false);
      if (responseData.head.code === 200) {
        setCustomers(responseData.body.customer || []);
      } else {
        throw new Error(responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  // Modify fetchCustomerhistory to accept and use the filter parameters
  const fetchCustomerhistory = useCallback(async (customerNo, fromDt, toDt) => {
    setLoading(true);
    setError(null);
    try {
      // The payload correctly uses the passed arguments (which are the date strings)
      const bodyPayload = {
        list_history: "",
        customer_no: customerNo,
        from_date: fromDt,
        to_date: toDt,
      };

      const response = await fetch(`${API_DOMAIN}/customer_history.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const responseData = await response.json();
      setLoading(false);
      if (responseData.head.code === 200) {
        setCustomerHistory(responseData.body.history || []);
      } else {
        setCustomerHistory([]);
        throw new Error(responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
      setCustomerHistory([]);
    }
  }, []);

  const handleExportPDF = () => {
    exportToPDF(filteredHistory, customerCode);
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomerhistory(customerCode, initialFromDate, initialToDate);
  }, [fetchCustomerhistory]);

  const filteredHistory = customerCode
    ? customerHistory.filter((h) => h.customer_no === customerCode)
    : customerHistory;

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    fetchCustomerhistory(customerCode, fromDate, toDate);
  };

  const handleClearFilters = () => {
    setCustomerCode("");
    setFromDate(initialFromDate);
    setToDate(initialToDate);
    fetchCustomerhistory("", initialFromDate, initialToDate);
  };

  const formatValue = (value) => {
    if (!value) return "-";
    return `${value.name || "N/A"} - ${value.phone || "N/A"} - ${
      value.address || "N/A"
    }, ${value.place || "N/A"}`;
  };

  return (
    <div id="main">
      <Container fluid>
        <Row>
          <Col xs="12" className="py-3">
            <PageTitle PageTitle="Customer History" showButton={false} />
          </Col>
        </Row>

        <Row>
          {/* From Date */}
          <Col md="2" className="py-2">
            <Form.Group controlId="fromDate">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </Form.Group>
          </Col>
          {/* To Date */}
          <Col md="2" className="py-2">
            <Form.Group controlId="toDate">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </Form.Group>
          </Col>
          {/* Customer Filter */}
          <Col md="2" className="py-2">
            <Form.Group controlId="customerNo">
              <Form.Label>Customer No*</Form.Label>
              <Form.Select
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                required
              >
                <option value="">Select Customer No</option>
                {customers.map((cust) => (
                  <option key={cust.customer_no} value={cust.customer_no}>
                    {cust.customer_no} - {cust.customer_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md="4" className="py-2 d-flex align-items-end">
            <div className="d-flex w-100 gap-2">
              <ClickButton
                label="Undo Filters"
                disabled={loading}
                onClick={handleClearFilters}
                className="w-auto"
              >
                Clear Filters
              </ClickButton>

              {/* Apply Filters Button */}
              <ClickButton
                label="Apply Filters"
                disabled={loading}
                onClick={handleApplyFilters}
                className="w-auto"
              >
                {loading ? "Applying..." : "Apply Filters"}
              </ClickButton>

              <ClickButton
                label="PDF"
                disabled={loading || filteredHistory.length === 0}
                onClick={handleExportPDF}
                size="sm"
              ></ClickButton>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs="12" className="py-3">
            <Container fluid className="p-4">
              <Row>
                <Col lg="12">
                  <Table
                    bordered
                    hover
                    striped
                    responsive
                    className="mt-4 shadow-sm rounded overflow-hidden"
                    style={{ tableLayout: "fixed" }}
                  >
                    <thead
                      className="table-dark"
                      style={{ borderRadius: "10px" }}
                    >
                      <tr>
                        <th style={{ width: "50px" }}>S.No</th>
                        <th style={{ width: "100px" }}>Date</th>
                        <th style={{ width: "235px", whiteSpace: "normal" }}>
                          History Type
                        </th>
                        <th style={{ width: "260px" }}>Old Value</th>{" "}
                        <th style={{ width: "260px" }}>New Value</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-muted py-4"
                          >
                            Loading history...
                          </td>
                        </tr>
                      ) : filteredHistory.length > 0 ? (
                        filteredHistory.map((history, index) => (
                          <tr key={history.id || index}>
                            <td>{index + 1}</td>
                            <td>
                              {history.created_at
                                ? new Date(
                                    history.created_at
                                  ).toLocaleDateString("en-GB")
                                : "-"}
                            </td>
                            <td>{history.action_type}</td>
                            <td>{formatHistoryValue(history.old_value)}</td>
                            <td>{formatHistoryValue(history.new_value)}</td>
                            <td>{history.remarks}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-muted py-4"
                          >
                            {error
                              ? `Error: ${error}`
                              : "No recent activities found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerHistory;
