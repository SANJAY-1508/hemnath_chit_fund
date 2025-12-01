import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import PageTitle from "../components/PageTitle";
import API_DOMAIN from "../config/config";

const CustomerHistory = () => {
  const [customers, setCustomers] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerCode, setCustomerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchCustomerhistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/customer_history.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list_history: "" }),
      });
      const responseData = await response.json();
      setLoading(false);
      if (responseData.head.code === 200) {
        setCustomerHistory(responseData.body.history || []);
      } else {
        throw new Error(responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomerhistory();
  }, []);

  const filteredHistory = customerCode
    ? customerHistory.filter((h) => h.customer_no === customerCode)
    : customerHistory;

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
          <Col md="3" className="py-2">
            <Form.Select
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
            >
              <option value="">Select Customer No</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.customer_no}>
                  {cust.customer_no} - {cust.name}
                </option>
              ))}
            </Form.Select>
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
                  >
                    <thead className="table-dark" style={{borderRadius: "10px" }}>
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
                            <td>{formatValue(history.old_value)}</td>
                            <td>{formatValue(history.new_value)}</td>
                            <td>{history.remarks}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-muted py-4"
                          >
                            No recent activities found
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
