import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Col,
  Row,
  Tabs,
  Tab,
  Modal,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import { ClickButton } from "../../components/ClickButton";
import { useNavigate } from "react-router-dom";
import API_DOMAIN from "../../config/config";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLanguage } from "../../components/LanguageContext";
import { MdOutlineDelete } from "react-icons/md";
import { FaImage } from "react-icons/fa";

// Define the API paths
const BANNER_ONE_API = `${API_DOMAIN}/banner_one.php`;
const BANNER_TWO_API = `${API_DOMAIN}/banner_two.php`;

const Banner = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("bannerOne");
  const [bannerOneData, setBannerOneData] = useState([]);
  const [bannerTwoData, setBannerTwoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64Image, setBase64Image] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: null });

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user.role === "Admin";

  const getLocalImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("https://localhost/uploads/")) {
      const relativePath = url.replace("https://localhost/", "");
      return `http://localhost/hemmath_chit_fund_backend/${relativePath}`;
    }
    return url;
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setBase64Image("");
    setFilePreview(null);
  };

  const handleShowModal = () => setShowModal(true);

  // Base64 Image Conversion Logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Handler for the Modal
  const handleSaveBanner = async () => {
    if (!base64Image) {
      toast.error(t("Please select an image first."));
      return;
    }
    setLoading(true);
    const type = activeTab === "bannerOne" ? "one" : "two";
    const apiPath = type === "one" ? BANNER_ONE_API : BANNER_TWO_API;

    try {
      const payload = {
        current_user_id: user.id,
        image_url: base64Image,
      };

      const response = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(
          responseData.head.msg || t("Banner saved successfully!"),
          {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
        handleCloseModal();
        fetchData();
      } else {
        toast.error(responseData.head.msg || t("Failed to save banner."), {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error(t("An error occurred while saving the banner."), {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Banner One Data
      const resOne = await fetch(BANNER_ONE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });
      const dataOne = await resOne.json();

      if (dataOne.head.code === 200) {
        setBannerOneData(
          Array.isArray(dataOne.body.banner_one) ? dataOne.body.banner_one : []
        );
      } else {
        setBannerOneData([]);
      }

      // Fetch Banner Two Data
      const resTwo = await fetch(BANNER_TWO_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search_text: "" }),
      });
      const dataTwo = await resTwo.json();

      if (dataTwo.head.code === 200) {
        setBannerTwoData(
          Array.isArray(dataTwo.body.banner_two) ? dataTwo.body.banner_two : []
        );
      } else {
        setBannerTwoData([]);
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

  const handleConfirmDeleteShow = (id, type) => {
    setDeleteTarget({ id, type });
    setShowConfirmModal(true);
  };

  const handleConfirmDeleteCancel = () => {
    setDeleteTarget({ id: null, type: null });
    setShowConfirmModal(false);
  };

  const handleConfirmDeleteExecute = () => {
    handleDeleteClick(deleteTarget.id, deleteTarget.type);
    handleConfirmDeleteCancel(); // Close the confirmation modal
  };

  const handleDeleteClick = async (id, type) => {
    setLoading(true);
    const apiPath = type === "one" ? BANNER_ONE_API : BANNER_TWO_API;

    try {
      const response = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: id, current_user_id: user.id }),
      });

      const responseData = await response.json();

      if (responseData.head.code === 200) {
        toast.success(responseData.head.msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        fetchData(); // Refetch data
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
        console.error(`Error deleting banner ${type}:`, responseData.head.msg);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const BannerImageList = ({ data, type }) => {
    if (!data || data.length === 0) {
      return <p className="text-center py-4">{t("No banners found.")}</p>;
    }

    return (
      <Row className="mt-3">
        {data.map((item, index) => {
          const imageSrc = getLocalImageUrl(item.img);
          const showImage = imageSrc && imageSrc.includes("uploads/");

          return (
            <Col
              lg={3}
              md={4}
              sm={6}
              xs={12}
              key={item.id || index}
              className="mb-4"
            >
              <Card>
                <div
                  style={{
                    position: "relative",
                    height: "200px",
                    overflow: "hidden",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {showImage ? (
                    <Card.Img
                      variant="top"
                      src={imageSrc}
                      alt={`Banner ${index + 1}`}
                      style={{
                        objectFit: "fill",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <div className="h-100 d-flex justify-content-center align-items-center text-muted">
                      {t("No Image Available")}
                    </div>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    className="p-1"
                    // 💡 Calls the confirmation modal handler
                    onClick={() => handleConfirmDeleteShow(item.id, type)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      zIndex: 10,
                    }}
                  >
                    <MdOutlineDelete size={20} />
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  // --- Main Render ---

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="3" md="3" xs="4">
            <div className="page-nav py-3">
              <span className="nav-list">{t("Banner")}</span>
            </div>
          </Col>

          <Col
            lg="9"
            md="9"
            xs="8"
            className="align-self-center text-end text-nowrap"
          >
            {isAdmin && (
              <ClickButton
                label={
                  activeTab === "bannerOne"
                    ? t("Add Banner One")
                    : t("Add Banner Two")
                }
                onClick={handleShowModal}
              />
            )}
          </Col>
        </Row>

        {loading ? (
          <LoadingOverlay isLoading={loading} />
        ) : (
          <Row>
            <Col lg="12" className="px-0">
              <Tabs
                id="banner-control-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
                style={{ borderBottom: "none" }}
              >
                <Tab
                  eventKey="bannerOne"
                  title={
                    <span
                      style={{
                        // Base style for all tabs
                        padding: "10px 15px",
                        borderRadius: "5px 5px 0 0",
                        fontWeight:
                          activeTab === "bannerOne" ? "bold" : "normal",
                        backgroundColor:
                          activeTab === "bannerOne" ? "#fff" : "#e9ecef", // White background for active
                        color:
                          activeTab === "bannerOne" ? "#495057" : "#6c757d",
                        transition: "all 0.3s ease",
                        boxShadow:
                          activeTab === "bannerOne"
                            ? "0 -2px 5px rgba(0,0,0,0.05)"
                            : "none",
                      }}
                    >
                      {t("Banner One List")}
                    </span>
                  }
                >
                  <BannerImageList data={bannerOneData} type="one" />
                </Tab>

                {/* Tab for Banner Two List */}
                <Tab
                  eventKey="bannerTwo"
                  title={
                    <span
                      style={{
                        padding: "10px 15px",
                        borderRadius: "5px 5px 0 0",
                        fontWeight:
                          activeTab === "bannerTwo" ? "bold" : "normal",
                        backgroundColor:
                          activeTab === "bannerTwo" ? "#fff" : "#e9ecef", // White background for active
                        color:
                          activeTab === "bannerTwo" ? "#495057" : "#6c757d", // Dark text for active
                        transition: "all 0.3s ease",
                        boxShadow:
                          activeTab === "bannerTwo"
                            ? "0 -2px 5px rgba(0,0,0,0.05)"
                            : "none",
                      }}
                    >
                      {t("Banner Two List")}
                    </span>
                  }
                >
                  <BannerImageList data={bannerTwoData} type="two" />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        )}
      </Container>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered       
        backdrop="static" // Setting backdrop to "static" prevents closing when clicking outside
        keyboard={false} // Prevent ESC key from closing
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("Upload Banner Image")} (
            {activeTab === "bannerOne" ? t("Banner One") : t("Banner Two")})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>
                <Button variant="primary" as="span">
                  <FaImage className="me-2" />
                  {t("Choose Image")}
                </Button>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="d-none"
                />
              </Form.Label>
              <p className="mt-2 text-muted">
                {selectedFile ? selectedFile.name : t("No image selected")}
              </p>
            </Form.Group>

            {filePreview && (
              <div className="mb-3 text-center">
                <p className="fw-bold mb-1">{t("Preview")}</p>
                <img
                  src={filePreview}
                  alt="Image Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="error" onClick={handleCloseModal}>
            {t("Cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveBanner}
            disabled={!base64Image || loading}
          >
            {loading ? t("Saving...") : t("Save")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 2. Delete Confirmation Modal Popup */}
      <Modal
        show={showConfirmModal}
        onHide={handleConfirmDeleteCancel}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            {t("Confirm Deletion")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="lead">
            {t("Are you sure you want to delete this banner?")}
          </p>
          <p className="text-muted small">
            {t("This action cannot be undone.")}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleConfirmDeleteCancel}>
            {t("Cancel")}
          </Button>
          <Button variant="danger" onClick={handleConfirmDeleteExecute}>
            {t("Delete")}
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Banner;
