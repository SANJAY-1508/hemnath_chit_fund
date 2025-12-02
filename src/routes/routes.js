// src/routesConfig.js
/////////////////////// creations///////////////////////////////////
import CompanyCreation from "../pages/company/CompanyCreation";
import UserCreation from "../pages/users/UserCreation";
import DashBoard from "../pages/DashBoard";
import User from "../pages/users/User";
import Company from "../pages/company/Company";
import Customer from "../pages/customer/Customer";
import CustomerCreations from "../pages/customer/CustomerCreations";
import CustomerDetails from "../pages/customer/CustomerDetails";
import ChitType from "../pages/scheme/scheme";
import ChitTypeCreation from "../pages/scheme/schemeCreation";
import Chit from "../pages/chit/chit";
import ChitCreation from "../pages/chit/chitCreation";
import Chitpayment from "../pages/chitpayment/chitpayment";
import Chitpaymentcreation from "../pages/chitpayment/chitpaymentcreation";
import CustomerBankDetails from "../pages/customer/CustomerBankDetails";
import CustomerHistory from "../pages/CustomerHistory";
import CategoryTwoCreation from "../pages/categorytwo/CategoryTwoCreation";
import ExpenseTwoCreation from "../pages/expensetwo/ExpenseTwoCreation";
import ExpensePage from "../pages/expenses/ExpensePage";
import CollectionReport from "../pages/CollectionReport";

const routes = [
  { path: "/console/dashboard", element: <DashBoard /> },
  { path: "/console/user", element: <User /> },
  { path: "/console/user/create", element: <UserCreation /> },
  { path: "/console/company", element: <Company /> },
  { path: "/console/company/create", element: <CompanyCreation /> },
  { path: "/console/master/customer/create", element: <CustomerCreations /> },
  { path: "/console/master/customer", element: <Customer /> },
  { path: "/console/master/customerdetails", element: <CustomerDetails /> },
  { path: "/console/master/scheme", element: <ChitType /> },
  { path: "/console/master/scheme/create", element: <ChitTypeCreation /> },
  { path: "/console/master/chit", element: <Chit /> },
  { path: "/console/master/chit/create", element: <ChitCreation /> },
  { path: "/console/master/chitpayment", element: <Chitpayment /> },
  { path: "/console/master/chitpayment/create", element: <Chitpaymentcreation /> },

  {
    path: "/console/customer/customerbankdetails",
    element: <CustomerBankDetails />,
  },
  {
    path: "/console/report/customerhistory",
    element: <CustomerHistory />,
  },
  { path: "/console/expense", element: <ExpensePage /> },
  {
    path: "/console/expense/category/create",
    element: <CategoryTwoCreation />,
  },
  { path: "/console/expense/create", element: <ExpenseTwoCreation /> },
  {
    path: "/console/report/collectionreport",
    element: <CollectionReport />,
  },
];

export default routes;
