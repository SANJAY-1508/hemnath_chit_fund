import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Button, Collapse, Modal } from "react-bootstrap";
import { BsBoxArrowRight } from "react-icons/bs";
import sidebarConfig from "./menuItems";
import { FiUser } from "react-icons/fi";
import { ClickButton } from "../ClickButton";
import { LuDot } from "react-icons/lu";
import { useLanguage } from '../LanguageContext';


const SideBar = ({ onLogout}) => { 
// ----------------------------------------------------
  const [user, setUser] = useState({});
  const [openMenu, setOpenMenu] = useState(
    JSON.parse(localStorage.getItem("openMenu")) || {}
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleMenuClick = (menuIndex) => {
    setOpenMenu((prevOpenMenu) => {
      const newOpenMenu = {};
      for (const key in prevOpenMenu) {
        newOpenMenu[key] = false;
      }
      newOpenMenu[menuIndex] = !prevOpenMenu[menuIndex];
      return newOpenMenu;
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    localStorage.setItem("openMenu", JSON.stringify(openMenu));
  }, [openMenu]);



  const { t } = useLanguage();
  const translatedMenu = sidebarConfig.map((item) => ({
    ...item,
    text: t(item.text),
  }));

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();

    localStorage.removeItem("user");

    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleShowLogoutModal = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);

  

  return (
    <>
      <div id="sidebar-wrapper" className={isSidebarOpen ? "wrap-remove" : ""}>
        {/* ... (Sidebar menu content remains the same) */}
        <div className="list-group regular">
          <ul>
            <li>
              <div className="user-logo mx-auto  py-3">
                <img
                  src={require("./images/logo1.png")}
                  className="img-fluid logo"
                  alt="Sri Krishna Finance"
                  style={{ marginLeft: "-10px" }}
                />
              </div>
            </li>
            {translatedMenu.map((item, index) => (
              <li key={index}>
                {item.subMenu ? (
                  <>
                    <div
                      className="sub-menu nav-link"
                      onClick={() => handleMenuClick(index)}
                    >
                      <span className="list-icon">{item.icon}</span>
                      <span className="list-text">{item.text}</span> {/* Needs external translation mechanism */}
                      <span
                        className={`list-icon arrow ${
                          openMenu[index] ? "rotate" : ""
                        }`}
                      >
                        <MdOutlineKeyboardArrowRight />
                      </span>
                    </div>
                    <Collapse in={openMenu[index]}>
                      <ul className="submenu-list">
                        {item.subMenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <NavLink
                              to={subItem.path}
                              className="nav-link"
                              onClick={() => {
                                if (window.innerWidth <= 768) {
                                  setIsSidebarOpen(false);
                                }
                              }}
                            >
                              <span className="list-icon">
                                {subItem.icon ? subItem.icon : <LuDot />}{" "}
                              </span>
                              <span className="list-text">{subItem.text}</span> {/* Needs external translation mechanism */}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </Collapse>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className="nav-link"
                    onClick={() => {
                      if (window.innerWidth <= 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  >
                    <span className="list-icon">{item.icon}</span>
                    <span className="list-text">{item.text}</span> {/* Needs external translation mechanism */}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* ---------------------------------------------------- */}
      {/* HEADER / NAVBAR SECTION */}
      {/* ---------------------------------------------------- */}
      <div className="navbar navbar-expand px-lg-4 header">
        {/* ... (Toggle sidebar buttons remain the same) ... */}
        <div className="d-lg-block d-none">
          <Button
            className="menu-toggle"
            onClick={toggleSidebar}
            id="menu-toggle"
          >
            <span className="navbar-toggler-icon"></span>
          </Button>
        </div>
        <div className="d-block d-lg-none ms-auto">
          <Button
            className="menu-toggle"
            onClick={toggleSidebar}
            id="menu-toggle"
          >
            <span className="navbar-toggler-icon"></span>
          </Button>
        </div>
         <div className="collapse navbar-collapse" id="navbar-list">
          <ul className="navbar-nav ms-auto"> 
            
          
            
            {/* Existing User Info */}
            <li className="nav-item mx-3">
              <span className="mx-1">
                <FiUser />
              </span>
              <span className="mx-1"style={{ paddingTop: '10px' }}
              >{user?.user_name || "Aravind"}</span>
            </li>
            
            {/* Existing Logout Button */}
            <li className="nav-item mx-3">
              <button onClick={handleShowLogoutModal}>
                <span className="list-icon" style={{ paddingTop: '10px' }}>
                  <BsBoxArrowRight />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <Modal
        show={showLogoutModal}
        onHide={handleCloseLogoutModal}
        centered
        backdrop="static"
      >
        <Modal.Header>
        <Modal.Title>{t("Logout Confirmation")}</Modal.Title>
        </Modal.Header>
        {/* ✅ TRANSLATED MODAL BODY */}
      <Modal.Body>{t("Are you sure you want to logout?")}</Modal.Body>
        <Modal.Footer>
          {/* ✅ TRANSLATED BUTTON LABELS */}
          <ClickButton label={t("Cancel")} onClick={handleCloseLogoutModal} />
          <ClickButton
            label={t("Logout")}
            variant="primary"
            onClick={handleLogout}
          />
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default SideBar;