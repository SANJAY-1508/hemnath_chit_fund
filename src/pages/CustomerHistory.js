import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import PageTitle from "../components/PageTitle";
import { DropDown } from "../components/Forms";
import { Buttons } from "../components/Buttons";
import NotifyData from "../components/NotifyData";
import API_DOMAIN from "../config/config";

const CustomerHistory = () => {
  const [customers, setCustomers] = useState([]);
  const [history, setHistory] = useState([]);
  const [customerNo, setCustomerNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search_text: "",
        }),
      });

      const responseData = await response.json();
      console.log(responseData);
      setLoading(false);
      if (responseData.head.code === 200) {
        setCustomers(responseData.body.customer || []);
      } else {
        throw new Error(responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error.message);
      setError(error.message);
    }
  };

  // Fetch history
  const fetchHistory = async (customerId = null, customerNoFilter = null) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { list_history: true };
      if (customerId) payload.customer_id = customerId;
      if (customerNoFilter) payload.customer_no = customerNoFilter;

      const response = await fetch(`${API_DOMAIN}/customer_history.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.head.code === 200) {
        setHistory(data.body.history || []);
      } else {
        setError(data.head.msg);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchHistory(); // Fetch all initially
  }, []);

  // Filter history by customer_no if selected
  useEffect(() => {
    let filtered = history;
    if (customerNo) {
      filtered = filtered.filter((h) => h.customer_no === customerNo);
    }
    setFilteredHistory(filtered);
  }, [history, customerNo]);

  // Function to format object values for display
  const formatValue = (value, actionType) => {
    if (!value) return <span className="text-muted">None</span>;

    // Assuming value is an object with common customer fields
    const fields = [
      { key: "customer_no", label: "Customer No" },
      { key: "name", label: "Customer Name" }, // Adjust based on actual fields
      { key: "phone", label: "Phone" },
      // Add more fields as per your data structure
    ];

    return (
      <div className="value-container">
        {fields.map((field) => (
          <div key={field.key} className="value-row">
            <span className="value-label">{field.label}:</span>
            <span className="value-content">{value[field.key] || "-"}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleCustomerChange = (e) => {
    const selectedCustomerNo = e.target.value;
    setCustomerNo(selectedCustomerNo);
    // Optionally refetch with filter, but since we filter client-side, no need
  };

  const handleReset = () => {
    setCustomerNo("");
  };

  return (
    <div id="main">
      <Container fluid>
        <Row>
          <Col xs="12" className="py-3">
            <PageTitle PageTitle="Customer History" showButton={false} />
          </Col>
          <Col lg="4" xs="12" className="py-3">
            <DropDown
              textlabel="Filter by Customer No"
              value={customerNo}
              onChange={handleCustomerChange}
              options={
                customers.length > 0
                  ? customers.map((customer) => ({
                      value: customer.customer_no,
                      label: `${customer.customer_no} - ${customer.name}`,
                    }))
                  : [
                      {
                        value: "",
                        label: loading ? "Loading..." : "No customers",
                      },
                    ]
              }
              placeholder="Select Customer"
            />
          </Col>
          {customerNo && (
            <Col lg="2" xs="12" className="py-3">
              <Buttons
                label="Reset"
                classname="btn btn-secondary"
                OnClick={handleReset}
              />
            </Col>
          )}
          <Col xs="12" className="py-3">
            {loading && <p>Loading...</p>}
            {error && <NotifyData message={error} type="error" />}
            <Table bordered hover striped responsive className="mt-4">
              <thead className="table-secondary">
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>History Type</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record, index) => (
                    <tr key={record.id || index}>
                      <td>{index + 1}</td>
                      <td>
                        {record.created_at
                          ? new Date(record.created_at).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </td>
                      <td>{record.action_type}</td>
                      <td>
                        {formatValue(record.old_value, record.action_type)}
                      </td>
                      <td>
                        {formatValue(record.new_value, record.action_type)}
                      </td>
                      <td>{record.remarks || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      {loading ? "Loading..." : "No history found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerHistory;
