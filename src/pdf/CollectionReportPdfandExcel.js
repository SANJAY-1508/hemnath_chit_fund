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

// Register Tamil fonts globally (do this once, but since it's a module, it will be fine)
Font.register({
  family: "NotoSansTamil",
  src: fontRegular,
});

Font.register({
  family: "NotoSansTamil-Bold",
  src: fontBold,
  fontWeight: "bold",
});

const ReportDocument = ({ data, filters }) => {
  const tableHeaders = [
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
  ];

  const tableRows = data.map((item, index) => [
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

  const ROWS_PER_PAGE = 13;
  const pages = [];
  for (let i = 0; i < tableRows.length; i += ROWS_PER_PAGE) {
    pages.push(tableRows.slice(i, i + ROWS_PER_PAGE));
  }

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: "NotoSansTamil",
    },
    title: {
      fontSize: 18,
      fontFamily: "NotoSansTamil-Bold",
      textAlign: "center",
      marginBottom: 20,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "NotoSansTamil-Bold",
      marginBottom: 5,
    },
    filterText: {
      fontSize: 10,
      marginBottom: 3,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableColHeader: {
      flex: 1,
      borderStyle: "solid",
      borderWidth: 0.5,
      borderColor: "#000",
      backgroundColor: "#1e1e1e",
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
    },
    tableCol: {
      flex: 1,
      borderStyle: "solid",
      borderWidth: 0.5,
      borderColor: "#000",
      justifyContent: "center",
      alignItems: "center",
      padding: 3,
    },
    tableCell: {
      fontSize: 8,
      textAlign: "center",
    },
    headerCell: {
      fontSize: 9,
      textAlign: "center",
      color: "#fff",
    },
  });

  // Build filter lines
  const filterLines = [];
  if (filters.fromDate) filterLines.push(`From Date: ${filters.fromDate}`);
  if (filters.toDate) filterLines.push(`To Date: ${filters.toDate}`);
  if (filters.customerCode)
    filterLines.push(`Customer No: ${filters.customerCode}`);
  if (filters.chitTypeFilter)
    filterLines.push(`Chit Type: ${filters.chitTypeFilter}`);
  if (filters.paymentStatusFilter)
    filterLines.push(`Payment Status: ${filters.paymentStatusFilter}`);

  const renderPage = (pageRows, pageIndex) => (
    <Page size="A4" orientation="landscape" style={styles.page} key={pageIndex}>
      <Text style={styles.title}>Collection Report</Text>

      {pageIndex === 0 && filterLines.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Filters Applied:</Text>
          {filterLines.map((line, idx) => (
            <Text key={idx} style={styles.filterText}>
              {line}
            </Text>
          ))}
        </View>
      )}

      {/* Table Header */}
      <View style={styles.tableRow}>
        {tableHeaders.map((header, idx) => (
          <View key={idx} style={styles.tableColHeader}>
            <Text style={styles.headerCell}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Table Rows for this page */}
      {pageRows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={styles.tableCol}>
              <Text style={styles.tableCell}>{cell}</Text>
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

export const exportToPDF = async (data, filters) => {
  try {
    const blob = await pdf(
      <ReportDocument data={data} filters={filters} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "collection-report.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
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
