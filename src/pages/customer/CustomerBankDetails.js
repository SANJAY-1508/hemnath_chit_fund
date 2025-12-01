import React, { useState, useEffect } from "react";
import { Col, Container, Row, Table, Card, Button } from "react-bootstrap";
import PageNav from "../../components/PageNav";
import { useLocation, useNavigate } from "react-router-dom";
import { ClickButton } from "../../components/Buttons";
import { BiArrowBack } from "react-icons/bi";
import API_DOMAIN from "../../config/config";
import { useLanguage } from "../../components/LanguageContext";

const CustomerBankDetails = () => {
  const { t, cacheVersion } = useLanguage();
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const { bankData = [], receiptNo = "", customerNo = "" } = state || {};

  const [pawnInterestTotal, setPawnInterestTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${parseFloat(amount).toLocaleString("en-IN")}` : "₹0";
  };

  // Fetch total pawnjewelry interest
  const fetchPawnInterestTotal = async () => {
    if (!receiptNo) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_DOMAIN}/pawnjewelry.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receipt_no: receiptNo,
          action:"bank_details",
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        setPawnInterestTotal(responseData.body.total_interest || 0);
      } else {
        console.error(
          "Error fetching pawn interest total:",
          responseData.head.msg
        );
      }
    } catch (error) {
      console.error("Error fetching pawn interest total:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPawnInterestTotal();
  }, [receiptNo]);

  // Compute total bank interest client-side
  const totalBankInterest = bankData.reduce((sum, bank) => {
    return sum + parseFloat(bank.interest_amount || 0);
  }, 0);

  // Compute profit
  const profit = pawnInterestTotal - totalBankInterest;

  if (bankData.length === 0) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card className="text-center professional-card">
              <Card.Body>
                <Card.Title className="mb-3">
                  {t("No Bank Details Available")}
                </Card.Title>
                <Card.Text className="mb-4">
                  {t("No bank pledge records found for Receipt No:")}{" "}
                  {receiptNo}.
                </Card.Text>
               <ClickButton 
                  label={
                    <>
                      <BiArrowBack className="me-2" />{" "}
                      {t("Back to Customer Details")}
                    </>
                  }
                  onClick={() => navigate(-1)}
                  className="professional-btn"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 professional-container">
      <Row className="mb-4">
        <Col lg={12}>
          <PageNav
            pagetitle={`${t("Bank Details for Receipt No")}: ${receiptNo}`}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Card className="shadow-sm border-0 professional-card">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0 fw-bold ">
                {t("Bank Pledge Summary - Customer No")}: {customerNo}
              </h5>
            </Card.Header>
            <Card.Body className="py-3">
              <div className="table-responsive">
                <Table
                  striped
                  bordered
                  hover
                  className="mb-0 professional-table"
                >
                  <thead className="table-light">
                    <tr>
                      <th className="text-center fw-bold">{t("S.No")}</th>
                      <th className="fw-bold">{t("Bank Name")}</th>
                      <th className="fw-bold">{t("Pledge Date")}</th>
                      <th className="fw-bold">{t("Bank Loan No")}</th>
                      <th className="fw-bold text-success">
                        {t("Pawn Value")}
                      </th>
                      <th className="fw-bold text-warning">
                        {t("Interest Rate (%)")}
                      </th>
                      <th className="fw-bold">{t("Duration (Months)")}</th>
                      <th className="fw-bold text-info">
                        {t("Interest Amount")}
                      </th>
                      <th className="fw-bold">{t("Pledge Due Date")}</th>
                      <th className="fw-bold">{t("Additional Charges")}</th>
                      <th className="fw-bold">{t("Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankData.map((bank, idx) => {
                      const bankInfo =
                        JSON.parse(bank.bank_details || "[]")[0] || {};
                      const isOverdue =
                        bank.status === "Active" &&
                        new Date(bank.pledge_due_date) < new Date();
                      return (
                        <tr
                          key={idx}
                          className={
                            bank.status === "Closed"
                              ? "table-danger"
                              : isOverdue
                              ? "table-warning"
                              : "table-success"
                          }
                        >
                          <td className="text-center fw-bold professional-cell">
                            {idx + 1}
                          </td>
                          <td className="fw-semibold professional-cell">
                            {bankInfo.bank_name || "N/A"}
                          </td>
                          <td className="professional-cell">
                            {formatDate(bank.pledge_date)}
                          </td>
                          <td className="professional-cell">
                            {bank.bank_loan_no || "N/A"}
                          </td>
                          <td className="text-success fw-bold professional-cell">
                            {formatCurrency(bank.pawn_value)}
                          </td>
                          <td className="text-warning professional-cell">
                            {bank.interest_rate || "N/A"}%
                          </td>
                          <td className="professional-cell">
                            {bank.duration_month || "N/A"}
                          </td>
                          <td className="text-info professional-cell">
                            {formatCurrency(bank.interest_amount)}
                          </td>
                          <td
                            className={`professional-cell ${
                              isOverdue ? "text-danger fw-bold" : ""
                            }`}
                          >
                            {formatDate(bank.pledge_due_date)}
                          </td>
                          <td className="professional-cell">
                            {formatCurrency(bank.additional_charges)}
                          </td>
                          <td className="professional-cell">
                            <span
                              className={`badge fw-semibold ${
                                bank.status === "Closed"
                                  ? "bg-danger"
                                  : "bg-success"
                              }`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              {t(bank.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-light text-center professional-footer">
              <small className="text-muted fw-medium">
                {t("Total Records")}: {bankData.length} |
                {t("Showing all bank pledges for this receipt")}.
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* New Bottom Container for Totals */}
      <Row className="mt-4">
        <Col lg={12}>
          <Card className="shadow-sm border-0 professional-card">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0 fw-bold">
                {t("Interest Summary for Receipt No")}: {receiptNo}
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-3 text-center">
                <Col md={4}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      {t("Total Bank Interest")}
                    </h6>
                    <h4 className="text-info fw-bold">
                      {formatCurrency(totalBankInterest)}
                    </h4>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      {t("Total Pawnjewelry Interest")}
                    </h6>
                    <h4 className="text-success fw-bold">
                      {formatCurrency(pawnInterestTotal)}
                    </h4>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">{t("Profit")}</h6>
                    <h4
                      className={`fw-bold ${
                        profit >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatCurrency(profit)}
                    </h4>
                  </div>
                </Col>
              </Row>
              {loading && (
                <div className="text-center mt-3">{t("Loading totals...")}</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={12} className="text-center">
          <ClickButton
            label={
              <>
                <BiArrowBack className="me-2" /> {t("Back to Customer Details")}
              </>
            }
            onClick={() => navigate(-1)}
            className="professional-btn"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerBankDetails;
