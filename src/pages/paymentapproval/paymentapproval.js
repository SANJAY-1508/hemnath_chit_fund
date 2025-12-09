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

  // 1. Handlers for View  Edit and Delete Action
  const handlecustomerEditClick = (rowData) => {
    navigate("/console/master/paymentapproval/create", {
      state: { type: "edit", rowData: rowData },
    });
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
                  onClick={() =>
                    handleActionClick(() =>
                      handlecustomerEditClick(row.original)
                    )
                  }
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
          <Col lg={9} md={12} xs={12} className="py-2"></Col>
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
                        alignItems: "center", 
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
    </div>
  );
};

export default Customer;
