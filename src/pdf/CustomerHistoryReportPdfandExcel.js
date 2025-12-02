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

// --- Font Registration ---
Font.register({
  family: "NotoSansTamil",
  src: fontRegular,
});

Font.register({
  family: "NotoSansTamil-Bold",
  src: fontBold,
  fontWeight: "bold",
});

// Helper function
const formatHistoryObject = (value) => {
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
    return "-";
  }

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
    .join("\n");
};

// --- Customer History PDF ---
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
    formatHistoryObject(item.old_value),
    formatHistoryObject(item.new_value),
    item.remarks || "-",
  ]);

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
      borderWidth: 0.5,
      borderColor: "#000",
      backgroundColor: "#1e1e1e",
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
    },
    tableCol: {
      borderWidth: 0.5,
      borderColor: "#000",
      padding: 3,
    },
    tableCell: {
      fontSize: 8,
      textAlign: "left",
    },
    headerCell: {
      fontSize: 9,
      textAlign: "center",
      fontFamily: "NotoSansTamil-Bold",
      color: "#fff",
    },
    colWidths: {
      0: { width: "5%" },
      1: { width: "10%" },
      2: { width: "15%" },
      3: { width: "25%" },
      4: { width: "25%" },
      5: { width: "20%" },
    },
  });

  const getColStyle = (index, isHeader) => ({
    ...styles[isHeader ? "tableColHeader" : "tableCol"],
    ...styles.colWidths[index],
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Customer History Report</Text>

        {customerCode && (
          <Text style={styles.filterText}>
            Customer No: {customerCode}
          </Text>
        )}

        {/* Header (repeats on every page automatically) */}
        <View style={styles.tableRow} fixed>
          {tableHeaders.map((header, idx) => (
            <View key={idx} style={getColStyle(idx, true)}>
              <Text style={styles.headerCell}>{header}</Text>
            </View>
          ))}
        </View>

        {/* All rows - React PDF auto-paginates */}
        {tableRows.map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={styles.tableRow}
            wrap={false}
            minPresenceAhead={120}
          >
            {row.map((cell, cellIdx) => (
              <View key={cellIdx} style={getColStyle(cellIdx, false)}>
                <Text
                  style={{
                    ...styles.tableCell,
                    textAlign:
                      cellIdx === 0 || cellIdx === 1 ? "center" : "left",
                  }}
                >
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

// --- Export to PDF ---
export const exportToPDF = async (historyData, customerCode) => {
  try {
    const blob = await pdf(
      <CustomerHistoryDocument
        historyData={historyData}
        customerCode={customerCode}
      />
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
