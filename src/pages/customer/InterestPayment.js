import React, { useState, useEffect, useMemo } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";
import { TextInputForm, Calender } from "../../components/Forms";
import { ClickButton } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_DOMAIN from "../../config/config";
import { useLanguage } from "../../components/LanguageContext";
import dayjs from "dayjs";
import { MaterialReactTable } from "material-react-table";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { BiDotsVerticalRounded } from "react-icons/bi";
import ReceiptPDF from "../../pdf/jewelInterestPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";

const InterestPayment = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { type, rowData } = location.state || {};
  const today = new Date();
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [error, setError] = useState("");
  const [interestHistory, setInterestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user.role === "Admin";

  const getInitialState = () => {
    if (type === "edit" && rowData) {
      return {
        edit_interest_id: rowData.interest_id || "",
        customer_no: rowData.customer_no || "",
        receipt_no: rowData.receipt_no || "",
        interest_receive_date:
          rowData.interest_receive_date || today.toISOString().substr(0, 10),
        name: rowData.name || "",
        customer_details: rowData.customer_details || "",
        place: rowData.place || "",
        mobile_number: rowData.mobile_number || "",
        original_amount: rowData.original_amount || "",
        interest_rate: rowData.interest_rate || "",
        jewel_product: Array.isArray(rowData.jewel_product)
          ? rowData.jewel_product
          : JSON.parse(rowData.jewel_product || "[]"),
        outstanding_period: rowData.outstanding_period || "",
        outstanding_amount: rowData.outstanding_amount || "",
        interest_income: rowData.interest_income || "",
      };
    } else {
      return {
        customer_no: rowData?.customer_no || "",
        receipt_no: rowData?.receipt_no || "",
        interest_receive_date: today.toISOString().substr(0, 10),
        name: rowData?.name || "",
        customer_details: rowData?.customer_details || "",
        place: rowData?.place || "",
        mobile_number: rowData?.mobile_number || "",
        original_amount: rowData?.original_amount || "",
        interest_rate: rowData?.interest_rate || "",
        jewel_product: Array.isArray(rowData?.jewel_product)
          ? rowData.jewel_product
          : JSON.parse(rowData?.jewel_product || "[]"),
        outstanding_period: rowData?.interest_payment_period || "",
        outstanding_amount: rowData?.interest_payment_amount || "",
        interest_income: "",
      };
    }
  };

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    setFormData(getInitialState());
  }, [location.state, type, rowData]);

  const fetchInterestHistory = async () => {
    if (!rowData?.receipt_no) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/interest.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search_text: rowData.receipt_no,
        }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        const filteredHistory = responseData.body.interest.filter(
          (item) => item.receipt_no === rowData.receipt_no
        );
        setInterestHistory(filteredHistory);
      } else {
        console.error(
          "Error fetching interest history:",
          responseData.head.msg
        );
      }
    } catch (error) {
      console.error("Error fetching interest history:", error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchDataproduct = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/product.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search_text: "" }),
      });

      const responseData = await response.json();
      if (responseData.head.code === 200) {
        setProductList(responseData.body.product);
      }
    } catch (error) {
      console.error("Error fetching product data:", error.message);
    }
  };

  useEffect(() => {
    fetchInterestHistory();
    fetchDataproduct();
  }, [rowData]);

  const handleChange = (e, fieldName, rowIndex) => {
    const value = e.target ? e.target.value : e.value;

    let updatedFormData = { ...formData };

    if (rowIndex !== undefined) {
      updatedFormData.jewel_product = formData.jewel_product.map((row, index) =>
        index === rowIndex ? { ...row, [fieldName]: value } : row
      );
    } else {
      updatedFormData = {
        ...formData,
        [fieldName]: value,
      };
    }

    setFormData(updatedFormData);
  };

  const setLabel = (date, label) => {
    let dateString =
      date instanceof Date ? date.toISOString().substr(0, 10) : date;
    setFormData((prevData) => ({
      ...prevData,
      [label]: dateString,
    }));
  };

  const handleSubmit = async () => {
    if (
      parseFloat(formData.outstanding_amount) !==
      parseFloat(formData.interest_income)
    ) {
      toast.error("Interest Amount should be equal to Outstanding Amount!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/interest.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          edit_interest_id: "",
          login_id: user.id,
          user_name: user.user_name,
        }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg);
        setTimeout(() => {
          // navigate(-1);
          window.location.reload();
        }, 1000);
      } else {
        toast.error(responseData.head.msg);
        setError(responseData.head.msg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (
      parseFloat(formData.outstanding_amount) !==
      parseFloat(formData.interest_income)
    ) {
      toast.error("Interest Amount should be equal to Outstanding Amount!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/interest.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          edit_interest_id: rowData.interest_id,
          login_id: user.id,
          user_name: user.user_name,
        }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg);
        setTimeout(() => {
          navigate(-1);
          window.location.reload();
        }, 1000);
      } else {
        toast.error(responseData.head.msg);
        setError(responseData.head.msg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Back to CustomerDetails
  };

  const pageTitle =
    type === "edit" ? t("Edit Interest Payment") : t("Interest Payment");

  //Interest Edit and Delete click handling
  const handleinterestEditClick = (rowData) => {
    navigate("/console/customer/interest", {
      state: { type: "edit", rowData: rowData },
    });
  };
  const handleinterestDeleteClick = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/interest.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete_interest_id: id,
          login_id: user.id,
          user_name: user.user_name,
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        window.location.reload();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  //Material React Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "s_no_key", // Add a unique, stable accessorKey
        header: t("S.No"),
        size: 50,
        enableColumnFilter: false,
        Cell: ({ row }) => row.index + 1,
      },
      {
        header: t("Interest Receive Date"),
        accessorKey: "interest_receive_date",
        Cell: ({ cell }) => dayjs(cell.getValue()).format("DD-MM-YYYY"),
      },
      {
        header: t("Name"),
        accessorKey: "name",
      },
      {
        header: t("Loan Number"),
        accessorKey: "receipt_no",
      },

      {
        header: t("Mobile Number"),
        accessorKey: "mobile_number",
      },
      {
        header: t("Interest Amount"),
        accessorKey: "interest_income",
      },
      {
        header: t("Action"),
        id: "actions",
        size: 100,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
          const rowData = row.original;
          const [anchorEl, setAnchorEl] = React.useState(null);
          const open = Boolean(anchorEl);

          const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
          };

          const handleClose = () => {
            setAnchorEl(null);
          };

          return (
            <>
              <IconButton onClick={handleClick} size="small">
                <BiDotsVerticalRounded />
              </IconButton>

              {/* MUI Menu component */}
              <Menu
                id="long-menu"
                MenuListProps={{
                  "aria-labelledby": "long-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <PDFDownloadLink
                  document={<ReceiptPDF data={rowData} />}
                  fileName={`${rowData.receipt_no}_interest.pdf`}
                >
                  {({ loading, url }) => (
                    <MenuItem onClick={handleClose} disabled={loading}>
                      <a
                        href={url}
                        download={`${rowData.receipt_no}_interest.pdf`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {"Download Pdf"}
                      </a>
                    </MenuItem>
                  )}
                </PDFDownloadLink>

                {isAdmin && (
                  <MenuItem
                    onClick={() => {
                      handleinterestEditClick(row.original);
                      handleClose();
                    }}
                  >
                    {t("Edit")}
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    handleinterestDeleteClick(rowData.interest_id);
                    handleClose();
                  }}
                >
                  {t("Delete")}
                </MenuItem>
              </Menu>
            </>
          );
        },
      },
    ],
    [t, isAdmin]
  );

  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
            <PageNav pagetitle={pageTitle}></PageNav>
          </Col>

          {/* Read-only Customer Info Container */}
          <Col lg={4}>
            <div className="customer-card bg-light border rounded p-3 h-100">
              <h5 className="mb-3">{t("Customer Information")}</h5>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Customer No:")}</strong>
                  <span>{formData.customer_no}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Loan No:")}</strong>
                  <span>{formData.receipt_no}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Name:")}</strong>
                  <span>{formData.name}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Address:")}</strong>
                  <span>{formData.customer_details}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Place:")}</strong>
                  <span>{formData.place}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Mobile Number:")}</strong>
                  <span>{formData.mobile_number}</span>
                </li>
              </ul>
            </div>
          </Col>

          {/* Read-only Loan Info Container */}
          <Col lg={4}>
            <div className="customer-card bg-light border rounded p-3 h-100">
              <h5 className="mb-3">{t("Loan Information")}</h5>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Principal Amount")}:</strong>
                  <span>
                    ₹
                    {parseFloat(formData.original_amount || 0).toLocaleString()}
                  </span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Interest Rate")}:</strong>
                  <span>{formData.interest_rate}%</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Outstanding Period")}:</strong>
                  <span>{formData.outstanding_period}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Outstanding Amount")}:</strong>
                  <span>
                    ₹
                    {parseFloat(
                      formData.outstanding_amount || 0
                    ).toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>
          </Col>

          {/* Jewel Product List Container*/}
          <Col lg={4}>
            <div className="customer-card bg-light border rounded p-3 h-100">
              <h5 className="mb-3">{t("Pledge Items")}</h5>
              <ul className="list-unstyled small">
                {formData.jewel_product.map((row, index) => (
                  <li key={index} className="mb-2 p-2 border rounded bg-white">
                    <strong>
                      {t("S.No")} {index + 1}:
                    </strong>{" "}
                    {row.JewelName} - {row.count} {t("pcs")}, {row.weight}{" "}
                    {t("gm")} ({row.remark})
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Editable Inputs */}
          <Col lg={12} className="py-3">
            <div className="customer-card bg-light border rounded p-3">
              <h5 className="mb-3">{t("Payment Details")}</h5>
              <Row>
                <Col lg={3}>
                  <Calender
                    setLabel={(date) => setLabel(date, "interest_receive_date")}
                    initialDate={formData.interest_receive_date}
                    calenderlabel={t("Payment Date")}
                  />
                </Col>
                <Col lg={3}>
                  <TextInputForm
                    placeholder={t("Interest Amount")}
                    labelname={t("Interest Amount")}
                    name="interest_income"
                    value={formData.interest_income}
                    onChange={(e) => handleChange(e, "interest_income")}
                  />
                </Col>
              </Row>
            </div>
          </Col>

          {/* Buttons */}
          <Col lg={12}>
            <div className="text-center mb-3">
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
              <span className="mx-2">
                <ClickButton
                  label={
                    loading ? (
                      <>{t("Submitting...")}</>
                    ) : type === "edit" ? (
                      <>{t("Update")}</>
                    ) : (
                      <>{t("Submit")}</>
                    )
                  }
                  onClick={type === "edit" ? handleUpdateSubmit : handleSubmit}
                  disabled={loading}
                />
              </span>
              <span className="mx-2">
                <ClickButton
                  label={<>{t("Cancel")}</>}
                  onClick={handleCancel}
                />
              </span>
            </div>
          </Col>

          {error && (
            <Col lg={12}>
              <Alert variant="danger" className="error-alert">
                {error}
              </Alert>
            </Col>
          )}

          <Col lg={12} className="py-3">
            <div className="customer-card bg-light border rounded p-3">
              <h5 className="mb-3">{t("Interest Payment History")}</h5>

              {interestHistory.length > 0 ? (
                <MaterialReactTable
                  columns={columns}
                  data={interestHistory}
                  enableColumnActions={false}
                  enableColumnFilters={false}
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  enableGlobalFilter={true}
                  initialState={{ density: "compact" }}
                  muiTableContainerProps={{
                    sx: {
                      borderRadius: "5px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                  muiTableHeadCellProps={{
                    sx: {
                      fontWeight: "bold",
                      color: "black",
                    },
                  }}
                />
              ) : (
                <div className="text-center text-muted py-3">
                  {t("No interest payments recorded yet.")}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InterestPayment;
