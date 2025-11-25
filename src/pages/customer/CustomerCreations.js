import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Select from "react-select";
import { TextInputForm } from "../../components/Forms";
import { ClickButton, ChooseButton } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import API_DOMAIN from "../../config/config";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../components/LanguageContext";

const CustomerCreations = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { type, rowData } = location.state || {};
  console.log("rowData", rowData);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const initialState =
    type === "edit"
      ? {
          ...rowData,
        }
      : {
          name: "",
          phone: "",
          address: "",
          place: "",
          img: "",
          proof_img: "",
        };

  const [formData, setFormData] = useState(initialState);
  console.log("data", formData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type !== "edit" && type !== "view") {
      const fetchCustomers = async () => {
        try {
          const response = await fetch(`${API_DOMAIN}/customer.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ search_text: "" }),
          });
          const responseData = await response.json();
          if (responseData.head.code === 200) {
            const customers = responseData.body.customer || [];
            const maxCustomerNo =
              customers
                .map((customer) => {
                  const numericPart = customer.customer_no.startsWith("C")
                    ? customer.customer_no.slice(1)
                    : customer.customer_no;
                  return parseInt(numericPart, 10);
                })
                .filter((num) => !isNaN(num))
                .sort((a, b) => b - a)[0] || 0;
            const nextCustomerNo =
              "C" + (maxCustomerNo + 1).toString().padStart(4, "0");
            setFormData((prev) => ({
              ...prev,
              customer_no: nextCustomerNo,
            }));
          } else {
            console.error("Failed to fetch customers:", responseData.head.msg);
            setFormData((prev) => ({
              ...prev,
              customer_no: "C0001",
            }));
          }
        } catch (error) {
          console.error("Error fetching customers:", error);
          setFormData((prev) => ({
            ...prev,
            customer_no: "C0001",
          }));
        }
      };
      fetchCustomers();
    }
  }, [type]);

  const handleChange = (e, fieldName) => {
    const value = e.target ? e.target.value : e.value;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  // 🔹 Handle when user moves focus away from the input
  const handlePlaceBlur = async () => {
    const place = formData.place?.trim();
    if (!place) return;

    const url = `https://api.postalpincode.in/postoffice/${encodeURIComponent(
      place
    )}`;
    try {
      const resp = await fetch(url);
      const json = await resp.json();
      console.log(json);

      if (
        Array.isArray(json) &&
        json[0].PostOffice &&
        json[0].PostOffice.length > 0
      ) {
        // Find Head Post Office if available
        const headPO = json[0].PostOffice.find(
          (po) => po.BranchType === "Head Post Office"
        );

        const selectedPO = headPO || json[0].PostOffice[0];

        setFormData((prev) => ({
          ...prev,
          pincode: selectedPO.Pincode,
        }));
      }
    } catch (err) {
      console.error("Error fetching pincode:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          current_user_id: user.user_id,
        }),
      });
      console.log("formdata", formData);
      console.log("reasponse", response);
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
        setFormData({
          ...formData,
          proof: [],
          aadharproof: [],
        });
        setTimeout(() => {
          navigate("/console/master/customer");
        }, 1000);
        setLoading(false);
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
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.", {
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

  const handleUpdateSubmit = async () => {
    console.log("Inside handleUpdateSubmit");
    setLoading(true);

    try {
      console.log("123");
      const response = await fetch(`${API_DOMAIN}/customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          edit_customer_id: rowData.customer_id,
          customer_no: formData.customer_no,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          place: formData.place,
          img: formData.img,
          proof_img: formData.proof_img,
          current_user_id: user.user_id,
        }),
      });
      const responseData = await response.json();
      console.log(responseData);
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
        setTimeout(() => {
          navigate("/console/master/customer");
        }, 2000);
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
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("An error occurred. Please try again.", {
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

  //console.log(formData);
  return (
    <div>
      <Container>
        <Row className="regular">
          <Col lg="12" md="12" xs="12" className="py-3">
            <PageNav
              pagetitle={
                type === "view"
                  ? t("Customer View")
                  : type === "edit"
                  ? t("Customer Edit")
                  : t("Customer Creation")
              }
            />
          </Col>
          {(type === "edit" || type === "view") && (
            <Col lg="3" md="4" xs="12" className="py-3">
              <TextInputForm
                placeholder={t("Customer No")}
                labelname={t("Customer No")}
                name="customer_no"
                value={formData.customer_no}
                onChange={(e) => handleChange(e, "customer_no")}
                disabled
              />
            </Col>
          )}
          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              placeholder={t("Name")}
              labelname={t("Customer Name")}
              name="name"
              value={formData.name}
              onChange={(e) => handleChange(e, "name")}
            />
          </Col>
          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              placeholder={t("Mobile Number")}
              labelname={t("Mobile Number")}
              name="phone"
              value={formData.phone}
              onChange={(e) => handleChange(e, "phone")}
            />
          </Col>

          <Col lg="3" md="4" xs="12" className="py-3">
            <TextInputForm
              placeholder={t("Place")}
              labelname={t("Place")}
              name="place"
              value={formData.place}
              onChange={(e) => handleChange(e, "place")}
              onBlur={handlePlaceBlur}
            />
          </Col>
          {/* <Col lg="4" md="12" xs="12" className="py-3">
            <label htmlFor="chit-select">{t("Chit Type")}</label>
            <Select
              id="chit-select"
              placeholder={t("Select Chit Type")}
              isSearchable={true}
              options={chitTypeList.map((item) => ({
                value: item.chit_type_id,
                label: item.chit_type,
              }))}
              onChange={(e) => {
                setFormData({ ...formData, chitType: e.value });
              }}
            />
          </Col> */}
          <Col lg="3" md="4" xs="12" className="py-4">
            <label htmlFor="address">{t("Address")}</label>
            <textarea
              id="address"
              className="form-cntrl-bt w-100"
              placeholder={t("Address")}
              name="address"
              value={formData.address}
              onChange={(e) => handleChange(e, "address")}
            />
          </Col>
          <Col lg="12" md="12" xs="12" className="py-5 align-self-center">
            <div className="text-center">
              {type === "view" ? (
                <ClickButton
                  label={<>{t("Back")}</>}
                  onClick={() => navigate("/console/master/customer")}
                />
              ) : (
                <>
                  {type === "edit" ? (
                    <>
                      <ToastContainer
                        position="top-center"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                      />
                      <span className="mx-2">
                        <ClickButton
                          label={<>{t("Update")}</>}
                          onClick={handleUpdateSubmit}
                          disabled={loading}
                        />
                      </span>
                      <span className="mx-2">
                        <ClickButton
                          label={<>{t("Cancel")}</>}
                          onClick={() => navigate("/console/master/customer")}
                        />
                      </span>
                    </>
                  ) : (
                    <>
                      <ToastContainer
                        position="top-center"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                      />
                      <span className="mx-2">
                        <ClickButton
                          label={
                            loading ? (
                              <>{t("Submitting...")}</>
                            ) : (
                              <>{t("Submit")}</>
                            )
                          }
                          onClick={handleSubmit}
                          disabled={loading}
                        />
                      </span>
                      <span className="mx-2">
                        <ClickButton
                          label={<>{t("Cancel")}</>}
                          onClick={() => navigate("/console/master/customer")}
                        />
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerCreations;
