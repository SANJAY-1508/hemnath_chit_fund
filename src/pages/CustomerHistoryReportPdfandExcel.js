import * as XLSX from "xlsx";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import fontRegular from "./fonts/NotoSansTamil-Regular.ttf";
import fontBold from "./fonts/NotoSansTamil-Bold.ttf";

// --- Font Registration (Keep as is) ---
Font.register({
  family: "NotoSansTamil",
  src: fontRegular,
});

Font.register({
  family: "NotoSansTamil-Bold",
  src: fontBold,
  fontWeight: "bold",
});

// Helper function to format the complex object history value for PDF/Excel
const formatHistoryObject = (value) => {
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).length === 0
  ) {
    return "-";
  }

  // Filter out the 'password' field
  const filteredEntries = Object.entries(value).filter(
    ([key]) => key !== "password"
  );

  return filteredEntries
    .map(([key, val]) => {
      const displayKey = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      let displayValue = val;
      if (key.includes("amount") || key.includes("due_id")) {
        displayValue = `₹${val}`;
      }

      return `${displayKey}: ${displayValue || "-"}`;
    })
    .join("\n"); // Use newline for separating key:value pairs in the PDF cell
};

// --- PDF Document Component for Customer History ---
const CustomerHistoryDocument = ({ historyData, customerCode }) => {
  const tableHeaders = [
    "S.No",
    "Date",
    "History Type",
    "Old Value",
    "New Value",
    "Remark",
  ];

  const tableRows = historyData.map((item, index) => [
    index + 1,
    item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-GB")
      : "-",
    item.action_type || "-",
    formatHistoryObject(item.old_value), // Use the helper function
    formatHistoryObject(item.new_value), // Use the helper function
    item.remarks || "-",
  ]);

  const ROWS_PER_PAGE = 15; // Adjusted for a simpler portrait layout
  const pages = [];
  for (let i = 0; i < tableRows.length; i += ROWS_PER_PAGE) {
    pages.push(tableRows.slice(i, i + ROWS_PER_PAGE));
  }

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: "NotoSansTamil",
      // Changed to 'portrait' since 6 columns fit better than 10
      orientation: "portrait", 
    },
    title: {
      fontSize: 18,
      fontFamily: "NotoSansTamil-Bold",
      textAlign: "center",
      marginBottom: 20,
    },
    filterText: {
      fontSize: 10,
      marginBottom: 10,
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
    },
    tableColHeader: {
      borderStyle: "solid",
      borderWidth: 0.5,
      borderColor: "#000",
      backgroundColor: "#1e1e1e",
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
    },
    tableCol: {
      borderStyle: "solid",
      borderWidth: 0.5,
      borderColor: "#000",
      padding: 3,
    },
    tableCell: {
      fontSize: 8,
      // 'left' alignment for the complex values
      textAlign: "left", 
    },
    headerCell: {
      fontSize: 9,
      textAlign: "center",
      fontFamily: "NotoSansTamil-Bold",
      color: "#fff",
    },
    // Define column widths for a 6-column table (must sum to 1.0 or use fixed widths)
    colWidths: {
      0: { width: "5%" }, // S.No
      1: { width: "10%" }, // Date
      2: { width: "15%" }, // History Type
      3: { width: "25%" }, // Old Value
      4: { width: "25%" }, // New Value
      5: { width: "20%" }, // Remark
    },
  });

  const getColStyle = (index, isHeader) => ({
    ...styles[isHeader ? "tableColHeader" : "tableCol"],
    ...styles.colWidths[index],
  });

  const renderPage = (pageRows, pageIndex) => (
    <Page size="A4" style={styles.page} key={pageIndex}>
      <Text style={styles.title}>Customer History Report</Text>

      {pageIndex === 0 && customerCode && (
        <Text style={styles.filterText}>
          Customer No: {customerCode}
        </Text>
      )}

      {/* Table Header */}
      <View style={styles.tableRow} fixed>
        {tableHeaders.map((header, idx) => (
          <View key={idx} style={getColStyle(idx, true)}>
            <Text style={styles.headerCell}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Table Rows for this page */}
      {pageRows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={getColStyle(cellIdx, false)}>
              <Text style={{
                ...styles.tableCell,
                // Center S.No and Date
                textAlign: (cellIdx === 0 || cellIdx === 1) ? 'center' : 'left',
              }}>
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </Page>
  );

  return (
    <Document>
      {pages.map((pageRows, pageIndex) => renderPage(pageRows, pageIndex))}
    </Document>
  );
};

// --- Export Functions ---

// Updated exportToPDF for Customer History
export const exportToPDF = async (historyData, customerCode) => {
  try {
    const blob = await pdf(
      <CustomerHistoryDocument historyData={historyData} customerCode={customerCode} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customer-history-${customerCode || "all"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

// Updated exportToExcel for Customer History
export const exportToExcel = (historyData, customerCode) => {
  const wsData = [];
  // ==== Center Title Row ====
  wsData.push(["Customer History Report"]);
  wsData.push([]); // Empty row
  // ==== Filter ====
  if (customerCode) wsData.push(["Customer No", customerCode]);
  wsData.push([]); // spacing row
  // ==== Headers ====
  const headers = [
    "S.No",
    "Date",
    "History Type",
    "Old Value",
    "New Value",
    "Remark",
  ];
  wsData.push(headers);
  // ==== Rows ====
  historyData.forEach((item, index) => {
    wsData.push([
      index + 1,
      item.created_at
        ? new Date(item.created_at).toLocaleDateString("en-GB")
        : "-",
      item.action_type || "-",
      formatHistoryObject(item.old_value), // Use the helper function
      formatHistoryObject(item.new_value), // Use the helper function
      item.remarks || "-",
    ]);
  });
  // ==== Create worksheet ====
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Merge title cells to center text
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
  // Auto column width (basic approximation)
  const columnWidths = [
      { wch: 5 }, // S.No
      { wch: 15 }, // Date
      { wch: 20 }, // History Type
      { wch: 30 }, // Old Value
      { wch: 30 }, // New Value
      { wch: 20 }, // Remark
  ];
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
  XLSX.utils.book_append_sheet(wb, ws, "Customer History");
  XLSX.writeFile(wb, `customer-history-${customerCode || "all"}.xlsx`);
};