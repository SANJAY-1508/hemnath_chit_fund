import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form } from "react-bootstrap";
import PageTitle from "../components/PageTitle";
import API_DOMAIN from "../config/config";

const CollectionReport = () => {
  const [customers, setCustomers] = useState([]);
  // Renamed for clarity, but keeping state key for minimal change
  const [collectionData, setCollectionData] = useState([]); 
  const [customerCode, setCustomerCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const fetchCollectionReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ get_date_collection_report: "" }),
      });
      const responseData = await response.json();
      setLoading(false);
      if (responseData.head.code === 200) {
        // --- UPDATED: Use 'data' from the new JSON structure ---
        setCollectionData(responseData.data || []);
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
    fetchCollectionReport();
  }, []);

  // Helper function to check if a date is within the range
  const isDateInRange = (collectionDate) => {
    if (!collectionDate) return false;

    // collectionDate is a 'YYYY-MM-DD' string
    // Set time to start/end of day for accurate comparison
    const collectionTimestamp = new Date(collectionDate).setHours(12, 0, 0, 0); // Use noon for safety
    
    const fromTimestamp = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : 0;
    // Set to 23:59:59.999 to include all records on the 'toDate'
    const toTimestamp = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;

    return collectionTimestamp >= fromTimestamp && collectionTimestamp <= toTimestamp;
  };


  const filteredData = collectionData.filter((item) => {
    const isCustomerMatch = customerCode ? item.customer_no === customerCode : true;
    
    // --- UPDATED: Filter uses 'collection_date' field ---
    const isDateMatch = (fromDate || toDate) ? isDateInRange(item.collection_date) : true;
    
    return isCustomerMatch && isDateMatch;
  });

  // --- REMOVED: formatValue is no longer needed for flat collection data ---

  return (
    <div id="main">
      <Container fluid>
        <Row>
          <Col xs="12" className="py-3">
            <PageTitle PageTitle="Collection Report" showButton={false} />
          </Col>
        </Row>

        <Row>
          {/* Date Filter Controls */}
          <Col md="3" className="py-2">
            <Form.Group controlId="fromDate">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md="3" className="py-2">
            <Form.Group controlId="toDate">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          
          {/* Customer Filter Control */}
          <Col md="3" className="py-2">
             <Form.Group controlId="customerNo">
              <Form.Label>Customer No</Form.Label>
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
             </Form.Group>
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
                    className="mt-4 shadow-sm rounded"
                  >
                    <thead className="table-dark">
                      <tr>
                        <th>S.No</th>
                        {/* --- UPDATED HEADERS --- */}
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
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            {/* --- UPDATED TABLE BODY BINDING --- */}
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
                            <td>{item.payment_status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={10} // Updated colspan to match new header count
                            className="text-center text-muted py-4"
                          >
                            No collection data found
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