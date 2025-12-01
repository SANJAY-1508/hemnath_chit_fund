import React, { useState, useEffect, useMemo } from "react"; // ADD useMemo
import { Container, Col, Row } from "react-bootstrap";
import { ClickButton } from "../../components/ClickButton";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
// ✅ NEW IMPORT for Language Context
import { useLanguage } from "../../components/LanguageContext";

// 💡 NEW IMPORTS FOR MATERIAL REACT TABLE
import { MaterialReactTable } from "material-react-table";
import { Box, Tooltip, IconButton } from "@mui/material";
import { LiaEditSolid } from "react-icons/lia";
import { MdOutlineDelete } from "react-icons/md";

const User = () => {
  const { t,cacheVersion} = useLanguage();
  
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    RoleSelection: "",
    Username: "",
  });

  // 1. Handlers for Edit and Delete Actions
  const handleEditClick = (rowData) => {
    navigate("/console/user/create", {
      state: {
        type: "edit",
        rowData: rowData,
      },
    });
  };
  const handleDeleteClick = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/users.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delete_user_id: userId,
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        navigate("/console/user");
        window.location.reload();
        //setLoading(false);
      } else {
       
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(true);
    }
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user.role === "Admin";

  // 2. Data Fetching Logic (Unchanged)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_DOMAIN}/users.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search_text: searchText,
          }),
        });

        const responseData = await response.json();

        if (responseData.head.code === 200) {
          let sortedData = responseData.body.user;

          if (formData.RoleSelection) {
            sortedData = sortedData.filter(
              (user) => user.RoleSelection === formData.RoleSelection
            );
          }

          if (formData.Username) {
            sortedData = sortedData.filter(
              (user) => user.Name === formData.Username
            );
          }

          setUserData(sortedData);
          setLoading(false);
        } else {
          throw new Error(responseData.head.msg);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, [searchText, formData]);
  
  // 3. Define Material React Table Columns (Using t() for headers and tooltips)
  const columns = useMemo(
    () => [
     {
        accessorKey: "s_no_key", // Add a unique, stable accessorKey
        header: t("S.No"),
        size: 50,
        enableColumnFilter: false,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: t("Name"),
        size: 50,
      },
      {
        accessorKey: "role",
        header: t("Share"),
        size: 50,
      },
      {
        accessorKey: "phone",
        header: t("Mobile Number"),
        size: 50,
      },
      
      {
        id: "action",
        header: t("Action"),
        size: 100,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Box
            sx={{
              justifyContent: "center",
              gap: "2 rem",
            }}
          >
            <Tooltip title={t("Edit")}>
              <IconButton
                onClick={() => handleEditClick(row.original)}
                sx={{ color: "#0d6efd", padding: 0 }}
              >
                <LiaEditSolid />
              </IconButton>
            </Tooltip>

         
            <Tooltip title={t("Delete")}>
              <IconButton
                onClick={() =>
                  handleDeleteClick(row.original.user_id)
                }
                sx={{ color: "#dc3545", padding: 0 }}
              >
                <MdOutlineDelete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [t,cacheVersion] // ✅ Depend on t to re-run translations when language changes
  );

  // 4. Update JSX to render MaterialReactTable (Using t() for display strings)
  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="7" md="6" xs="6">
            <div className="page-nav py-3">
              <span class="nav-list">{t("User & Access")}</span>
            </div>
          </Col>
          <Col lg="5" md="6" xs="6" className="align-self-center text-end">
            {isAdmin &&(
            <ClickButton
              label={<>{t("Add User")}</>}
              onClick={() => navigate("/console/user/create")}
            >
              
            </ClickButton>
              )}
            
          </Col>
          {/* ... (Search Bar remains the same) ... */}
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
                    data={userData}
                    enableColumnActions={false}
                    enableColumnFilters={false}
                    enablePagination={true}
                    enableSorting={true}
                    initialState={{ density: "compact" }}
                    muiTablePaperProps={{
                      sx: {
                        borderRadius: "5px",
                        // Keep the existing style property for the table container
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        //textAlign: "center",
                      },
                    }}
                    muiTableHeadCellProps={{
                      sx: {
                        fontWeight: "bold",
                        backgroundColor: "#000000ff",
                        color: "white", // Light gray header background
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

export default User;