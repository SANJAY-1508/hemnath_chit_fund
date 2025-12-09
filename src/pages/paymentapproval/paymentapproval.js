import React, { useState, useEffect, useMemo } from "react"; // ADD useMemo
import { Container, Col, Row } from "react-bootstrap";
import { ClickButton, Delete } from "../../components/ClickButton";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import "jspdf-autotable";
import { useLanguage } from "../../components/LanguageContext";

// 💡 NEW IMPORTS FOR MATERIAL REACT TABLE
import { MaterialReactTable } from "material-react-table";
import { Box, Tooltip, IconButton, Dialog, DialogContent } from "@mui/material";

import { LiaEditSolid } from "react-icons/lia";
const Customer = () => {
  const navigate = useNavigate();
  const { t, cacheVersion } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [customerData, setcustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Handler functions for the preview modal
  const handlePreviewOpen = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage("");
  };

  // 1. Handlers for View  Edit and Delete Actions

  const handlecustomerViewClick = (rowData) => {
    navigate("/console/master/customerdetails", {
      state: { type: "view", rowData: rowData },
    });
  };
  const handlecustomerEditClick = (rowData) => {
    navigate("/console/master/customer/create", {
      state: { type: "edit", rowData: rowData },
    });
  };
  const handlecustomerDeleteClick = async (id) => {
    console.log("delete customer", id);
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete_customer_id: id,
          created_by_id: user.user_id,
          created_by_name: user.name,
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        navigate("/console/master/customer");
        window.location.reload();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };
  // 2. Data Fetching Logic (Unchanged)
  const fetchDataCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search_text: searchText,
        }),
      });

      const responseData = await response.json();

      setLoading(false);
      if (responseData.head.code === 200) {
        setcustomerData(responseData.body.customer);
        setLoading(false);
      } else {
        throw new Error(responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error.message);
    }
  };
  useEffect(() => {
    fetchDataCustomer();
  }, [searchText]);

  ///for pdf and excel download

  // 3. Define Material React Table Columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "s_no_key",
        header: t("S.No"),
        size: 5,
        enableColumnFilter: false,
        Cell: ({ row }) => row.index + 1,
      },

      {
        accessorKey: "customer_no",
        header: t("Customer No"),
        size: 70,
      },
      {
        accessorKey: "customer_name",
        header: t("Scheme Name"),
        size: 70,
      },
      {
        accessorKey: "mobile_number",
        header: t("Mobile No"),
        size: 70,
      },
      // {
      //   accessorKey: "email_id",
      //   header: t("Email Id"),
      //   size: 70,
      // },

      {
        accessorKey: "status",
        header: t("Status"),
        size: 70,
      },
      {
        id: "action",
        header: t("Action"),
        size: 50,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        enableSorting: false,

        Cell: ({ row }) => {
          const [anchorEl, setAnchorEl] = useState(null);
          const open = Boolean(anchorEl);
          const handleMenuClick = (event) => {
            setAnchorEl(event.currentTarget);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
          };
          const handleActionClick = (actionHandler) => {
            actionHandler();
            handleMenuClose();
          };

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              {/* Tooltip for better UX */}
              <Tooltip title={t("Edit")}>
                <IconButton
                  aria-label="edit bank details"
                  onClick={handlecustomerEditClick}
                  sx={{ color: "#0d6efd", padding: 0 }}
                >
                  <LiaEditSolid
                    sx={{ color: "rgb(22 59 140)" }} // Use the same color as the menu item
                  />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [t, cacheVersion]
  );

  // 4. Update JSX to render MaterialReactTable
  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="7" md="6" xs="6">
            <div className="page-nav py-3">
              {/* 1. Translate "Customer" */}
              <span className="nav-list">{t("Payment Approval")}</span>
            </div>
          </Col>
          {/* <Col lg="5" md="6" xs="6" className="align-self-center text-end">
            <ClickButton
              label={<>{t("Add Customer")}</>}
              onClick={() => navigate("/console/master/customer/create")}
            ></ClickButton>
          </Col> */}
          {/* ... (Search Bar remains the same) ... */}
          {/* <Col
            lg="3"
            md="5"
            xs="12"
            className="py-1"
            style={{ marginLeft: "-10px" }}
          >
            <TextInputForm
              placeholder={"Search Group"}
              prefix_icon={<FaMagnifyingGlass />}
              onChange={(e) => handleSearch(e.target.value)}
              labelname={"Search"}
            >
              {" "}
            </TextInputForm>
          </Col> */}
          <Col lg={9} md={12} xs={12} className="py-2"></Col>

          {/* 5. Replace TableUI with MaterialReactTable */}
          {loading ? (
            <LoadingOverlay isLoading={loading} />
          ) : (
            <>
              <Col lg="12" md="12" xs="12" className="px-0">
                <div className="py-1">
                  <MaterialReactTable
                    columns={columns}
                    data={customerData}
                    enableColumnActions={false}
                    enableColumnFilters={true}
                    enablePagination={true}
                    enableSorting={true}
                    initialState={{ density: "compact" }}
                    muiTablePaperProps={{
                      sx: {
                        borderRadius: "5px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        //textAlign: "center",
                      },
                    }}
                    muiTableHeadCellProps={{
                      sx: {
                        fontWeight: "bold",
                        backgroundColor: "black",
                        color: "white",
                        alignItems: "center", // Light gray header background
                      },
                    }}
                  />
                </div>
              </Col>
            </>
          )}
          <Col lg="4"></Col>
        </Row>
      </Container>
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ padding: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
            }}
          >
            {/* The full-size image */}
            <img
              src={previewImage}
              alt="Customer Proof Preview"
              style={{
                maxWidth: " 80%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />

            {/* Close Button */}
            <Delete
              label="Close"
              onClick={handlePreviewClose}
              style={{ marginTop: "16px" }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customer;
