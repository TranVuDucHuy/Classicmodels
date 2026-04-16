"use client";
import React, { useState } from "react";
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography, Paper, TextField, Autocomplete, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
  ToggleButtonGroup, ToggleButton, Skeleton, CircularProgress
} from "@mui/material";
import { 
  BarChart as BarChartIcon, 
  Search as SearchIcon, 
  Business as BusinessIcon,
  Timeline as TimelineIcon
} from "@mui/icons-material";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
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
    { text: "Phân tích Doanh thu", icon: <TimelineIcon />, path: "/analytics" },
    { text: "Tra cứu Khách hàng", icon: <SearchIcon />, path: "/customers" },
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
          backgroundColor: "#1a1d27",
          borderRight: "1px solid #30364d",
        },
      }}
    >
      <Box sx={{ p: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          CLASSIC MODELS
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
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                  "& .MuiListItemIcon-root": { color: "#6366f1" },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    <Paper sx={{ p: 3, mb: 4, borderRadius: 4, height: 450, position: "relative" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Xu hướng Doanh thu</Typography>
          <Typography variant="body2" color="text.secondary">Biến động doanh thu theo thời gian</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Năm</InputLabel>
          <Select
            value={selectedYear}
            label="Năm"
            onChange={(e) => dispatch(setYear(e.target.value))}
          >
            <MenuItem value="all">Tất cả năm</MenuItem>
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
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30364d" />
            <XAxis 
              dataKey="label" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${val/1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1a1d27", border: "1px solid #30364d", borderRadius: 8 }}
              formatter={(val: number) => [formatCurrency(val), "Doanh thu"]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
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
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Phân tích Chi tiết</Typography>
          <Typography variant="body2" color="text.secondary">So sánh doanh thu giữa các nhóm sản phẩm</Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          value={detailLevel}
          exclusive
          onChange={(_, val) => val && dispatch(setDetailLevel(val))}
        >
          <ToggleButton value="productLine">Dòng sản phẩm</ToggleButton>
          <ToggleButton value="productName">Sản phẩm</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#1a1d27", fontWeight: 700 }}>{detailLevel === "productLine" ? "Dòng sản phẩm" : "Sên sản phẩm"}</TableCell>
              {years.map((y: number) => (
                <TableCell key={y} align="right" sx={{ backgroundColor: "#1a1d27", fontWeight: 700 }}>{y}</TableCell>
              ))}
              <TableCell align="right" sx={{ backgroundColor: "#1a1d27", fontWeight: 700, color: "primary.main" }}>Tổng cộng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={years.length + 2}><Skeleton /></TableCell></TableRow>
              ))
            ) : (
              rows.map((row) => (
                <TableRow key={row.name} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" } }}>
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
    { field: "customerNumber", headerName: "Mã KH", width: 90 },
    { field: "customerName", headerName: "Tên công ty", flex: 1 },
    { field: "contactName", headerName: "Người liên hệ", width: 180 },
    { field: "phone", headerName: "Số điện thoại", width: 150 },
    { field: "country", headerName: "Quốc gia", width: 130 },
    { 
      field: "creditLimit", 
      headerName: "Hạn mức tín dụng", 
      width: 150, 
      align: "right",
      valueFormatter: (params) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value)
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, display: "flex", gap: 2, alignItems: "flex-end" }}>
        <TextField
          label="Tên khách hàng"
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
          renderInput={(params) => <TextField {...params} label="Quốc gia" />}
        />
        <Button 
          variant="contained" 
          startIcon={<SearchIcon />} 
          onClick={handleSearch}
          disabled={isLoading || isFetching}
          sx={{ height: 40, px: 4 }}
        >
          Tìm
        </Button>
      </Paper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 4, overflow: 'hidden' }}>
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
              backgroundColor: "#1a1d27",
              color: "#94a3b8",
              fontWeight: 700,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #30364d",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(255,255,255,0.02)",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #30364d",
            }
          }}
        />
      </Paper>
    </Box>
  );
};
