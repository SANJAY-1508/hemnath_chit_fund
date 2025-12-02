import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (data, filters) => {
  const doc = new jsPDF("landscape");

  // === Title Background Box ===
  doc.setFillColor(40, 40, 40); // dark background
  doc.rect(0, 5, 300, 15, "F");

  // === Center Title ===
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Collection Report", doc.internal.pageSize.width / 2, 15, {
    align: "center",
  });

  // Reset Text Color
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  // === Conditional Filters ===
  const filterLines = [];

  if (filters.fromDate) filterLines.push(`From Date : ${filters.fromDate}`);
  if (filters.toDate) filterLines.push(`To Date : ${filters.toDate}`);
  if (filters.customerCode)
    filterLines.push(`Customer No : ${filters.customerCode}`);
  if (filters.chitTypeFilter)
    filterLines.push(`Chit Type : ${filters.chitTypeFilter}`);
  if (filters.paymentStatusFilter)
    filterLines.push(`Payment Status : ${filters.paymentStatusFilter}`);

  let yPos = 30;

  if (filterLines.length > 0) {
    doc.setFontSize(12);
    doc.text("Filters Applied:", 14, yPos);
    yPos += 7;

    doc.setFontSize(11);
    filterLines.forEach((line) => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });

    yPos += 4; // extra spacing before table
  }

  // === Table Headers ===
  const headers = [
    [
      "S.No",
      "Collection Date",
      "Customer No",
      "Customer Name",
      "Chit Type",
      "Due No",
      "Due Amount",
      "Paid Amount",
      "Balance Amount",
      "Status",
    ],
  ];

  // === Rows ===
  const rows = data.map((item, index) => [
    index + 1,
    item.collection_date
      ? new Date(item.collection_date).toLocaleDateString("en-GB")
      : "-",
    item.customer_no || "-",
    item.name || "-",
    item.chit_type || "-",
    item.due_no || "-",
    item.due_amt || "-",
    item.paid_amt || "-",
    item.balance_amt || "-",
    item.payment_status || "-",
  ]);

  // === Table Styling ===
  autoTable(doc, {
    startY: yPos,
    head: headers,
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: "#fff",
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 9,
      halign: "center",
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 20 },
  });

  doc.save("collection-report.pdf");
};

export const exportToExcel = (data, filters) => {
  const wsData = [];

  // ==== Center Title Row ====
  wsData.push(["Collection Report"]);
  wsData.push([]); // Empty row

  // ==== Conditional Filters ====
  if (filters.fromDate) wsData.push(["From Date", filters.fromDate]);
  if (filters.toDate) wsData.push(["To Date", filters.toDate]);
  if (filters.customerCode) wsData.push(["Customer No", filters.customerCode]);
  if (filters.chitTypeFilter)
    wsData.push(["Chit Type", filters.chitTypeFilter]);
  if (filters.paymentStatusFilter)
    wsData.push(["Payment Status", filters.paymentStatusFilter]);

  wsData.push([]); // spacing row

  // ==== Headers ====
  const headers = [
    "S.No",
    "Collection Date",
    "Customer No",
    "Customer Name",
    "Scheme Name",
    "Due No",
    "Due Amount",
    "Paid Amount",
    "Balance Amount",
    "Status",
  ];

  wsData.push(headers);

  // ==== Rows ====
  data.forEach((item, index) => {
    wsData.push([
      index + 1,
      item.collection_date
        ? new Date(item.collection_date).toLocaleDateString("en-GB")
        : "-",
      item.customer_no || "-",
      item.name || "-",
      item.chit_type || "-",
      item.due_no || "-",
      item.due_amt || "-",
      item.paid_amt || "-",
      item.balance_amt || "-",
      item.payment_status || "-",
    ]);
  });

  // ==== Create worksheet ====
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge title cells to center text
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  // Auto column width
  const columnWidths = headers.map((h) => ({ wch: h.length + 10 }));
  ws["!cols"] = columnWidths;

  // Style Header Row
  const headerRowIndex = wsData.findIndex((r) => r === headers);
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
    if (!ws[cellRef]) return;

    ws[cellRef].s = {
      fill: { fgColor: { rgb: "262626" } }, // dark bg
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center" },
    };
  });

  // ==== Workbook ====
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Collection Report");

  XLSX.writeFile(wb, "collection-report.xlsx");
};
