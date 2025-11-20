import React, { useState, useEffect, useMemo } from "react"; // ADD useMemo
import { Container, Col, Row } from "react-bootstrap";
import { TextInputForm } from "../../components/Forms";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { ClickButton, Delete } from "../../components/ClickButton";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import { useMediaQuery } from "react-responsive";
import LoadingOverlay from "../../components/LoadingOverlay";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from "@mui/icons-material/Visibility";

import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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

  const handleJewelcustomerViewClick = (rowData) => {
    navigate("/console/master/customerdetails", {
      state: { type: "view", rowData: rowData },
    });
  };
  const handleJewelcustomerEditClick = (rowData) => {
    navigate("/console/master/customer/create", {
      state: { type: "edit", rowData: rowData },
    });
  };
  const handleJewelcustomerDeleteClick = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete_customer_id: id,
          login_id: user.id,
          user_name: user.user_name,
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        navigate("/console/master/customer");
        // window.location.reload();
      } else {
        console.log(responseData.head.msg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };
  // 2. Data Fetching Logic (Unchanged)
  const fetchDatajewelpawncustomer = async () => {
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
      console.log(responseData);
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
    fetchDatajewelpawncustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  ///for pdf and excel download
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape", // landscape mode
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text("Customer List", 14, 15); // title at top

    doc.autoTable({
      startY: 25, // start table below title
      head: [
        [
          "NO",
          "CUSTOMER NO",
          "NAME",
          "ADDRESS",
          "PLACE",
          "PINCODE",
          "PHONE NO",
          "ADDITIONAL NO",
          "REFERENCE",
          "PROOF TYPE",
          "PROOF NO",
        ],
      ],
      body: customerData.map((item, index) => [
        index + 1,
        item.customer_no,
        item.name,
        item.customer_details,
        item.place,
        item.pincode,
        item.mobile_number,
        item.addtionsonal_mobile_number,
        item.reference,
        item.upload_type,
        item.proof_number,
      ]),
      styles: {
        fontSize: 10, // reduce font to fit more columns
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [22, 160, 133], // optional: header color
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        3: { cellWidth: 40 }, // ADDRESS column wider
        4: { cellWidth: 25 }, // PLACE column
        8: { cellWidth: 30 }, // REFERENCE column
      },
      theme: "grid",
      didDrawPage: (data) => {
        // optional: page numbers
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    doc.save("Customer_List.pdf");
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [
        "NO",
        "CUSTOMER NO",
        "NAME",
        "ADDRESS",
        "PLACE",
        "PINCODE",
        "PHONE NO",
        "ADDITIONAL NO",
        "REFERENCE",
        "PROOF TYPE",
        "PROOF NO",
      ],
      ...customerData.map((item, index) => [
        index + 1,
        item.customer_no,
        item.name,
        item.customer_details,
        item.place,
        item.pincode,
        item.mobile_number,
        item.addtionsonal_mobile_number,
        item.reference,
        item.upload_type,
        item.proof_number,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "Customer_List.xlsx");
  };
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
        accessorKey: "name",
        header: t("Customer Name"),
        size: 70,
      },
      {
        accessorKey: "mobile_number",
        header: t("Mobile No"),
        size: 70,
      },
      {
        accessorKey: "customer_details",
        header: t("Address"),
        size: 70,
      },
     {
  id: "action",
  header: t("Action"),
  size: 50, // Set size smaller since the content is now just one icon
  enableColumnFilter: false,
  enableColumnOrdering: false,
  enableSorting: false,

  Cell: ({ row }) => {
    // 1. State for managing the menu anchor element (where the menu pops up from)
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // 2. Handlers for opening and closing the menu
    const handleMenuClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    
    // 3. Wrapper function for action clicks that also closes the menu
    const handleActionClick = (actionHandler) => {
        actionHandler();
        handleMenuClose(); // Close the menu after clicking an action
    };


    return (
      // The Box now only needs to center the single menu icon
      <Box
        sx={{
          display: "flex",
          justifyContent: "center", // Center the single icon
        }}
      >
        {/* 4. The main IconButton to open the menu */}
        <Tooltip title={t("Actions")}>
          <IconButton
            aria-label="more actions"
            aria-controls={open ? 'action-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuClick}
            sx={{ padding: 0 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        {/* 5. The Menu Component */}
        <Menu
          id="action-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          // The anchorOrigin helps position the menu correctly relative to the icon
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {/* View Action */}
          <MenuItem 
            onClick={() => handleActionClick(() => handleJewelcustomerViewClick(row.original))}
          >
            <VisibilityIcon sx={{ mr: 1, color: "grey" }} />
            {t("view")}
          </MenuItem>

          {/* Edit Action */}
          <MenuItem 
            onClick={() => handleActionClick(() => handleJewelcustomerEditClick(row.original))}
          >
            <DriveFileRenameOutlineIcon sx={{ size:8, mr: 1, color: "rgb(22 59 140)" }} />
            {t("Edit")}
          </MenuItem>

          {/* Delete Action */}
          <MenuItem 
            onClick={() => handleActionClick(() => handleJewelcustomerDeleteClick(row.original.customer_id))}
          >
            {/* USE THE OFFICIAL MUI ICON NAME */}
            <DeleteOutlineIcon sx={{ mr: 1, color: "#991212" }} /> 
            {t("Delete")}
          </MenuItem>
        </Menu>
      </Box>
    );
  },
}
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
              <span className="nav-list">{t("Customer")}</span>
            </div>
          </Col>
          <Col lg="5" md="6" xs="6" className="align-self-center text-end">
            <ClickButton
              label={<>{t("Add Customer")}</>}
              onClick={() => navigate("/console/master/customer/create")}
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
                        color:"white", 
                        alignItems: "center",// Light gray header background
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
