"use client";
import React, { useState } from "react";
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography, Paper, TextField, Autocomplete, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
  ToggleButtonGroup, ToggleButton, Skeleton, CircularProgress,
  Fab, InputBase, IconButton, Divider
} from "@mui/material";
import { 
  BarChart as BarChartIcon, 
  Search as SearchIcon, 
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  ShoppingCart as OrderIcon,
  Assessment as AnalyticsIcon,
  SmartToy as BotIcon,
  Send as SendIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setYear, setDetailLevel, setSearchKeyword, setSearchCountry, classicModelsApi } from "./store";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DRAWER_WIDTH = 280;

// --- Sidebar Component ---
export const Sidebar = () => {
  const pathname = usePathname();
  const menuItems = [
    { text: "Revenue Analytics", icon: <TimelineIcon />, path: "/analytics" },
    { text: "Management Analysis", icon: <AnalyticsIcon />, path: "/management" },
    { text: "Order Lookup", icon: <OrderIcon />, path: "/orders" },
    { text: "Customer Lookup", icon: <SearchIcon />, path: "/customers" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
        },
      }}
    >
      <Box sx={{ p: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          CLASSIC MODEL
        </Typography>
      </Box>
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  backgroundColor: "rgba(2, 132, 199, 0.08)",
                  color: "#0284c7",
                  "& .MuiListItemIcon-root": { color: "#0284c7" },
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

// --- Revenue Line Chart ---
export const RevenueLineChart = () => {
  const dispatch = useDispatch();
  const selectedYear = useSelector((state: RootState) => state.filters.selectedYear);
  const { data: years = [] } = classicModelsApi.useGetRevenueYearsQuery();
  const { data: chartData, isLoading } = classicModelsApi.useGetChartDataQuery({ year: selectedYear.toString() });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2, height: 450, position: "relative" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Revenue Trends</Typography>
          <Typography variant="body2" color="text.secondary">Revenue fluctuations over time</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => dispatch(setYear(e.target.value))}
          >
            <MenuItem value="all">All Years</MenuItem>
            {years.map(y => <MenuItem key={y} value={y.toString()}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData?.data || []}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="label" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${val/1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 4 }}
              formatter={(val: number) => [formatCurrency(val), "Revenue"]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0284c7" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRev)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

// --- Revenue Pivot Table ---
export const RevenuePivotTable = () => {
  const dispatch = useDispatch();
  const detailLevel = useSelector((state: RootState) => state.filters.detailLevel);
  const { data: pivotResponse, isLoading } = classicModelsApi.useGetPivotDataQuery({ detail: detailLevel });

  const years = pivotResponse?.years || [];
  const entries = pivotResponse?.data || [];

  // Transform long format to wide format
  const rowsMap: Record<string, any> = {};
  entries.forEach((item: any) => {
    if (!rowsMap[item.name]) {
      rowsMap[item.name] = { name: item.name, total: 0 };
      years.forEach((y: number) => { rowsMap[item.name][y] = 0; });
    }
    rowsMap[item.name][item.year] = item.revenue;
    rowsMap[item.name].total += item.revenue;
  });

  const rows = Object.values(rowsMap).sort((a, b) => b.total - a.total);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Detailed Analysis</Typography>
          <Typography variant="body2" color="text.secondary">Compare revenue between product groups</Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          value={detailLevel}
          exclusive
          onChange={(_, val) => val && dispatch(setDetailLevel(val))}
        >
          <ToggleButton value="productLine">Product Line</ToggleButton>
          <ToggleButton value="productName">Product</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f5f9", fontWeight: 700 }}>{detailLevel === "productLine" ? "Product Line" : "Product Name"}</TableCell>
              {years.map((y: number) => (
                <TableCell key={y} align="right" sx={{ backgroundColor: "#f1f5f9", fontWeight: 700 }}>{y}</TableCell>
              ))}
              <TableCell align="right" sx={{ backgroundColor: "#f1f5f9", fontWeight: 700, color: "primary.main" }}>Grand Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={years.length + 2}><Skeleton /></TableCell></TableRow>
              ))
            ) : (
              rows.map((row) => (
                <TableRow key={row.name} sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  {years.map((y: number) => (
                    <TableCell key={y} align="right">{formatCurrency(row[y])}</TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>{formatCurrency(row.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// --- Customer Search Table ---
export const CustomerSearchTable = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  
  const { data: countries = [] } = classicModelsApi.useGetCountriesQuery();
  const { data: searchResult, isLoading, isFetching } = classicModelsApi.useSearchCustomersQuery({ 
    keyword: filters.searchKeyword, 
    country: filters.searchCountry 
  });

  const handleSearch = () => {
    dispatch(setSearchKeyword(keyword));
    dispatch(setSearchCountry(country || ""));
  };

  const columns: GridColDef[] = [
    { field: "customerNumber", headerName: "ID", width: 90 },
    { field: "customerName", headerName: "Company Name", flex: 1 },
    { field: "contactName", headerName: "Contact Person", width: 180 },
    { field: "phone", headerName: "Phone Number", width: 150 },
    { field: "country", headerName: "Country", width: 130 },
    { 
      field: "creditLimit", 
      headerName: "Credit Limit", 
      width: 150, 
      align: "right",
      valueFormatter: (params) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value)
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, display: "flex", gap: 2, alignItems: "flex-end" }}>
        <TextField
          label="Customer Name"
          variant="outlined"
          size="small"
          fullWidth
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Autocomplete
          options={countries}
          size="small"
          sx={{ width: 300 }}
          value={country}
          onChange={(_, val) => setCountry(val)}
          renderInput={(params) => <TextField {...params} label="Country" />}
        />
        <Button 
          variant="contained" 
          startIcon={<SearchIcon />} 
          onClick={handleSearch}
          disabled={isLoading || isFetching}
          sx={{ height: 40, px: 4 }}
        >
          Search
        </Button>
      </Paper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={searchResult?.items || []}
          columns={columns}
          getRowId={(row) => row.customerNumber}
          loading={isLoading || isFetching}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              fontWeight: 700,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e2e8f0",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0,0,0,0.02)",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #e2e8f0",
            }
          }}
        />
      </Paper>
    </Box>
  );
};

// --- Top Customers Bar Chart ---
export const TopCustomersBarChart = () => {
    const { data: customers = [], isLoading } = classicModelsApi.useGetTopCustomersQuery();
  
    const formatCurrency = (val: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
    return (
      <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>Top 10 Customers</Typography>
          <Typography variant="body2" color="text.secondary">By total revenue contribution</Typography>
        </Box>
  
        {isLoading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={customers} layout="vertical" margin={{ left: 40, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150} 
                fontSize={11} 
                tick={{ fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 4 }}
                formatter={(val: number) => [formatCurrency(val), "Revenue"]}
              />
              <Bar 
                dataKey="revenue" 
                fill="#0284c7" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    );
  };
  
  // --- Order Status Pie Chart ---
  export const OrderStatusPieChart = () => {
    const { data: statusData = [], isLoading } = classicModelsApi.useGetOrderStatusQuery();
    
    // Professional color palette for statuses
    const COLORS = ["#0284c7", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#94a3b8"];
  
    return (
      <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>Order Status</Typography>
          <Typography variant="body2" color="text.secondary">Order distribution by status</Typography>
        </Box>
  
        {isLoading ? (
          <Skeleton variant="circular" width={250} height={250} sx={{ mx: "auto" }} />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="status"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Paper>
    );
  };

// --- Shipping Latency Chart ---
export const ShippingLatencyChart = () => {
  const { data: latencyData = [], isLoading } = classicModelsApi.useGetShippingLatencyQuery();

  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Shipping Latency</Typography>
        <Typography variant="body2" color="text.secondary">Avg days from order to shipment</Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={latencyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="label" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              unit=" days"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgDays" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

// --- Customer Retention Chart ---
export const CustomerRetentionChart = () => {
  const { data: retentionData = [], isLoading } = classicModelsApi.useGetCustomerRetentionQuery();
  const COLORS = ["#94a3b8", "#6366f1", "#0284c7"];

  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Customer Retention</Typography>
        <Typography variant="body2" color="text.secondary">Distribution of orders per customer</Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="circular" width={250} height={250} sx={{ mx: "auto" }} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={retentionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              nameKey="bucket"
              label={({ bucket, percent }) => `${bucket} ${(percent * 100).toFixed(0)}%`}
            >
              {retentionData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 4 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
  };

// --- Order Search Table ---
export const OrderSearchTable = () => {
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [searchParams, setSearchParams] = useState({ customerName: "", startDate: "", endDate: "" });

  const { data: searchResult, isLoading, isFetching } = classicModelsApi.useSearchOrdersQuery(searchParams);

  const handleSearch = () => {
    setSearchParams({ customerName, startDate, endDate });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const columns: GridColDef[] = [
    { field: "orderNumber", headerName: "Order #", width: 100 },
    { field: "orderDate", headerName: "Order Date", width: 120 },
    { field: "customerName", headerName: "Customer Name", flex: 1 },
    { 
      field: "totalAmount", 
      headerName: "Total Amount", 
      width: 130, 
      align: "right",
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { field: "status", headerName: "Status", width: 120 },
    { field: "shippedDate", headerName: "Shipped Date", width: 120 },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, display: "flex", gap: 2, alignItems: "flex-end", flexWrap: "wrap" }}>
        <TextField
          label="Customer Name"
          variant="outlined"
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <TextField
          label="Start Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ width: 180 }}
        />
        <TextField
          label="End Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ width: 180 }}
        />
        <Button 
          variant="contained" 
          startIcon={<SearchIcon />} 
          onClick={handleSearch}
          disabled={isLoading || isFetching}
          sx={{ height: 40, px: 4 }}
        >
          Search
        </Button>
      </Paper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={searchResult?.items || []}
          columns={columns}
          getRowId={(row) => row.orderNumber}
          loading={isLoading || isFetching}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              fontWeight: 700,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e2e8f0",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0,0,0,0.02)",
            }
          }}
        />
      </Paper>
    </Box>
  );
};

// --- AI Chat Widget ---
export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string, sql?: string }[]>([
    { role: 'bot', content: 'Xin chào! Tôi là trợ lý ảo ClassicModels. Tôi có thể giúp gì cho bạn về dữ liệu doanh nghiệp không?' }
  ]);

  const [askChatbot, { isLoading }] = classicModelsApi.useAskChatbotMutation();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const result = await askChatbot({ message: userMsg }).unwrap();
      setMessages(prev => [...prev, { role: 'bot', content: result.response, sql: result.sql }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Xin lỗi, tôi gặp chút trục trặc khi xử lý dữ liệu.' }]);
    }
  };

  return (
    <>
      <Fab 
        color="primary" 
        onClick={() => setIsOpen(!isOpen)}
        sx={{ position: 'fixed', bottom: 32, right: 32, boxShadow: 6, zIndex: 2000 }}
      >
        {isOpen ? <CloseIcon /> : <BotIcon />}
      </Fab>

      {isOpen && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 100, 
            right: 32, 
            width: 500, 
            height: 600, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: 24,
            overflow: 'hidden',
            zIndex: 2000
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BotIcon />
            <Typography variant="h6" fontSize={16} fontWeight={700}>Trợ lý ClassicModels AI</Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <Box 
                key={i} 
                sx={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  boxShadow: 1,
                  fontSize: 14,
                  lineHeight: 1.5
                }}
              >
                {msg.content}
                {msg.sql && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#1e293b', color: '#94a3b8', borderRadius: 1, fontSize: 11, fontFamily: 'monospace', overflowX: 'auto' }}>
                    <code>{msg.sql}</code>
                  </Box>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ alignSelf: 'flex-start', p: 1.5, borderRadius: 2, bgcolor: 'white', boxShadow: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          <Divider />

          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
              placeholder="Hỏi tôi về doanh số, khách hàng..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              multiline
              maxRows={4}
            />
            <IconButton color="primary" onClick={handleSend} disabled={isLoading}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};
