import React, { useState, useEffect, useMemo } from "react";
import { Container, Col, Row, Modal, Form, Button } from "react-bootstrap";
import { ClickButton } from "../../components/ClickButton";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLanguage } from "../../components/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import { MaterialReactTable } from "material-react-table";
import { Box, Tooltip, IconButton } from "@mui/material";
import { LiaEditSolid } from "react-icons/lia";
import { FiX } from "react-icons/fi";
import { FaEye } from "react-icons/fa";

const Chit = () => {
  const { t, cacheVersion } = useLanguage();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [chitData, setChitData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedChitId, setSelectedChitId] = useState(null);
  const [closeReason, setCloseReason] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user.role === "Admin";

  const fetchData = async () => {
    console.log("Fetching data with search text:", searchText);
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "list_chits",
        }),
      });

      const responseData = await response.json();
      console.log("Fetch Response:", responseData);

      if (responseData.head.code === 200) {
        setChitData(
          Array.isArray(responseData.body.chits) ? responseData.body.chits : []
        );
      } else {
        setChitData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = async (rowData) => {
    console.log("Editing chit with ID:", rowData.chit_id);
    const chitId = rowData.chit_id;
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chit_id: chitId, action: "get_chit_details" }),
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);
      setLoading(false);

      if (
        responseData.head.code === 200 &&
        responseData.body &&
        responseData.body.chit
      ) {
        const detailedRowData = responseData.body.chit;
        const duesArray = responseData.body.dues || [];

        console.log("Detailed Row Data (chit):", detailedRowData);
        console.log("Dues Data:", duesArray);

        navigate("/console/master/chit/create", {
          state: {
            type: "edit",
            rowData: detailedRowData,
            duesData: duesArray,
          },
        });
      } else {
        console.error("Failed to fetch chit details:", responseData.head.msg);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error editing chit:", error);
    }
  };
  const handleViewClick = async (rowData) => {
    const chitId = rowData.chit_id;
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chit_id: chitId }),
      });

      const responseData = await response.json();
      setLoading(false);

      if (
        responseData.head.code === 200 &&
        responseData.data.chit &&
        responseData.data.chit.length > 0
      ) {
        const detailedRowData = responseData.data.chit[0];
        console.log("Detailed Row Data:", detailedRowData);
        navigate("/console/master/chit/create", {
          state: {
            // ⭐ Navigate to 'view' type
            type: "view",
            rowData: detailedRowData,
          },
        });
      } else {
        console.error("Failed to fetch chit details for view");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error viewing chit:", error);
    }
  };

  const handleCloseClick = (chitId) => {
    setSelectedChitId(chitId);
    setCloseReason("");
    setShowCloseModal(true);
  };

  const handleSubmitClose = async () => {
    console.log("Closing chit with ID:", selectedChitId);
    setLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/chit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "foreclose_chit",
          chit_id: selectedChitId,
        }),
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);
      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg || t("Chit closed successfully"));
        setShowCloseModal(false);
        fetchData(); // REFRESH TABLE
      } else {
        toast.error(responseData.head.msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.log("Showing Error Toast with message:", responseData.head.msg);
        setShowCloseModal(false);
      }
    } catch (error) {
      toast.error(t("An error occurred while closing the chit"));
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: t("S.No"),
        Cell: ({ row }) => row.index + 1,
        size: 50,
      },
      {
        accessorKey: "chit_id",
        header: t("Chit ID"),
        size: 100,
      },
       {
        accessorKey: "customer_name",
        header: t("Customer Name"),
        size: 100,
      },
      {
        accessorKey: "scheme_name",
        header: t("Scheme Name"),
        size: 150,
      },
      {
        accessorKey: "schemet_due_amount",
        header: t("Scheme Due Amount"),
        size: 150,
      },
      {
        accessorKey: "scheme_maturtiy_amount",
        header: t("Scheme Maturity Amount"),
        size: 150,
      },
      {
        accessorKey: "total_paid_amount",
        header: t("Total Paid Amount"),
        size: 150,
      },
      {
        id: "action",
        header: t("Action"),
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const isClosed =
            row.original.freeze_at === 1 || row.original.freeze_at === "1";

          return (
            <Box sx={{ display: "flex", gap: "10px" }}>
              {isClosed ? (
                <Tooltip title={t("View")}>
                  <IconButton
                    onClick={() => handleViewClick(row.original)}
                    sx={{ color: "#0d6efd", padding: 0 }}
                  >
                    <FaEye />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title={t("Edit")}>
                    <IconButton
                      onClick={() => handleEditClick(row.original)}
                      sx={{ color: "#0d6efd", padding: 0 }}
                    >
                      <LiaEditSolid />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t("Close")}>
                    <IconButton
                      onClick={() => handleCloseClick(row.original.chit_id)}
                      sx={{ color: "#dc3545", padding: 0 }}
                    >
                      <FiX />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          );
        },
      },
    ],
    [t, cacheVersion]
  );

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="7">
            <div className="page-nav py-3">
              <span className="nav-list">{t("Chit")}</span>
            </div>
          </Col>

          <Col lg="5" className="text-end align-self-center">
            {isAdmin && (
              <ClickButton
                label={<>{t("Add Chit")}</>}
                onClick={() => navigate("/console/master/chit/create")}
              ></ClickButton>
            )}
          </Col>

          <Col lg={12} className="px-0 py-2">
            {loading ? (
              <LoadingOverlay isLoading={loading} />
            ) : (
              <MaterialReactTable
                columns={columns}
                data={chitData}
                enablePagination
                enableSorting
                enableColumnFilters={false}
                enableColumnActions={false}
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
                    backgroundColor: "#000000ff",
                    color: "white",
                  },
                }}
              />
            )}
          </Col>
        </Row>
      </Container>

      {/* CLOSE CHIT MODAL */}
      <Modal
        show={showCloseModal}
        onHide={() => setShowCloseModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("Close Chit")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{t("Close Reason")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder={t("Enter the reason for closing the chit")}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowCloseModal(false)}>
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmitClose}
            disabled={loading}
          >
            {loading ? t("Closing...") : t("Close Chit")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Chit;
