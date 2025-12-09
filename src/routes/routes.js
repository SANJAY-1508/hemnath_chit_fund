// src/routesConfig.js
/////////////////////// creations///////////////////////////////////
import CompanyCreation from "../pages/company/CompanyCreation";
import UserCreation from "../pages/users/UserCreation";
import DashBoard from "../pages/DashBoard";
import User from "../pages/users/User";
import Company from "../pages/company/Company";
import Customer from "../pages/customer/Customer";
import CustomerCreations from "../pages/customer/CustomerCreations";
import ChitType from "../pages/scheme/scheme";
import ChitTypeCreation from "../pages/scheme/schemeCreation";
import Banner from "../pages/banner/bannner";
import BankDetails from "../pages/BankDetails/BankDetails";
import BankDetailsCreations from "../pages/BankDetails/BankDetailsCreation";
import Chit from "../pages/chit/chit";
import ChitCreation from "../pages/chit/chitCreation";
import Chitpayment from "../pages/chitpayment/chitpayment";
import Chitpaymentcreation from "../pages/chitpayment/chitpaymentcreation";
import PaymentApproval from "../pages/paymentapproval/paymentapproval";
import PaymentApprovalCreations from "../pages/paymentapproval/PaymentApprovalCreate";
import PaymentDetailsView from "../pages/paymentapproval/paymentdetailsview";
import ChatSupport from "../pages/chatsupport/ChatSupport";
import ChatView from "../pages/chatsupport/ChatView";
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
  { path: "/console/master/bankdetails", element: <BankDetails /> },
  {
    path: "/console/master/bankdetails/create",
    element: <BankDetailsCreations />,
  },
  { path: "/console/master/customer", element: <Customer /> },
  { path: "/console/master/scheme", element: <ChitType /> },
  { path: "/console/master/scheme/create", element: <ChitTypeCreation /> },
  { path: "/console/master/banner", element: <Banner /> },
  { path: "/console/master/chit", element: <Chit /> },
  { path: "/console/master/chit/create", element: <ChitCreation /> },
  { path: "/console/master/chitpayment", element: <Chitpayment /> },
  {
    path: "/console/master/chitpayment/create",
    element: <Chitpaymentcreation />,
  },
  {
    path: "/console/master/paymentapproval/create",
    element: <PaymentApprovalCreations />,
  },

  {
    path: "/console/master/paymentapproval/payment-details/:customerId",
    element: <PaymentDetailsView />,
  },
  
  { path: "/console/master/chatsupport", element: <ChatSupport /> },
  { path: "/console/master/chatsupport/chatview", element: <ChatView /> },
  { path: "/console/master/paymentapproval", element: <PaymentApproval /> },

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
