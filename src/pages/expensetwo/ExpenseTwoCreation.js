import React, { useState, useEffect } from "react";
import { Col, Container, Row, Alert } from "react-bootstrap";
import { TextInputForm } from "../../components/Forms";
import { ClickButton } from "../../components/ClickButton";
import PageNav from "../../components/PageNav";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import API_DOMAIN from "../../config/config";
import "react-toastify/dist/ReactToastify.css";

const ExpenseTwoCreation = () => {
  const location = useLocation();
  const { type, rowData } = location.state || {};
  const navigate = useNavigate();

  const initialExpenseItem = { category_name: "", description: "", amount: "" };

  const initialState =
    type && type !== "create"
      ? {
          expense_date: rowData.expense_date || "",
          expense_data: rowData.expense_data
            ? JSON.parse(rowData.expense_data)
            : [initialExpenseItem],
        }
      : {
          expense_date: "",
          expense_data: [initialExpenseItem],
        };

  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/category_report.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          get_categories: true,
        }),
      });
      const responseData = await response.json();
      if (responseData.head.code === 200) {
        setCategories(responseData.body.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleExpenseItemChange = (index, fieldName, value) => {
    const updatedExpenseData = [...formData.expense_data];
    updatedExpenseData[index] = {
      ...updatedExpenseData[index],
      [fieldName]: value,
    };
    setFormData({
      ...formData,
      expense_data: updatedExpenseData,
    });
  };

  const addExpenseItem = () => {
    setFormData({
      ...formData,
      expense_data: [...formData.expense_data, { ...initialExpenseItem }],
    });
  };

  const removeExpenseItem = (index) => {
    const updatedExpenseData = formData.expense_data.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      expense_data: updatedExpenseData,
    });
  };

  const validateForm = () => {
    if (!formData.expense_date) {
      toast.error("Expense Date cannot be empty!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return false;
    }

    const hasEmptyItem = formData.expense_data.some(
      (item) => !item.category_name || !item.description || !item.amount
    );
    if (hasEmptyItem) {
      toast.error(
        "All expense items must have category, description, and amount!",
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
      return false;
    }

    return true;
  };

  const handleSubmit = async (isEdit = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        expense_date: formData.expense_date,
        expense_data: JSON.stringify(formData.expense_data),
      };

      if (isEdit) {
        submitData.edit_expense_id = rowData.expense_id;
      }

      const response = await fetch(`${API_DOMAIN}/expense.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
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
        setTimeout(() => {
          navigate("/console/expense");
        }, 1000);
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
      toast.error("Failed to save expense. Please try again.", {
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
    setLoading(false);
  };

  const options = categories.map((cat) => ({
    value: cat.category_id,
    label: cat.category_name,
  }));

  const isView = type === "view";

  return (
    <div>
      <Container>
        <Row className="regular ">
          <Col lg="12" md="12" xs="12" className="py-3">
            <PageNav
              pagetitle={`Expense ${
                isView ? " View " : type === "edit" ? " Edit " : " Creation "
              }`}
            />
          </Col>

          <Col lg="2" md="6" xs="12" className="py-3">
            <TextInputForm
              type="date"
              placeholder={"Expense Date"}
              labelname={"Expense Date"}
              name="expense_date"
              value={formData.expense_date}
              onChange={(e) => handleInputChange(e, "expense_date")}
              disabled={isView}
            />
          </Col>

          <Col lg="12" md="12" xs="12" className="py-3">
            <div className="">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.expense_data.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Select
                          placeholder="Select Category"
                          options={options}
                          value={
                            options.find(
                              (opt) => opt.value === item.category_name
                            ) || null
                          }
                          onChange={(selected) =>
                            handleExpenseItemChange(
                              index,
                              "category_name",
                              selected ? selected.value : ""
                            )
                          }
                          isDisabled={isView}
                          isMulti={false}
                          className="w-100"
                        />
                      </td>
                      <td>
                        <TextInputForm
                          placeholder={"Description"}
                          labelname={""}
                          name={`description_${index}`}
                          value={item.description}
                          onChange={(e) =>
                            handleExpenseItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          disabled={isView}
                        />
                      </td>
                      <td>
                        <TextInputForm
                          type="text"
                          placeholder={"Amount"}
                          labelname={""}
                          name={`amount_${index}`}
                          value={item.amount}
                          onChange={(e) =>
                            handleExpenseItemChange(
                              index,
                              "amount",
                              e.target.value
                            )
                          }
                          disabled={isView}
                        />
                      </td>
                      <td>
                        {!isView && (
                          <ClickButton
                            label={<>Remove</>}
                            variant="danger"
                            onClick={() => removeExpenseItem(index)}
                            size="sm"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isView && (
              <ClickButton
                label={<>Add Row</>}
                onClick={addExpenseItem}
                variant="primary"
              />
            )}
          </Col>

          <Col lg="12" md="12" xs="12" className="py-5 align-self-center">
            <div className="text-center">
              {isView ? (
                <ClickButton
                  label={<>Back</>}
                  onClick={() => navigate("/console/expense")}
                />
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
                          <>Submitting...</>
                        ) : type === "edit" ? (
                          <>Update</>
                        ) : (
                          <>Submit</>
                        )
                      }
                      onClick={() => handleSubmit(type === "edit")}
                      disabled={loading}
                    />
                  </span>
                  <span className="mx-2">
                    <ClickButton
                      label={<>Cancel</>}
                      onClick={() => navigate("/console/expense")}
                    />
                  </span>
                </>
              )}
            </div>
          </Col>
        </Row>
        {error && (
          <Alert variant="danger" className="error-alert">
            {error}
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default ExpenseTwoCreation;
