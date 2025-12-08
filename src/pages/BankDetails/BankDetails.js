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
import {
  Box,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  Button,
  Menu, // <-- New component
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const Customer = () => {
  const navigate = useNavigate();
  const { t, cacheVersion } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [customerData, setcustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  const handlecustomerEditClick = (rowData) => {
    navigate("/console/master/bankdetails/create", {
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
  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/bank_details.php`, {
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
        setcustomerData(responseData.body.bank_details);
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
    fetchBankDetails();
  }, [searchText]);

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
      accessorKey: "upi_id", 
      header: t("UPI Id"),
      size: 70,
    },
    {
      // The accessorKey will be the whole 'bank_details' string
      accessorKey: "bank_details", 
      header: t("Bank Name"),
      size: 70,
      Cell: ({ cell }) => {
        const fullDetails = cell.getValue();        
        if (!fullDetails) return t("N/A");
        const parts = fullDetails.split(", "); 
        const bankNamePart = parts.find(part => part.startsWith("Bank Name:"));

        if (bankNamePart) {
          return bankNamePart.replace("Bank Name:", "").trim();
        }
        return fullDetails; 
      },
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
                justifyContent: "center",
              }}
            >
              <Tooltip title={t("Actions")}>
                <IconButton
                  aria-label="more actions"
                  aria-controls={open ? "action-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleMenuClick}
                  sx={{ padding: 0 }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="action-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {/* Edit Action */}
                <MenuItem
                  onClick={() =>
                    handleActionClick(() =>
                      handlecustomerEditClick(row.original)
                    )
                  }
                >
                  <DriveFileRenameOutlineIcon
                    sx={{ size: 8, mr: 1, color: "rgb(22 59 140)" }}
                  />
                  {t("Edit")}
                </MenuItem>

                {/* Delete Action */}
                <MenuItem
                  onClick={() =>
                    handleActionClick(() =>
                      // NOTE: Changed customer_id to id to match your API response structure
                      handlecustomerDeleteClick(row.original.id) 
                    )
                  }
                >
                  <DeleteOutlineIcon sx={{ mr: 1, color: "#991212" }} />
                  {t("Delete")}
                </MenuItem>
              </Menu>
            </Box>
          );
      },
    },
  ],
  [t] 
);

  // 4. Update JSX to render MaterialReactTable
  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="7" md="6" xs="6">
            <div className="page-nav py-3">
              {/* 1. Translate "Customer" */}
              <span className="nav-list">{t("Bank Details")}</span>
            </div>
          </Col>
          <Col lg="5" md="6" xs="6" className="align-self-center text-end">
            <ClickButton
              label={<>{t("Add Bank Details")}</>}
              onClick={() => navigate("/console/master/bankdetails/create")}
            ></ClickButton>
          </Col>
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
    </div>
  );
};

export default Customer;
