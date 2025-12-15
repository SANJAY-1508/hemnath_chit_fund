import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the plugin

/**
 * Generates and displays a PDF receipt in a new window for an approved payment transaction.
 * * @param {object} paymentData - Data containing all details for the receipt.
 */
export const exportPaymentToPDF = (paymentData) => {
  const {
    customerInfo,
    dueInfo,
    payment_amount,
    payment_details_id,
    companyName = "SUNWORD BRAND",
  } = paymentData;

  console.log("Payment Data:", paymentData);
  const doc = new jsPDF();
  let y = 15; // Starting Y position // --- 1. Company Header ---

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
  console.log("Customer Info:", customerInfo);


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
  console.log("Payment Amount:", payment_amount);
  console.log("Due Amount:", dueInfo.due_amount);

  const tableBody = [
    [
      "1",
      `Payment for Due #${dueInfo.due_number || "N/A"}`,
      formattedDueAmount, // Use the pre-formatted string
      formattedPaidAmount, // Use the pre-formatted string
    ],
  ];

  doc.autoTable({
    startY: y,
    head: tableHeaders,
    body: tableBody,
    theme: "striped",
    styles: { cellPadding: 2, fontSize: 10, valign: "middle", halign: "left" },
    headStyles: { fillColor: [95, 10, 7], textColor: 255, fontStyle: "bold" },
    margin: { left: 20, right: 20 },
  }); // Update y to be below the main table for the total amount

  y = doc.lastAutoTable.finalY; // --- Footer Message ---

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
  doc.output("dataurlnewwindow");
};
