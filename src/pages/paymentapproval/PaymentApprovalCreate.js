import React, { useState, useEffect } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLanguage } from "../../components/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

const PAYMENT_UPDATE_API = `${API_DOMAIN}/payment_details.php`;

const CHIT_UPDATE_API = `${API_DOMAIN}/chit.php`;
const PaymentApprovalCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { rowData, type } = location.state || {};
  const isReadOnly = type === "view";
  const isEditing = rowData && rowData.payment_details_id;
  const [formData, setFormData] = useState({
    payment_amount: "",
    payment_details_id: isEditing ? rowData.payment_details_id : "",
  });

  const [customerInfo, setCustomerInfo] = useState({});
  const [dueInfo, setDueInfo] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [dueId, setDueId] = useState(null); // State to store the extracted Due ID
  const [chitId, setChitId] = useState(null);
  const handleCancel = () => navigate(-1);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isEditing) {
      try {
        const parsedCustomerInfo = JSON.parse(rowData.customer_details);
        const parsedDueInfo = JSON.parse(rowData.due_details);

        setCustomerInfo(parsedCustomerInfo);
        setDueInfo(parsedDueInfo);

        // Extract the ID (due_id) and chit_id from the parsed due_details
        if (parsedDueInfo.id) {
          setDueId(parsedDueInfo.id);
        }
        if (parsedDueInfo.chit_id) {
          setChitId(parsedDueInfo.chit_id);
        }
      } catch (e) {
        console.error("Error parsing nested JSON data:", e);
      }
    }
  }, [isEditing, rowData, isReadOnly]);

  const handleUpdate = async () => {
    if (
      updateLoading ||
      !formData.payment_amount ||
      Number(formData.payment_amount) <= 0
    ) {
      alert(t("Please enter a valid payment amount for approval."));
      return;
    }

    if (!dueId || !chitId) {
      alert(
        t(
          "Error: Could not retrieve Due ID or Chit ID. Cannot proceed with approval."
        )
      );
      console.error("Missing Due ID or Chit ID:", { dueId, chitId });
      return;
    }

    setUpdateLoading(true);

    let paymentUpdateSuccess = false;
    try {
      const response = await fetch(PAYMENT_UPDATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update payment",
          edit_payment_id: formData.payment_details_id,
          payment_amount: formData.payment_amount,
          new_status: "Approved",
        }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success("Successfully Approved!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        paymentUpdateSuccess = true;
      } else {
        alert(
          `${t("Payment Details Update failed")}: ${responseData.head.msg}`
        );
      }
    } catch (error) {
      console.error("Error updating payment details:", error.message);
      alert(t("An error occurred during payment details update."));
    }

    if (paymentUpdateSuccess) {
      try {
        const chitResponse = await fetch(CHIT_UPDATE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "pay_due",
            due_id: dueId,
            amount: formData.payment_amount,
          }),
        });

        const chitResponseData = await chitResponse.json();

        if (chitResponseData.head.code === 200) {
          toast.success("Successfully Approved!", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          handleCancel();
        } else {
          alert(
            `${t("Due Status Update failed")}: ${chitResponseData.head.msg}`
          );
        }
      } catch (error) {
        console.error("Error updating Chit/Due details:", error.message);
        alert(
          t(
            "An error occurred during Chit/Due update. Please check the due status manually."
          )
        );
      }
    }

    setUpdateLoading(false);
  };
  const DataRow = ({ label, value }) => (
    <Box sx={{ display: "flex", mb: 0.5 }}>
      <Typography
        variant="body1"
        sx={{
          fontWeight: "bold",
          minWidth: "170px", // Set a fixed width for the label column
          pr: 1, // Add padding right for spacing after the label
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );

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
          <Grid item xs={12} md={3.5}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "#f8f9fa" }}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s", // Smooth transition
                "&:hover": {
                  transform: "translateY(-5px)", // Slight lift effect
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Deeper shadow
                  cursor: "pointer", // Optional: Indicates interactivity
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "10px",
                    color: "rgb(95 10 7)",
                  }}
                >
                  <strong>{t("Customer Details")}</strong>
                </Typography>
                <Stack spacing={0.5}>
                  {/* Use DataRow component for alignment */}
                  <DataRow
                    label={t("Customer No")}
                    value={customerInfo.customer_no}
                  />
                  <DataRow
                    label={t("Customer Name")}
                    value={customerInfo.name}
                  />
                  <DataRow
                    label={t("Mobile Number")}
                    value={customerInfo.mobile}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3.5}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "#f8f9fa" }}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s", // Smooth transition
                "&:hover": {
                  transform: "translateY(-5px)", // Slight lift effect
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Deeper shadow
                  cursor: "pointer", // Optional: Indicates interactivity
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "10px",
                    color: "rgb(95 10 7)",
                  }}
                >
                  <strong>{t("Due Details")}</strong>
                </Typography>
                <Stack spacing={0.5}>
                  <DataRow label={t("Due Number")} value={dueInfo.due_number} />
                  <DataRow label={t("Due Date")} value={dueInfo.due_date} />
                  <DataRow
                    label={t("Due Amount")}
                    value={`₹${dueInfo.due_amount}`}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3.7}>
            <Card
              variant="outlined"
              style={{ backgroundColor: "#f8f9fa" }}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s", // Smooth transition
                "&:hover": {
                  transform: "translateY(-5px)", // Slight lift effect
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Deeper shadow
                  cursor: "pointer", // Optional: Indicates interactivity
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "10px",
                    color: "rgb(95 10 7)",
                  }}
                >
                  {t("Payment Details")}
                </Typography>
                <Stack spacing={0.5}>
                  <DataRow
                    label={t("Payment Type")}
                    value={rowData.payment_type}
                  />
                  <DataRow
                    label={t("Submitted Status")}
                    value={rowData.status}
                  />
                  <DataRow
                    label={t("Amount Submitted")}
                    value={`₹${Number(rowData.payment_amount).toFixed(2)}`}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3.5}>
            <Card variant="outlined" sx={{ height: "450px" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  {t("Payment Proof Image")}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Box
                      sx={{
                        alignItems: "center",
                        mt: 2,
                        mb: 1,
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    ></Box>
                    {rowData.payment_proof ? (
                      <CardMedia
                        component="img"
                        sx={{
                          maxHeight: 300,
                          maxWidth: "100%",
                          objectFit: "Fill",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        image={rowData.payment_proof}
                        alt={t("Payment Proof")}
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        {!isReadOnly && ( // <-- NEW CONDITIONAL WRAPPER
            <Grid item xs={12} md={3.5}>
                <Card variant="outlined" style={{ backgroundColor: "#f8f9fa" }}>
                    <CardContent>
                        <Grid item xs={12} md={12}>
                            <TextField
                                label={t("Payment Amount (For Approval)")}
                                name="payment_amount"
                                type="text"
                                value={formData.payment_amount}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                disabled={isReadOnly} // Although hidden, keeping 'disabled' doesn't hurt.
                                margin="normal"
                                helperText={t("Enter the final amount to be approved")}
                            />
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
          )} 
        </Grid>
      
        {!isReadOnly && (
          <Box
            sx={{
              mt: 3,
              mb: 5,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button className="cancel" onClick={handleCancel}>
              {t("Cancel")}
            </Button>
            <Button
              className="create-btn"
              onClick={handleUpdate}
              disabled={updateLoading || !formData.payment_amount}
            >
              {t("Approve")}
            </Button>
          </Box>
        )}
      </Container>

      {/* Proof Image Preview Modal */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="sm"
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
            style={{
              maxWidth: "50%",
              maxHeight: "50%",
              minWidth: "50%",
              minheight: "50%",
              borderRadius: "4px",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button className="cancel" onClick={() => setIsPreviewOpen(false)}>
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default PaymentApprovalCreate;
