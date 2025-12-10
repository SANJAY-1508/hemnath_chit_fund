import React, { useState, useEffect } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLanguage } from "../../components/LanguageContext";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

const PAYMENT_UPDATE_API = `${API_DOMAIN}/payment_details.php`;

const PaymentApprovalCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { rowData } = location.state || {};
  const isEditing = rowData && rowData.payment_details_id;

  // Initialize payment_amount to empty to prevent automatic fix
  const [formData, setFormData] = useState({
    payment_amount: "",
    payment_details_id: isEditing ? rowData.payment_details_id : "",
  });

  const [customerInfo, setCustomerInfo] = useState({});
  const [dueInfo, setDueInfo] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  // State for image preview only
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCancel = () => navigate(-1);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isEditing) {
      setCustomerInfo(JSON.parse(rowData.customer_details));
      setDueInfo(JSON.parse(rowData.due_details));
    }
  }, [isEditing, rowData]);

  const handleUpdate = async () => {
    if (updateLoading || !formData.payment_amount) return;
    setUpdateLoading(true);

    try {
      const response = await fetch(PAYMENT_UPDATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update payment",
          edit_payment_id: formData.payment_details_id,
        }),
      });

      const responseData = await response.json();
      setUpdateLoading(false);

      if (responseData.head.code === 200) {
        alert(t("Payment details updated successfully!"));
        handleCancel();
      }
    } catch (error) {
      setUpdateLoading(false);
      console.error("Error:", error.message);
    }
  };

  return (
    <div>
      <Container fluid>
        <Row className="mb-3">
          <Col lg="12" className="page-nav py-3 d-flex align-items-center">
            <IconButton onClick={handleCancel} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <span className="nav-list">{t("Payment Approval")}</span>
          </Col>
        </Row>

        <Grid container spacing={3}>
          {/* Top Info Cards */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  <strong>{t("Customer Details")}</strong>
                </Typography>
                 <Typography variant="body1">
                  <strong>{t("Customer No")}:</strong> {customerInfo.customer_no}
                </Typography>
                <Typography>
                  <strong>{t("Name")}:</strong> {customerInfo.name}
                </Typography>
                <Typography>
                  <strong>{t("Mobile")}:</strong> {customerInfo.mobile}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  <strong>{t("Due Details")}</strong>
                </Typography>
                <Typography variant="body1">
                  <strong>{t("Due Number")}:</strong> {dueInfo.due_number}
                </Typography>
                <Typography>
                  <strong>{t("Due Date")}:</strong> {dueInfo.due_date}
                </Typography>
                <Typography>
                  <strong>{t("Amount")}:</strong> ₹{dueInfo.due_amount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Information Card */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ height: "450px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("Payment Information")}
                </Typography>

                <Grid container spacing={3}>
                  {/* Payment Proof (Image) - MOVED TO LEFT (order: 1) */}
                  <Grid item xs={12} md={6}>
                    {/* NEW: Title and View Proof Button container */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {t("Payment Proof Image")}
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        // NEW: onClick handler to open the preview modal
                        onClick={() =>
                          rowData.payment_proof && setIsPreviewOpen(true)
                        }
                        disabled={!rowData.payment_proof}
                        startIcon={<ZoomInIcon />}
                      >
                        {t("View Full Proof")}
                      </Button>
                    </Box>
                                       {" "}
                    {rowData.payment_proof ? (
                      <CardMedia
                        component="img"
                        sx={{
                          maxHeight: 300,
                          maxWidth: "90%",
                          objectFit: "contain",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          cursor: "pointer", // Visual hint that it's clickable
                        }}
                        image={rowData.payment_proof}
                        alt={t("Payment Proof")}
                        // NEW: Direct click handler on the image
                        onClick={() => setIsPreviewOpen(true)}
                      />
                    ) : (
                      <Box
                        sx={{
                          border: "1px dashed #ccc",
                          p: 4,
                          textAlign: "center",
                          minHeight: 250,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                     {t("No proof image available.")}
                    
                      </Box>
                    )}
                  
                  </Grid>

                  {/* Payment Amount Input - MOVED TO RIGHT (order: 2) */}
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
                      <strong>{t("Payment Type")}:</strong>{" "}
                      {rowData.payment_type}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t("Submitted Status")}:</strong> {rowData.status}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            mb: 5,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updateLoading || !formData.payment_amount}
          >
            {t("Update & Approve")}
          </Button>
        </Box>
      </Container>

      {/* Proof Image Preview Modal */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("Payment Proof Preview")}
          <IconButton onClick={() => setIsPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: "center" }}>
          <img
            src={rowData.payment_proof}
            alt="Proof Enlarged"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPreviewOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentApprovalCreate;
