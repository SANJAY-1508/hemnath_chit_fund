import React, { useState, useEffect } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLanguage } from "../../components/LanguageContext";

// Material UI components for structure and styling
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  CardMedia,IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PAYMENT_UPDATE_API = `${API_DOMAIN}/payment_details.php`; 

const PaymentApprovalCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { rowData } = location.state || {};
  const isEditing = rowData && rowData.payment_details_id;
  const [formData, setFormData] = useState({
    payment_amount: isEditing ? rowData.payment_amount : "",
    payment_details_id: isEditing ? rowData.payment_details_id : "",
    status: isEditing ? rowData.status : "", 
  });
  const [customerInfo, setCustomerInfo] = useState({});
  const [dueInfo, setDueInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Function to handle navigating back
  const handleCancel = () => {
    navigate(-1);
  };
  
  const parseRowData = (data) => {
    if (data) {
      try {
        setCustomerInfo(JSON.parse(data.customer_details));
        setDueInfo(JSON.parse(data.due_details));
      } catch (e) {
        console.error("Error parsing nested JSON data:", e);
      }
    }
  };

  // --- Data Fetching/Setup ---
  
  useEffect(() => {
    if (!isEditing) {
      alert(t("Invalid payment details selected for editing."));
      handleCancel();
      return;
    }
    setFormData({
      payment_amount: rowData.payment_amount,
      payment_details_id: rowData.payment_details_id,
      status: rowData.status,
    });
    parseRowData(rowData);
  }, [isEditing, rowData, navigate]);


  // --- Event Handlers ---
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  
const handleUpdate = async () => {
    if (updateLoading) return;
    setUpdateLoading(true);

    try {
      const response = await fetch(PAYMENT_UPDATE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({        
          "action": "update payment", 
          "edit_payment_id": formData.payment_details_id, 
        }),
      });

      const responseData = await response.json();
      setUpdateLoading(false);

      if (responseData.head.code === 200) {
        alert(t("Payment details updated successfully!"));
        handleCancel(); 
      } else {
        alert(`${t("Update failed")}: ${responseData.head.msg}`);
      }
    } catch (error) {
      setUpdateLoading(false);
      console.error("Error updating payment details:", error.message);
      alert(t("An error occurred during update."));
    }
};
// ...

  // --- Render ---

  if (loading || !isEditing) {
    return <LoadingOverlay isLoading={loading} />;
  }

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="12">
            <div className="page-nav py-3 d-flex align-items-center">
              <IconButton onClick={handleCancel} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <span className="nav-list">
                {t("Payment Approval")} 
              </span>
            </div>
          </Col>
        </Row>
        
        <Grid container spacing={3}>
          {/* Card 1: Customer Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom><strong>{t("Customer Details")}</strong></Typography>
                <Typography variant="body1">
                  <strong>{t("Customer No")}:</strong> {customerInfo.customer_no}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("Name")}:</strong> {customerInfo.name}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("Mobile")}:</strong> {customerInfo.mobile}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Due Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom><strong>{t("Due Details")}</strong></Typography>
                <Typography variant="body1">
                  <strong>{t("Due Number")}:</strong> {dueInfo.due_number}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("Due Date")}:</strong> {dueInfo.due_date}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("Due Amount")}:</strong> ₹{Number(dueInfo.due_amount).toFixed(2)}
                </Typography>
                {/* <Typography variant="body1">
                  <strong>{t("Current Status")}:</strong> {dueInfo.status}
                </Typography> */}
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Payment Proof and Amount Input */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>{t("Payment Information")}</Typography>
                
                <Grid container spacing={3}>
                    {/* Payment Amount Input */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            label={t("Payment Amount (For Approval)")}
                            name="payment_amount"
                            type="number"
                            value={formData.payment_amount}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            helperText={t("Enter the final amount to be approved")}
                        />
                         <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>{t("Payment Type")}:</strong> {rowData.payment_type}
                        </Typography>
                        <Typography variant="body2">
                            <strong>{t("Submitted Status")}:</strong> {rowData.status}
                        </Typography>
                    </Grid>

                    {/* Payment Proof (Image) */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                            {t("Payment Proof Image")}
                        </Typography>
                        {rowData.payment_proof ? (
                            <CardMedia
                                component="img"
                                sx={{ 
                                    maxHeight: 250, 
                                    maxWidth: '100%', 
                                    objectFit: 'contain',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                                image={rowData.payment_proof}
                                alt={t("Payment Proof")}
                            />
                        ) : (
                            <Box sx={{ border: '1px dashed #ccc', p: 4, textAlign: 'center' }}>
                                {t("No proof image available.")}
                            </Box>
                        )}
                    </Grid>
                </Grid>
                
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Action Buttons */}
        <Box sx={{ mt: 3, mb: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={updateLoading}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={updateLoading}
          >
            {updateLoading ? t("Updating...") : t("Update & Approve")}
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default PaymentApprovalCreate;