import React, { useState, useEffect } from "react";
import { Container, Col, Row, Table, Form } from "react-bootstrap";
import { TextInputForm } from "../../components/Forms";
import { ClickButton } from "../../components/ClickButton";
import API_DOMAIN from "../../config/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { generatePDF, generateExcel } from "./ExpenseReportPdfAndExcel";
import { useLanguage } from "../../components/LanguageContext";
import dayjs from "dayjs";

const ExpenseReport = () => {
  const { t } = useLanguage();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport(); // Load all data initially
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/get_categories.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ get_categories: true }),
      });
      const responseData = await response.json();
      console.log(responseData);
      if (responseData.head.code === 200) {
        setCategories(responseData.body.categories || []);
      } else {
        toast.error(responseData.head.msg);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchReport = async (filterParams = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/expense_report.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: true, ...filterParams }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        setReportData(responseData.body.expense_report || []);
      } else {
        toast.error(responseData.head.msg);
        setReportData([]);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setReportData([]);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    fetchReport({
      from_date: fromDate || null,
      to_date: toDate || null,
      category: selectedCategory || null,
    });
  };

  const handleDownloadPDF = () => {
    if (reportData.length === 0) {
      toast.error("No data to download!");
      return;
    }
    generatePDF(reportData);
  };

  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      toast.error("No data to download!");
      return;
    }
    generateExcel(reportData);
  };

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="12">
            <div className="page-nav py-3">
              <span className="nav-list">{t("Expense Report")}</span>
            </div>
          </Col>

          {/* Filters */}
          <Col lg="12">
            <Row className="py-3">
              <Col lg="2" md="6" xs="12">
                <TextInputForm
                  type="date"
                  placeholder={t("From Date")}
                  labelname={t("From Date")}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Col>
              <Col lg="2" md="6" xs="12">
                <TextInputForm
                  type="date"
                  placeholder={t("To Date")}
                  labelname={t("To Date")}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Col>
              <Col lg="3" md="6" xs="12">
                <Form.Group controlId="category">
                  <Form.Label>{t("Category")}</Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">{t("All Categories")}</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_name}>
                        {cat.category_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col
                lg="4"
                md="6"
                xs="12"
                className="d-flex align-items-end justify-content-start gap-2"
              >
                <ClickButton
                  label={
                    loading ? <>{t("Loading...")}</> : <>{t("Apply Filter")}</>
                  }
                  onClick={handleFilter}
                  disabled={loading}
                  variant="info"
                />
                <ClickButton
                  label={<>{t("PDF")}</>}
                  onClick={handleDownloadPDF}
                  variant="success"
                />
                <ClickButton
                  label={<>{t("Excel")}</>}
                  onClick={handleDownloadExcel}
                  variant="primary"
                />
              </Col>
            </Row>
          </Col>

          {/* Report Table */}
          <Col lg="12">
            <Table
              striped
              bordered
              hover
              responsive
              className="text-center align-middle"
            >
              <thead className="table-dark">
                <tr>
                  <th>{t("Date")}</th>
                  <th>{t("Category")}</th>
                  <th>{t("Description")}</th>
                  <th>{t("Amount")}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((item, index) => (
                    <tr key={index}>
                      <td>{dayjs(item.date).format("DD-MM-YYYY")}</td>
                      <td>{item.category_name}</td>
                      <td>{item.description}</td>
                      <td>{item.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      {t("No data found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default ExpenseReport;
