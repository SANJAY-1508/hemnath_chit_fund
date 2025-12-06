import React, { useState, useEffect, useMemo } from "react";
import { Container, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import "jspdf-autotable";
import { useLanguage } from "../../components/LanguageContext";
import { MaterialReactTable } from "material-react-table";
import { Box, Tooltip, IconButton } from "@mui/material";
import { FaEye } from "react-icons/fa";

const ChatSupport = () => {
  const navigate = useNavigate();
  const { t, cacheVersion } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [customerData, setcustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // 2. **NEW** Handlers for Action Menu
  const handleMenuClick = (event, rowData) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowData(rowData);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowData(null);
  };

  const handleViewChatClick = async (rowData) => {
    if (!rowData) return;
    const customerId = rowData.customer_id;
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chat.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "list", 
          customer_id: customerId,
        }),
      });

      const responseData = await response.json();
      setLoading(false);

      if (responseData.head.code === 200) {
        fetch(`${API_DOMAIN}/chat.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "seen",
            customer_id: customerId,
            sender: "customer",
          }),
        }).catch((error) => {
          console.error("Error sending seen confirmation:", error);
        }); 
        navigate("/console/master/chatsupport/chatview", {
          state: {
            customerId: customerId,
            customerName: rowData.customer_name,
            messages: responseData.body.messages,
          },
        });
      } else {
        alert(t("Failed to fetch chat messages: ") + responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching chat data:", error.message);
      alert(t("An error occurred while fetching chat data."));
    }
  };

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
        header: t("Customer Name"),
        size: 70,
      },
      {
        accessorKey: "mobile_number",
        header: t("Mobile No"),
        size: 70,
      },
      {
        accessorKey: "email_id",
        header: t("Email Id"),
        size: 70,
      },
      {
        id: "action",
        header: t("Action"),
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <Box sx={{ display: "flex", gap: "10px" }}>
              <Tooltip title={t("Actions")}>
                {/* Click the Icon to open the Menu/Dropdown */}
                <IconButton
                 onClick={() => handleViewChatClick(row.original)}
                  sx={{ color: "#0d6efd", padding: 0 }}
                  aria-controls={menuOpen ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? "true" : undefined}
                >
                  <FaEye />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [t, cacheVersion, menuOpen]
  );

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="7" md="6" xs="6">
            <div className="page-nav py-3">
              <span className="nav-list">{t("Customer List")}</span>
            </div>
          </Col>

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

export default ChatSupport;
