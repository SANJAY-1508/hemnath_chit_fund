import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Table, Form, Button } from "react-bootstrap";
import PageTitle from "../components/PageTitle";
import API_DOMAIN from "../config/config";
import { ClickButton } from "../components/ClickButton";
import "./custom.css";

const CollectionReport = () => {
  const [customers, setCustomers] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [customerCode, setCustomerCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chitTypes, setChitTypes] = useState([]);
  const [chitTypeFilter, setChitTypeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        setCustomers(responseData.body.customer || []);
      } else {
        console.error("Error fetching customers:", responseData.head.msg);
      }
    } catch (error) {
      console.error("Network error fetching customers:", error.message);
    }
  }, []);

  const fetchChitTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/scheme_api.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const responseData = await response.json();

      if (responseData.head.code === 200) {
        setChitTypes(
          Array.isArray(responseData.body.schemes)
            ? responseData.body.schemes
            : responseData.body.schemes
            ? [responseData.body.schemes]
            : []
        );
      } else {
        console.error("Error fetching chit types:", responseData.head.msg);
      }
    } catch (error) {
      console.error("Network error fetching chit types:", error.message);
    }
  }, []);

  //Function to fetch Report Data
  const fetchCollectionReport = useCallback(
    async (custCode, fromDt, toDt, chitType, paymentStatus) => {
      setError(null);

      try {
        const response = await fetch(`${API_DOMAIN}/collection_report.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            get_date_collection_report: true,
            from_date: fromDt,
            to_date: toDt,
            customer_no: custCode,
            chit_type: chitType,
            payment_status: paymentStatus,
          }),
        });
        const responseData = await response.json();

        if (responseData.head.code === 200) {
          setCollectionData(responseData.data || []);
          if ((responseData.data || []).length === 0) {
            setError("No data found for the selected filters.");
          } else {
            setError(null); // Clear error if data is found
          }
        } else {
          setCollectionData([]);
          setError(
            responseData.head.msg ||
              "An error occurred while fetching the report."
          );
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setCollectionData([]);
        setError("Network error: Could not connect to the API.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 4. Function to handle button click
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    fetchCollectionReport(
      customerCode,
      fromDate,
      toDate,
      chitTypeFilter,
      paymentStatusFilter
    );
  };

  // 5. Initial setup
  useEffect(() => {
    fetchCustomers();
    fetchChitTypes();
  }, [fetchCustomers, fetchChitTypes]);

  return (
    <div id="main">
      <Container fluid>
        <Row>
          <Col xs="12" className="py-3">
            <PageTitle PageTitle="Collection Report" showButton={false} />
          </Col>
        </Row>
        <Form onSubmit={handleApplyFilters}>
          <Row>
            {/* From Date */}
            <Col md="2" className="py-2">
              <Form.Group controlId="fromDate">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
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

            {/* Chit Type Dropdown */}
            <Col md="2" className="py-2">
              <Form.Group controlId="chitType">
                <Form.Label>Chit Type</Form.Label>
                <Form.Select
                  value={chitTypeFilter}
                  onChange={(e) => setChitTypeFilter(e.target.value)}
                >
                  <option value="">All Schemes</option>
                  {chitTypes.map((chit) => (
                    <option key={chit.scheme_id} value={chit.scheme_name}>
                      {chit.scheme_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Payment Status Dropdown */}
            <Col md="2" className="py-2">
              <Form.Group controlId="paymentStatus">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="paid">paid</option>
                  <option value="pending">pending</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Apply Button */}
            <Col md="2" className="py-2 d-flex align-items-end">
              <ClickButton
                label="Apply Filters"
                disabled={loading}
                onClick={handleApplyFilters}
              >
                {loading ? "Applying..." : "Apply Filters"}
              </ClickButton>
            </Col>
          </Row>
        </Form>
        {/* --- End of Form --- */}

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
                  >
                    <thead className="table-dark">
                      <tr>
                        <th>S.No</th>
                        <th>Collection Date</th>
                        <th>Customer No.</th>
                        <th>Customer Name</th>
                        <th>Chit Type</th>
                        <th>Due No.</th>
                        <th>Due Amount</th>
                        <th>Paid Amount</th>
                        <th>Balance Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionData.length > 0 ? (
                        collectionData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {item.collection_date
                                ? new Date(
                                    item.collection_date
                                  ).toLocaleDateString("en-GB")
                                : "-"}
                            </td>
                            <td>{item.customer_no}</td>
                            <td>{item.name}</td>
                            <td>{item.chit_type}</td>
                            <td>{item.due_no}</td>
                            <td>{item.due_amt}</td>
                            <td>{item.paid_amt}</td>
                            <td>{item.balance_amt}</td>
                            <td>
                              <span
                                className={
                                  item.payment_status === "paid"
                                    ? "status-paid-badge"
                                    : "status-pending-badge"
                                }
                              >
                                {item.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={10}
                            className="text-center text-muted py-4"
                          >
                            {loading
                              ? "Loading..."
                              : "No collection data found"}
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

export default CollectionReport;
