import React from "react";
import { Buttons } from "./Buttons";
import { FaTimes } from "react-icons/fa";

const PageTitle = ({ PageTitle, showButton = true, CloseClick }) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="regular m-0">{PageTitle}</h5>
        </div>
        {/* Conditionally render the button */}
        {showButton && (
          <div>
            <Buttons
              className="action-btn"
              btnlabel={<FaTimes size={20} />}
              onClick={CloseClick}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PageTitle;
