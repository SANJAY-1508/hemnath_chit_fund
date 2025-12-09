import { MdSpaceDashboard } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { FaMoneyBillWave } from 'react-icons/fa';
import { BsBuildings, BsBarChartFill } from "react-icons/bs";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { PiUsersThreeBold } from "react-icons/pi";
import { MdCategory } from "react-icons/md";
import { FaCogs, FaMoneyCheck } from "react-icons/fa";
import { BiCollection } from "react-icons/bi";
import { BsChatDotsFill } from "react-icons/bs";
import { BsFillImageFill } from "react-icons/bs";
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import CreditScoreIcon from '@mui/icons-material/CreditScore';

const sidebarConfig = [
  {
    path: "/console/dashboard",
    icon: <MdSpaceDashboard />,
    text: "Dashboard",
  },
  {
    path: "/console/user",
    icon: <FiUsers />,
    text: "User & Access",
  },
  {
    path: "/console/company",
    icon: <BsBuildings />,
    text: "Company",
  },
  {
    text: "Master",
    icon: <FaCogs />,
    subMenu: [
      {
        path: "/console/master/scheme",
        text: "Scheme",
        icon: <MdCategory />,
      },
      {
        path: "/console/master/customer",
        icon: <PiUsersThreeBold />,
        text: "Customer",
      },
       {
        path: "/console/master/banner",
        icon: <BsFillImageFill />,
        text: "Banner",
      },
       {
        path: "/console/master/bankdetails",
        icon: <AssuredWorkloadIcon />,
        text: "Bank Details",
      },
    ],
  },

  {
    path: "/console/master/chit",
    text: "Chit",
    icon: <FaMoneyCheck />,
  },
   {
    path: "/console/master/chitpayment",
    text: "Chit Payment",
    icon: <FaMoneyBillWave />,
  },
  {
    path: "/console/master/paymentapproval",
    text: "Payment Approval",
    icon: <CreditScoreIcon />,
  },
    {
    path: "/console/master/chatsupport",
    text: "Chat Support",
    icon: <BsChatDotsFill />,
  },

  {
    path: "/console/expense",
    text: "Expense",
    icon: <FaMoneyBillTrendUp />,
  },
  {
    text: "Reports",
    icon: <BsBarChartFill />,
    subMenu: [
      {
        path: "/console/report/customerhistory",
        text: "Customer History",
        icon: <FaMoneyBillTrendUp />,
      },
      {
        path: "/console/report/collectionreport",
        text: "Collection Report",
        icon: <BiCollection />,
      },
    ],
  },
];

export default sidebarConfig;
