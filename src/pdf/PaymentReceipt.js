import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the plugin

// Helper function that contains the core PDF generation logic
const generatePDFContent = (doc, paymentData) => {
  const {
    customerInfo,
    dueInfo,
    payment_amount,
    payment_details_id,
    companyName = "SUNWORD BRAND",
  } = paymentData;

  let y = 15;

  // --- 1. Company Header ---
  doc.setFontSize(22);
  doc.setTextColor(95, 10, 7);
  doc.text(companyName, 105, y, null, null, "center");
  y += 8;

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("Payment Receipt", 105, y, null, null, "center");
  y += 4; // Separator line

  doc.setLineWidth(0.5);
  doc.setDrawColor(150, 150, 150);
  doc.line(20, y, 190, y);
  y += 4; // --- 2. Customer and Due Details (Side-by-Side) ---

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);

  // Use a single table with two columns for the metadata section
  doc.autoTable({
    startY: y,
    theme: "plain",
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 10,
      cellPadding: 2,
      textColor: [40, 40, 40],
    },
    body: [
      [
        { content: "Customer Details", styles: { fontStyle: "bold" } },
        { content: "Transaction Details", styles: { fontStyle: "bold" } },
      ],
      [
        `Customer No : ${customerInfo.customer_no || "N/A"}
Customer Name : ${customerInfo.name || "N/A"}
Mobile        : ${customerInfo.mobile || "N/A"}`,
        `Transaction ID : ${payment_details_id}
Due Number     : ${dueInfo.due_number || "N/A"}
Due Date       : ${dueInfo.due_date || "N/A"}
Payment Date   : ${new Date().toLocaleDateString("en-GB")}`,
      ],
    ],
  });

  y = doc.lastAutoTable.finalY + 2; // --- 3. Main Payment Table ---
  y += 3;

  const tableHeaders = [["#", "Description", "Due Amount", "Paid Amount"]];

  const formattedDueAmount = `${Number(dueInfo.due_amount || 0).toFixed(2)}`;
  const formattedPaidAmount = `${Number(payment_amount || 0).toFixed(2)}`;

  const tableBody = [
    [
      "1",
      `Payment for Due #${dueInfo.due_number || "N/A"}`,
      formattedDueAmount,
      formattedPaidAmount,
    ],
  ]; // Main Content Table

  doc.autoTable({
    startY: y,
    head: tableHeaders,
    body: tableBody,
    theme: "striped",
    styles: { cellPadding: 2, fontSize: 10, valign: "middle", halign: "left" },
    headStyles: { fillColor: [95, 10, 7], textColor: 255, fontStyle: "bold" },
    margin: { left: 20, right: 20 },
  }); // Update y to be below the main table for the total amount

  y = doc.lastAutoTable.finalY; // --- 4. Total Amount Footer ---

 

  // --- Footer Message ---
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `This is a computer-generated receipt and requires no signature.`,
    105,
    280,
    null,
    null,
    "center"
  );
};

// ----------------------------------------------------------------------
// EXPORTED FUNCTION 1: Used for Approval Screen (Opens in new tab)
// ----------------------------------------------------------------------
export const exportPaymentToPDF_View = (paymentData) => {
  const doc = new jsPDF();
  generatePDFContent(doc, paymentData);
  doc.output("dataurlnewwindow");
};

// ----------------------------------------------------------------------
// EXPORTED FUNCTION 2: Used for Table View (Downloads the file)
// ----------------------------------------------------------------------
export const exportPaymentToPDF_Download = (paymentData) => {
  const doc = new jsPDF();
  generatePDFContent(doc, paymentData);
  doc.save(`PaymentReceipt_${paymentData.payment_details_id}.pdf`);
};