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

const PaymentDetailsView = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
  const navigateToEdit = (rowData) => {
    navigate("/console/master/paymentapproval/create", {
      state: { type: "edit", rowData: rowData },
    });
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
      {
    id: "action", // Changed header to 'Action' or 'Details'
    header: t("Action"),
    size: 50, // Increase size slightly for clarity
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => {
        const rowData = row.original;
        const isApproved = rowData.status === "Approved";
        
        // Use VisibilityIcon for Approved (Read-Only)
        const IconComponent = isApproved ? VisibilityIcon : LiaEditSolid;
        const tooltipText = isApproved ? t("View Details") : t("Edit Payment");

        return (
            <Tooltip title={tooltipText}>
                <IconButton
                    aria-label={isApproved ? "view payment detail" : "edit payment detail"}
                    onClick={() => navigateToApprovalScreen(rowData)}
                    sx={{ color: isApproved ? "rgb(25, 118, 210)" : "rgb(22, 59, 140)", padding: 0 }}
                >
                    <IconComponent />
                </IconButton>
            </Tooltip>
        );
    },
},
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