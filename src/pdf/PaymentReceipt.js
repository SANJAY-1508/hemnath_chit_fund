import jsPDF from "jspdf";
import "jspdf-autotable"; 
const generatePDFContent = (doc, paymentData) => {
  const {
    customerInfo,
    dueInfo,
    payment_amount,
    payment_details_id,
   companyName,
  } = paymentData;

  let y = 15;
  const contentCenterX = 69; 

  doc.setFontSize(22);
  doc.setTextColor(95, 10, 7);
  doc.text(companyName, contentCenterX, y, null, null, "center"); 
  y += 8;

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("Payment Receipt", contentCenterX, y, null, null, "center");
  y += 4; 

  doc.setLineWidth(0.5);
  doc.setDrawColor(150, 150, 150);
  doc.line(10, y, 128, y); 
  y += 4; 

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);

  // --- 2. Customer and Transaction Details Table (Fixes Alignment) ---
  const customerContent = 
    `Customer No : ${customerInfo.customer_no || "N/A"}\n` +
    `Customer Name : ${customerInfo.name || "N/A"}\n` +
    `Mobile : ${customerInfo.mobile || "N/A"}`;

  const transactionContent = 
    `Transaction ID : ${payment_details_id}\n` +
    `Due Number : ${dueInfo.due_number || "N/A"}\n` +
    `Due Date : ${dueInfo.due_date || "N/A"}\n` +
    `Payment Date : ${new Date().toLocaleDateString("en-GB")}`;

  doc.autoTable({
    startY: y,
    theme: "plain",
    margin: { left: 10, right: 20 }, 
    columnStyles: {
      0: { cellWidth: 59, fontStyle: "normal" }, 
      1: { cellWidth: 59, fontStyle: "normal" }, 
    },
    styles: {
      fontSize: 9, 
      cellPadding: 1, 
      textColor: [40, 40, 40],
    },
    head: [
      [
        { content: "Customer Details", styles: { fontStyle: "bold", textColor: [95, 10, 7] } },
        { content: "Transaction Details", styles: { fontStyle: "bold", textColor: [95, 10, 7] } },
      ],
    ],
    body: [
      [
        customerContent,
        transactionContent,
      ],
    ],
  });

  y = doc.lastAutoTable.finalY + 5; // --- 3. Main Payment Table ---

  const tableHeaders = [["#", "Description", "Due Amount", "Paid Amount"]];

  // *** Re-adding the currency symbol (₹) for accuracy ***
  const formattedDueAmount = `${Number(dueInfo.due_amount || 0).toFixed(2)}`;
  const formattedPaidAmount = `${Number(payment_amount || 0).toFixed(2)}`;
  // ******************************************************

  const tableBody = [
    [
      "1",
      `Payment for Due #${dueInfo.due_number || "N/A"}`,
      formattedDueAmount,
      formattedPaidAmount,
    ],
  ]; 

  doc.autoTable({
    startY: y,
    head: tableHeaders,
    body: tableBody,
    theme: "striped",
    styles: { cellPadding: 2, fontSize: 10, valign: "middle", halign: "left" },
    headStyles: { fillColor: [95, 10, 7], textColor: 255, fontStyle: "bold" },
    margin: { left: 10, right: 20 }, 
    columnStyles: {
      // Adjust column widths for the new total width (118mm)
      0: { cellWidth: 14, halign: 'left' },
      1: { cellWidth: 50, halign: 'left' },
      2: { cellWidth: 30, halign: 'center' }, 
      3: { cellWidth: 30, halign: 'center' }, 
    }
  }); 

  y = doc.lastAutoTable.finalY; // --- 4. Total Amount Footer ---

 
};

// ----------------------------------------------------------------------
// EXPORTED FUNCTION 1: Used for Approval Screen (Opens in new tab)
// ----------------------------------------------------------------------
export const exportPaymentToPDF_View = (paymentData) => {
  const doc = new jsPDF({ format: [148, 148] });
  generatePDFContent(doc, paymentData);
  doc.output("dataurlnewwindow");
};

// ----------------------------------------------------------------------
// EXPORTED FUNCTION 2: Used for Table View (Downloads the file)
// ----------------------------------------------------------------------
export const exportPaymentToPDF_Download = (paymentData) => {
  const doc = new jsPDF({ format: [148, 148] });
  generatePDFContent(doc, paymentData);
  doc.save(`PaymentReceipt_${paymentData.payment_details_id}.pdf`);
};