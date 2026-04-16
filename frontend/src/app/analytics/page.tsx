"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { RevenueLineChart, RevenuePivotTable } from "../../components";

export default function AnalyticsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Tổng quan Kinh doanh
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Phân tích doanh thu và xu hướng thị trường từ dữ liệu ClassicModels.
        </Typography>
      </Box>

      <RevenueLineChart />
      <RevenuePivotTable />
    </Box>
  );
}
