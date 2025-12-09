import React, { useState, useEffect, useMemo } from "react"; // ADD useMemo
import { Container, Col, Row } from "react-bootstrap";
import { ClickButton } from "../../components/ClickButton";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import "jspdf-autotable";
import { useLanguage } from "../../components/LanguageContext";
import { MaterialReactTable } from "material-react-table";
import { Box, Tooltip, IconButton } from "@mui/material";
import { LiaEditSolid } from "react-icons/lia";
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
        id: "bank_name_display",
        accessorKey: "bank_details",
        header: t("Bank Name"),
        size: 70,
        Cell: ({ cell }) => {
          const fullDetails = cell.getValue();
          if (!fullDetails) return t("N/A");
          const parts = fullDetails.split(", ");
          const bankNamePart = parts.find((part) =>
            part.startsWith("Bank Name:")
          );

          if (bankNamePart) {
            return bankNamePart.replace("Bank Name:", "").trim();
          }
          return fullDetails;
        },
      },
      {
        id: "branch_name_display",
        accessorKey: "bank_details",
        header: t("Branch Name"),
        size: 70,
        Cell: ({ cell }) => {
          const fullDetails = cell.getValue();
          if (!fullDetails) return t("N/A");
          const parts = fullDetails.split(", ");
          const branchNamePart = parts.find((part) =>
            part.startsWith("Branch Name:")
          );

          if (branchNamePart) {
            return branchNamePart.replace("Branch Name:", "").trim();
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
          const handleEditClick = () => {
            handlecustomerEditClick(row.original);
          };
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Tooltip title={t("Edit")}>
                <IconButton
                  aria-label="edit bank details"
                  onClick={handleEditClick}
                  sx={{ color: "#0d6efd", padding: 0 }}
                >
                  <LiaEditSolid sx={{ color: "rgb(22 59 140)" }} />
                </IconButton>
              </Tooltip>
            </Box>
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
          <Col lg="7" md="6" xs="6">
            <div className="page-nav py-3">
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
                    initialState={{
                      density: "compact",
                      columnOrder: [
                        "s_no_key",
                        "upi_id",
                        "bank_name_display", 
                        "branch_name_display", 
                        "action", 
                      ],
                    }}
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

export default Customer;
