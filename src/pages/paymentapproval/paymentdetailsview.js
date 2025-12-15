import React, { useState, useEffect, useMemo } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLanguage } from "../../components/LanguageContext";

import { MaterialReactTable } from "material-react-table";
import { Box, Tooltip, IconButton, Typography } from "@mui/material";
import { LiaEditSolid } from "react-icons/lia";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { exportPaymentToPDF_Download } from "../../pdf/PaymentReceipt";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useCompanyDetails } from "./companydetails";

const PaymentDetailsView = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const companyName = useCompanyDetails();
  const { t } = useLanguage();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const customerData = location.state?.customerData || {};
  // const customerName = customerData.customer_name || 'N/A';
  // const customerNo = customerData.customer_no || customerId;

  
  const handleBack = () => {
    navigate(-1); 
  };

  const navigateToApprovalScreen = (rowData) => {
    // Determine the type of action based on the status
    const type = rowData.status === "Approved" ? "view" : "edit";

    navigate("/console/master/paymentapproval/create", {
        state: { 
            type: type, 
            rowData: rowData 
        },
    });
};

const handleDownloadPDF = (rowData) => {
    try {
        const customerInfo = JSON.parse(rowData.customer_details);
        const dueInfo = JSON.parse(rowData.due_details);

        const pdfData = {
            payment_details_id: rowData.payment_details_id,
            payment_amount: rowData.payment_amount,
            customerInfo: customerInfo,
            dueInfo: dueInfo,
            companyName: companyName,
        };
        console.log("PDF Data:", pdfData);
        exportPaymentToPDF_Download(pdfData);
    } catch (e) {
        console.error("Error parsing JSON for PDF download:", e);
        // Optionally show a user alert
        alert("Error generating PDF. Data might be corrupted.");
    }
};
  // Data Fetching Logic for Payment Details
  const fetchPaymentDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/payment_details.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId, 
        }),
      });
      const responseData = await response.json();
      setLoading(false);
      if (responseData.head.code === 200) {
        const formattedDetails = responseData.body.payment_details.map((item) => {
          try {
            const customerInfo = JSON.parse(item.customer_details);
            return {
              ...item,
              customer_no: customerInfo.customer_no,
              customer_name: customerInfo.name,
              mobile_number: customerInfo.mobile,
            };
          } catch (e) {
             console.error("Failed to parse JSON in row:", item);
             return item; 
          }
        });
        setPaymentDetails(formattedDetails);
      } else {
        console.error("API Error:", responseData.head.msg);
        setPaymentDetails([]);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching payment details:", error.message);
      setPaymentDetails([]);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchPaymentDetails();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  // Define Material React Table Columns for Payment Details
  const paymentDetailsColumns = useMemo(
    () => [
      {
        accessorKey: "customer_no",
        header: t("Customer No"),
        size: 50,
      },
      {
        accessorKey: "customer_name",
        header: t("Customer Name"),
        size: 50,
      },
      {
        accessorKey: "mobile_number",
        header: t("Phone No"),
        size: 50,
      },
      {
        accessorKey: "payment_amount",
        header: t("Payment Amount"),
        size: 50,
        Cell: ({ cell }) => (
          `₹${Number(cell.getValue()).toFixed(2)}`
        ),
      },
      {
        accessorKey: "status",
        header: t("Status"),
        size: 50,
      },
      // ... (in paymentDetailsColumns useMemo)
{
    id: "action", 
    header: t("Action"),
    size: 50, 
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => {
        const rowData = row.original;
        const isApproved = rowData.status === "Approved";
        
        // Use VisibilityIcon for Approved (Read-Only), LiaEditSolid otherwise
        const ActionIcon = isApproved ? VisibilityIcon : LiaEditSolid;
        const actionTooltip = isApproved ? t("View Details") : t("Edit Payment");

        return (
            <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* 1. View/Edit Icon */}
                <Tooltip title={actionTooltip}>
                    <IconButton
                        aria-label={isApproved ? "view payment detail" : "edit payment detail"}
                        onClick={() => navigateToApprovalScreen(rowData)}
                        sx={{ color: isApproved ? "rgb(25, 118, 210)" : "rgb(22, 59, 140)", padding: 0 }}
                    >
                        <ActionIcon />
                    </IconButton>
                </Tooltip>

                {/* 2. PDF Download Icon (Only for Approved status) */}
                {isApproved && (
                    <Tooltip title={t("Download Receipt PDF")}>
                        <IconButton
                            aria-label="download receipt pdf"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent row click event if any
                                handleDownloadPDF(rowData);
                            }}
                            sx={{ color: 'red', padding: 0 }}
                        >
                            <PictureAsPdfIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    },
},
// ... (rest of the code)
    ],
    [t]
  );

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="12">
            <div className="page-nav py-3 d-flex align-items-center">
                <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <span className="nav-list">
                   {t("Payment Transactions")}
                </span>
            </div>
          </Col>
          <Col lg="12" className="px-0">
            {loading ? (
              <LoadingOverlay isLoading={loading} />
            ) : (
              <div className="py-1">
                {/* <Typography variant="h6" sx={{ mb: 2 }}>
                    
                </Typography> */}
                <MaterialReactTable
                  columns={paymentDetailsColumns}
                  data={paymentDetails}
                  enableColumnActions={false}
                  enableColumnFilters={true}
                  enablePagination={true}
                  enableSorting={true}
                  initialState={{ density: "compact" }}
                  muiTablePaperProps={{
                    sx: {
                      borderRadius: "5px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                  muiTableHeadCellProps={{
                    sx: {
                      fontWeight: "bold",
                      backgroundColor: "black",
                      color: "white",
                      alignItems: "center",
                    },
                  }}
                  renderEmptyRowsFallback={() => (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      {t("No payment details found for this customer.")}
                    </Box>
                  )}
                />
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentDetailsView;