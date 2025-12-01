import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Container,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import EmailIcon from "@mui/icons-material/Email";
import InfoIcon from "@mui/icons-material/Info";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import API_DOMAIN from "../config/config";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";
import { margin } from "@mui/system";

const dashboardCountData = [
  {
    title: "CUSTOMERS",
    value: "0",
    icon: <PlaylistAddCheckIcon sx={{ fontSize: 50, opacity: 0.4 }} />,
    color: "#E91E63",
    key: "customer_count",
  },
  {
    title: "OVER DUE AMOUNT",
    value: "0",
    icon: <InfoIcon sx={{ fontSize: 50, opacity: 0.4 }} />,
    color: "#00BCD4",
    key: "overdue_count",
  },
  {
    title: "CURRENT DUE AMOUNTS",
    value: "0",
    icon: <EmailIcon sx={{ fontSize: 50, opacity: 0.4 }} />,
    color: "#8BC34A",
    key: "current_due_count",
  },
  {
    title: "PAID COUNT",
    value: "0",
    icon: <PersonAddIcon sx={{ fontSize: 50, opacity: 0.4 }} />,
    color: "#FF9800",
    key: "paid_count",
  },
];

const PIE_CHART_COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#AF19FF", // Purple
  "#FF0054", // Red
];

const PROGRESS_COLORS = ["#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#00BCD4"];

