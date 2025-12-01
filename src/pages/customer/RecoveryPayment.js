import React, { useState, useEffect, useMemo } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";
import { TextInputForm, Calender } from "../../components/Forms";
import { ClickButton } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_DOMAIN from "../../config/config";
import dayjs from "dayjs";
import { useLanguage } from "../../components/LanguageContext";
import { MaterialReactTable } from "material-react-table";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { BiDotsVerticalRounded } from "react-icons/bi";
import JewelPawnrecoveryPdf from "../../pdf/jewelpawnRecoverPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";

const RecoveryPayment = () => {
  const { t, cacheVersion } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { type, rowData } = location.state || {};
  const today = new Date();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recoveryHistory, setRecoveryHistory] = useState([]);
  const [interestHistory, setInterestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pawnData, setPawnData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user.role === "Admin";

  const getInitialState = () => {
    let jewelProduct = [];
    try {
      if (Array.isArray(rowData?.jewel_product)) {
        jewelProduct = rowData.jewel_product;
      } else if (
        typeof rowData?.jewel_product === "string" &&
        rowData.jewel_product.trim() !== ""
      ) {
        const unescapedString = rowData.jewel_product.replace(/\\"/g, '"');
        const parsed = JSON.parse(unescapedString);
        if (Array.isArray(parsed)) {
          jewelProduct = parsed;
        }
      }
    } catch (parseError) {
      console.error(
        "Failed to parse jewel_product:",
        rowData?.jewel_product,
        parseError
      );
      // Default to empty array
    }

    if (type === "edit" && rowData && rowData.pawnjewelry_recovery_id) {
      return {
        edit_pawnrecovery_id: rowData.pawnjewelry_recovery_id || "",
        customer_no: rowData.customer_no || "",
        receipt_no: rowData.receipt_no || "",
        pawnjewelry_date: rowData.pawnjewelry_date || "",
        name: rowData.name || "",
        customer_details: rowData.customer_details || "",
        place: rowData.place || "",
        mobile_number: rowData.mobile_number || "",
        original_amount: rowData.original_amount || "",
        interest_rate: rowData.interest_rate || "",
        jewel_product: jewelProduct,
        interest_payment_periods: rowData.interest_payment_periods || "",
        interest_paid: rowData.interest_paid || "",
        pawnjewelry_recovery_date:
          rowData.pawnjewelry_recovery_date ||
          today.toISOString().substr(0, 10),
        refund_amount: rowData.refund_amount || "",
        other_amount: rowData.other_amount || "",
        unpaid_interest_amount: 0,
        unpaid_interest_period: 0,
      };
    } else {
      return {
        customer_no: rowData?.customer_no || "",
        receipt_no: rowData?.receipt_no || "",
        pawnjewelry_date: rowData?.pawnjewelry_date || "",
        name: rowData?.name || "",
        customer_details: rowData?.customer_details || "",
        place: rowData?.place || "",
        mobile_number: rowData?.mobile_number || "",
        original_amount: rowData?.original_amount || "",
        interest_rate: rowData?.interest_rate || "",
        jewel_product: jewelProduct,
        interest_payment_periods: 0,
        interest_paid: 0,
        pawnjewelry_recovery_date: today.toISOString().substr(0, 10),
        refund_amount: 0,
        other_amount: "",
        unpaid_interest_amount: rowData?.interest_payment_amount || 0,
        unpaid_interest_period: rowData?.interest_payment_period || 0,
      };
    }
  };

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    setFormData(getInitialState());
  }, [location.state, type, rowData]);

  // For edit mode, fetch pawn data to get unpaid
  useEffect(() => {
    if (type === "edit" && rowData?.receipt_no && !pawnData) {
      const fetchPawnDetails = async () => {
        try {
          const response = await fetch(`${API_DOMAIN}/pawnjewelry.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              search_text: rowData.receipt_no,
            }),
          });
          const responseData = await response.json();
          if (
            responseData.head.code === 200 &&
            responseData.body.pawnjewelry.length > 0
          ) {
            const pawn = responseData.body.pawnjewelry[0];
            setPawnData(pawn);
          }
        } catch (error) {
          console.error("Error fetching pawn details:", error);
        }
      };
      fetchPawnDetails();
    }
  }, [type, rowData]);

  const fetchRecoveryHistory = async () => {
    if (!rowData?.receipt_no) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/pawnrecovery.php`, {
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
        const filteredHistory = responseData.body.pawnrecovery.filter(
          (item) => item.receipt_no === rowData.receipt_no
        );
        setRecoveryHistory(filteredHistory);
      } else {
        console.error(
          "Error fetching recovery history:",
          responseData.head.msg
        );
      }
    } catch (error) {
      console.error("Error fetching recovery history:", error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch Interest History
  const fetchInterestHistory = async () => {
    if (!rowData?.receipt_no) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Calculate totals from interest history and update formData
  useEffect(() => {
    if (!rowData?.receipt_no) return;

    // Get principal and unpaid from pawn data (rowData for new, pawnData for edit)
    const principal = parseFloat(
      (type === "edit"
        ? pawnData?.original_amount
        : rowData?.original_amount) || 0
    );
    const unpaidInterestAmount = parseFloat(
      (type === "edit"
        ? pawnData?.interest_payment_amount
        : rowData?.interest_payment_amount) || 0
    );
    const unpaidInterestPeriod = parseFloat(
      (type === "edit"
        ? pawnData?.interest_payment_period
        : rowData?.interest_payment_period) || 0
    );

    // Paid from history
    let totalPaidInterest = 0;
    let totalPaidPeriods = 0;
    if (interestHistory.length > 0) {
      totalPaidInterest = interestHistory.reduce(
        (sum, item) => sum + parseFloat(item.interest_income || 0),
        0
      );
      totalPaidPeriods = interestHistory.reduce(
        (sum, item) =>
          sum +
          parseFloat(
            item.interest_payment_periods || item.outstanding_period || 0
          ),
        0
      );
    }

    // Refund = Principal + Unpaid Interest (always calculate)
    const calculatedRefund = (principal + unpaidInterestAmount).toFixed(2);

    setFormData((prev) => {
      const updated = { ...prev };
      updated.interest_paid = totalPaidInterest.toFixed(2);
      updated.interest_payment_periods = totalPaidPeriods.toFixed(1);
      updated.unpaid_interest_amount = unpaidInterestAmount;
      updated.unpaid_interest_period = unpaidInterestPeriod;
      // Set refund, but for edit, only if not already set (preserve manual changes)
      if (
        type !== "edit" ||
        !prev.refund_amount ||
        prev.refund_amount === "0"
      ) {
        updated.refund_amount = calculatedRefund;
      }
      return updated;
    });
  }, [interestHistory, rowData, type, pawnData]);

  useEffect(() => {
    fetchRecoveryHistory();
    fetchInterestHistory();
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
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    setFormData((prevData) => ({
      ...prevData,
      [label]: formattedDate,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/pawnrecovery.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          edit_pawnrecovery_id: "",
          interest_paid: formData.interest_paid,
          refund_amount: parseFloat(formData.refund_amount),
          login_id: user.id,
          user_name: user.user_name,
        }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg);
        setTimeout(() => {
          navigate("/console/master/customer");
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
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/pawnrecovery.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          edit_pawnrecovery_id: rowData.pawnjewelry_recovery_id,
          interest_paid: formData.interest_paid,
          refund_amount: parseFloat(formData.refund_amount),
          login_id: user.id,
          user_name: user.user_name,
        }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg);
        setTimeout(() => {
          navigate("/console/master/customer");
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
    type === "edit" ? t("Edit Recovery Payment") : t("Recovery Payment");

  const handleJewelRecoveryEditClick = (rowData) => {
    navigate("/console/customer/jewelrecovery", {
      state: { type: "edit", rowData: rowData },
    });
  };
  const handleJewelRecoveryDeleteClick = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/pawnrecovery.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete_pawn_recovery_id: id,
          login_id: user.id,
          user_name: user.user_name,
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        navigate(-1);
        // window.location.reload();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

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
        header: t("Pawn Date"),
        accessorKey: "pawnjewelry_date",
        Cell: ({ cell }) => dayjs(cell.getValue()).format("DD-MM-YYYY"),
      },
      {
        header: t("Recovery Date"),
        accessorKey: "pawnjewelry_recovery_date",
        Cell: ({ cell }) => dayjs(cell.getValue()).format("DD-MM-YYYY"),
      },
      {
        header: t("Loan Number"),
        accessorKey: "receipt_no",
      },
      {
        header: t("Name"),
        accessorKey: "name",
      },
      {
        header: t("Mobile Number"),
        accessorKey: "mobile_number",
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
                  document={<JewelPawnrecoveryPdf data={rowData} />}
                  fileName={`${rowData.receipt_no}.pdf`}
                >
                  {({ loading, url }) => (
                    <MenuItem
                      onClick={handleClose}
                      disabled={loading}
                    >
                      <a
                        href={url}
                        download={`${rowData.receipt_no}.pdf`}
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
                      handleJewelRecoveryEditClick(row.original);
                      handleClose();
                    }}
                  >
                    {t("Edit")}
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    handleJewelRecoveryDeleteClick(
                      rowData.pawnjewelry_recovery_id
                    );
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
    [
      t,
      cacheVersion,
      isAdmin,
      handleJewelRecoveryEditClick,
      handleJewelRecoveryDeleteClick,
    ]
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
                  <strong>{t("Customer No")}:</strong>
                  <span>{formData.customer_no}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Loan No")}:</strong>
                  <span>{formData.receipt_no}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Name")}:</strong>
                  <span>{formData.name}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Address")}:</strong>
                  <span>{formData.customer_details}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Place")}:</strong>
                  <span>{formData.place}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Mobile Number")}:</strong>
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
                  <strong>{t("Pawn Date")}:</strong>
                  <span>{formData.pawnjewelry_date}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Principal Amount")}:</strong>
                  <span>
                    ₹
                    {parseFloat(formData.original_amount || 0).toLocaleString()}
                  </span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Interest Rate")}:</strong>
                  <span>{formData.interest_rate}</span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Interest Paid")}:</strong>
                  <span>
                    ₹{parseFloat(formData.interest_paid || 0).toLocaleString()}
                  </span>
                </li>
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Payment Periods")}:</strong>
                  <span>{formData.interest_payment_periods} months</span>
                </li>
                {/* Unpaid Interest Amount */}
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Unpaid Interest Amount")}:</strong>
                  <span>
                    ₹
                    {parseFloat(
                      formData.unpaid_interest_amount || 0
                    ).toLocaleString()}
                  </span>
                </li>
                {/* Unpaid Interest Period */}
                <li className="mb-2 d-flex justify-content-between">
                  <strong>{t("Unpaid Interest Period")}:</strong>
                  <span>{formData.unpaid_interest_period} months</span>
                </li>
              </ul>
            </div>
          </Col>

          {/* Jewel Product List Container (Read-only Table) */}
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
              <h5 className="mb-3">{t("Recovery Details")}</h5>
              <Row>
                <Col lg={3}>
                  <Calender
                    setLabel={(date) =>
                      setLabel(date, "pawnjewelry_recovery_date")
                    }
                    initialDate={formData.pawnjewelry_recovery_date}
                    calenderlabel={t("Recovery Date")}
                  />
                </Col>
                <Col lg={3}>
                  <TextInputForm
                    placeholder={t("Refund Amount")}
                    labelname={t("Refund Amount")}
                    name="refund_amount"
                    value={formData.refund_amount}
                    onChange={(e) => handleChange(e, "refund_amount")}
                    disabled
                  />
                </Col>
                <Col lg={3}>
                  <TextInputForm
                    placeholder={t("Other Amount")}
                    labelname={t("Other Amount")}
                    name="other_amount"
                    value={formData.other_amount}
                    onChange={(e) => handleChange(e, "other_amount")}
                  />
                </Col>
              </Row>
            </div>
          </Col>

          {/* Buttons */}

          {(type === "edit" || recoveryHistory.length === 0) && (
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
                    onClick={
                      type === "edit" ? handleUpdateSubmit : handleSubmit
                    }
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
          )}

          {error && (
            <Col lg={12}>
              <Alert variant="danger" className="error-alert">
                {error}
              </Alert>
            </Col>
          )}

          {/* Recovery History Listing */}
          {recoveryHistory.length > 0 && (
            <Col lg={12} className="py-3">
              <div className="customer-card bg-light border rounded p-3">
                <h5 className="mb-3">{t("Recovery Payment History")}</h5>
                <MaterialReactTable
                  columns={columns}
                  data={recoveryHistory}
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
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default RecoveryPayment;
