import { MdSpaceDashboard } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { BsBuildings, BsBarChartFill, BsBank } from "react-icons/bs";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { PiUsersThreeBold } from "react-icons/pi";
import { TbArrowsShuffle } from "react-icons/tb";
import { MdCategory } from "react-icons/md";
import { FaCogs, FaBoxes, FaHandshake } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";

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
        path: "/console/master/chittype",
        text: "Chit Plan Type",
        icon: <MdCategory />,
      },
      {

        path: "/console/master/customer",
        icon: <PiUsersThreeBold />,
        text: "Customer",
      },
    ],
  },

  
 {
    path: "/console/master/chit",
    text: "Chit",
    icon: <MdCategory />,
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
        text: "CustomerHistory",
        icon: <FaMoneyBillTrendUp />,
      },
    ],
  },
];

export default sidebarConfig;