// --- 3. COMPONENTS ---
const StatWidget = ({ item }) => (
  <Card
    sx={{
      height: "100%",
      bgcolor: item.color,
      color: "#fff",
      borderRadius: 1,
      boxShadow: 3,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <CardContent
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 3,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          transform: "rotate(15deg)",
        }}
      >
        {item.icon}
      </Box>
      <Box sx={{ zIndex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", opacity: 0.9 }}
        >
          {item.title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
          {item.value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// --- 4. MAIN DASHBOARD ---
const DashBoard = () => {
  const currentFullYear = new Date().getFullYear().toString();
  const [dynamicCountData, setDynamicCountData] = useState(dashboardCountData);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("monthly");
  const [chartData, setChartData] = useState([]);
  const [barGraphLoading, setBarGraphLoading] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentFullYear);
  const [chartTitle, setChartTitle] = useState("Monthly Payment Summary");
  const [pieChartData, setPieChartData] = useState([]);
  const [pieChartLoading, setPieChartLoading] = useState(false);
  const coloredPieChartData = pieChartData.map((dataItem, index) => ({
    ...dataItem,
    color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
  }));
  const [transactionData, setTransactionData] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [targetData, setTargetData] = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  //Dashboard count
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/Dashboard.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action:"dashboard"}),
      });
      const responseData = await response.json();

      if (responseData.head.code === 200 && responseData.body) {
        const apiData = responseData.body;
        const updatedWidgets = dashboardCountData.map((item) => ({
          ...item,
          value:
            apiData[item.key] !== undefined
              ? String(apiData[item.key])
              : item.value,
        }));

        setDynamicCountData(updatedWidgets);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  ///Monthly bar graph
  const fetchBarGraphData = async (year) => {
    setBarGraphLoading(true);

    try {
      const response = await fetch(`${API_DOMAIN}/Dashboard.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          get_monthly_data: true,
          year: year,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bar graph data");
      }

      const result = await response.json();

      if (result.head.code === 200) {
        setChartData(result.data);
      } else {
        console.error("API Error:", result.head.msg);
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching bar graph data:", error);
      setChartData([]);
    } finally {
      setBarGraphLoading(false);
    }
  };

  //Daily bar graph
  const fetchDailyData = async (monthKey, monthName) => {
    setBarGraphLoading(true);
    setChartTitle(`Daily Paid/UnPaid for ${monthName} ${selectedYear}`);
    setView("daily");

    try {
      const response = await fetch(`${API_DOMAIN}/Dashboard.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          get_daily_data: true,
          month: monthKey,
        }),
      });
      const result = await response.json();

      if (result.head.code === 200) {
        setChartData(result.data || []);
      } else {
        console.error("Daily API Error:", result.head.msg);
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching daily data:", error);
      setChartData([]);
    } finally {
      setBarGraphLoading(false);
    }
  };

  //Pie chart for chit type distribution
  const fetchPieChartData = async () => {
    setPieChartLoading(true);
    try {
      const response = await fetch(`${API_DOMAIN}/Dashboard.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ⭐ The required payload
        body: JSON.stringify({
          get_chit_distribution: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chit distribution data");
      }

      const result = await response.json();

      if (result.head.code === 200) {
        const filteredData = result.data.filter((item) => item.count > 0);
        setPieChartData(filteredData);
      } else {
        console.error("API Error (Chit Distribution):", result.head.msg);
        setPieChartData([]);
      }
    } catch (error) {
      console.error("Error fetching chit distribution data:", error);
      setPieChartData([]);
    } finally {
      setPieChartLoading(false);
    }
  };

  //Recent transactions
  const fetchRecentTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await fetch(`${API_DOMAIN}/Dashboard.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          get_recent_paid: "",
        }),
      });
      const result = await response.json();

      if (result.head.code === 200 && result.data) {
        const mappedData = result.data.map((item, index) => {
          const datePart = item.paid_at ? item.paid_at.split(" ")[0] : "N/A";

          return {
            id: item.chit_service_id,
            row_no: index + 1, // Use index + 1 for the '#' column
            customer: item.name,
            plan: item.chit_type,
            date: datePart,
            amount: `₹${item.paid_amt.toLocaleString("en-IN")}`,
            status: item.payment_status.toUpperCase(), // Display status in CAPS
            color: item.payment_status === "paid" ? "success" : "default",
          };
        });
        setTransactionData(mappedData);
      } else {
        console.error("Failed to fetch recent transactions:", result.head.msg);
      }
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  //Monthly targets
  const fetchMonthlyTargets = async () => {
    setLoadingTargets(true);
    try {
      const response = await fetch(`${API_DOMAIN}/Dashboard.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          get_chit_payment_report: "",
        }),
      });
      const result = await response.json();

      if (result.head.code === 200 && result.data) {
        const mappedData = result.data.map((item, index) => {
          const percentageValue = parseFloat(item.percentage_paid || 0);

          return {
            label: item.scheme_name.toUpperCase(),
            value: Math.min(100, Math.max(0, percentageValue)),
            color: PROGRESS_COLORS[index % PROGRESS_COLORS.length],
          };
        });
        setTargetData(mappedData);
      } else {
        console.error("Failed to fetch monthly targets:", result.head.msg);
        setTargetData([]);
      }
    } catch (error) {
      console.error("Error fetching monthly targets:", error);
      setTargetData([]);
    } finally {
      setLoadingTargets(false);
    }
  };

  useEffect(() => {
    fetchBarGraphData(selectedYear);
  }, [selectedYear]); //

  useEffect(() => {
    fetchDashboardData();
    fetchPieChartData();
    fetchRecentTransactions();
    fetchMonthlyTargets();
  }, []);

  // Handle click on Bar
  const handleBarClick = (data, index) => {
    const monthKey = data.month_key;
    const monthName = data.name;
    setSelectedMonthKey(monthKey);
    fetchDailyData(monthKey, monthName);
  };

  const handleBackClick = async () => {
    setView("monthly");
    setChartTitle("Monthly Payment Summary");
    await fetchBarGraphData(selectedYear);
  };

  // ⭐ CUSTOM TOOLTIP RENDER FUNCTION
  const renderPieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const sliceColor = payload[0].color;
      const data = payload[0].payload;
      return (
        <Box className="pie-tooltip-container">
          <Typography variant="body2" className="pie-tooltip-title">
            {data.chit_type}
          </Typography>
           <Typography variant="body2" sx={{ color: sliceColor }}>
            Scheme:{" "}
            <Box component="span" className="pie-tooltip-value">
              {data.scheme_name}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: sliceColor }}>
            Count:{" "}
            <Box component="span" className="pie-tooltip-value">
              {data.count}
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ color: sliceColor }}>
            Percentage:{" "}
            <Box component="span" className="pie-tooltip-value">
              {data.percentage}%
            </Box>
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box className="dashboard-page-container">
      <Container maxWidth="xl">
        <Typography
          variant="h5"
          className="dashboard-page-title"
          sx={{ mb: 3, color: "#312929ff", textTransform: "uppercase" }}
        >
          Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dynamicCountData.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatWidget item={item} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card className="chart-card">
              <Box className="card-header-flex">
                {/* --- HEADER BLOCK --- */}
                <Box>
                  <Typography variant="h6">{chartTitle}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {view === "monthly"
                      ? "Click a bar to view daily graph"
                      : "Visualizing daily fluctuations"}
                  </Typography>
                </Box>
                {/* --- ACTION BUTTON/SELECTOR --- */}
                {view === "daily" ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackClick}
                    sx={{ textTransform: "none" }}
                  >
                    Back to Months
                  </Button>
                ) : // The year selector has been commented out as requested.
                // <select
                //   value={selectedYear}
                //   onChange={(e) => setSelectedYear(e.target.value)}
                //   style={{
                //     padding: "5px 10px",
                //     borderRadius: "4px",
                //     border: "1px solid #ccc",
                //   }}
                // >
                //   {/* Generates current year and previous 4 years */}
                //   {[...Array(5).keys()].map((i) => {
                //     const year = (new Date().getFullYear() - i).toString();
                //     return (
                //       <option key={year} value={year}>
                //         {year}
                //       </option>
                //     );
                //   })}
                // </select>
                null}
              </Box>
              {barGraphLoading ? (
                <Box className="flex-center-80-height">
                  <Typography variant="h6">
                    {view === "monthly"
                      ? "Loading Monthly Data..."
                      : "Loading Daily Data..."}
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  {view === "monthly" ? (
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Legend />
                      <Bar
                        dataKey="Paid"
                        fill="#4CAF50"
                        name="Paid Amount"
                        barSize={30}
                        onClick={handleBarClick}
                        style={{ cursor: "pointer" }}
                      />
                      <Bar
                        dataKey="UnPaid"
                        fill="#F44336"
                        name="UnPaid Amount"
                        barSize={30}
                        onClick={handleBarClick}
                        style={{ cursor: "pointer" }}
                      />
                    </BarChart>
                  ) : (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorPaid"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4CAF50"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4CAF50"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorUnPaid"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F44336"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F44336"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="day"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        interval={6}
                      />

                      <YAxis />
                      <Tooltip />

                      <Area
                        type="monotone"
                        dataKey="Paid"
                        stroke="#4CAF50"
                        fillOpacity={1}
                        fill="url(#colorPaid)"
                        strokeWidth={2}
                        name="Paid Amount" // Name for the tooltip and legend
                      />

                      {/* ⭐ ADDED: UnPaid Area Series */}
                      <Area
                        type="monotone"
                        dataKey="UnPaid"
                        stroke="#F44336"
                        fillOpacity={1}
                        fill="url(#colorUnPaid)"
                        strokeWidth={2}
                        name="UnPaid Amount" // Name for the tooltip and legend
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: 400, boxShadow: 3, borderRadius: 1, p: 2 }}>
              <CardHeader
                title="Chit Type Distribution"
                subheader="Total chits by type"
                sx={{ borderBottom: "1px solid #eee" }}
              />
              <CardContent className="card-content-center-300">
                {pieChartLoading ? (
                  <Box
                    className="flex-column-center-full-height"
                  >
                    <CircularProgress />
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Loading Distribution...
                    </Typography>
                  </Box>
                ) : pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coloredPieChartData}
                        dataKey="count"
                        nameKey="scheme_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                      >
                        {coloredPieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={renderPieCustomTooltip} />
                      {/* <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: "10px" }}
                      /> */}
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  // ⭐ SHOW EMPTY STATE
                  <Typography variant="body1" color="text.secondary">
                    No chit distribution data available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: "100%", boxShadow: 3, borderRadius: 1 }}>
              <CardHeader
                title="Recent Transactions"
                subheader="Latest payments received"
                sx={{ borderBottom: "1px solid #eee" }}
              />
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            Loading transactions...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : transactionData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            No recent transactions found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      // ⭐ Map the dynamic transactionData
                      transactionData.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.row_no}</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {row.customer}
                          </TableCell>
                          <TableCell>{row.plan}</TableCell>
                          <TableCell>
                            {new Date(row.date).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell
                            sx={{ color: "green", fontWeight: "bold" }}
                          >
                            {row.amount}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              // ⭐ The color is now dynamic based on 'payment_status'
                              color={row.color}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", boxShadow: 3, borderRadius: 1 }}>
              <CardHeader
                title="Monthly Collection"
                subheader="Collection progress"
                sx={{ borderBottom: "1px solid #eee" }}
              />
              <CardContent>
                {loadingTargets ? (
                  // ⭐ Loading State
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 200,
                    }}
                  >
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading targets...
                    </Typography>
                  </Box>
                ) : targetData.length === 0 ? (
                  // ⭐ Empty State
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 200,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      No targets data available for the month.
                    </Typography>
                  </Box>
                ) : (
                  // ⭐ Dynamic Content Mapping
                  targetData.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: item.color, fontWeight: "bold" }}
                        >
                          {item.value}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        // ⭐ Use the dynamic value
                        value={item.value}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: "#f0f0f0",
                          "& .MuiLinearProgress-bar": {
                            // ⭐ Use the dynamic color
                            backgroundColor: item.color,
                          },
                        }}
                      />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashBoard;
