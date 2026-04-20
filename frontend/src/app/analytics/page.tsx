"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { RevenueLineChart, RevenuePivotTable, TopCustomersBarChart } from "../../components";

export default function AnalyticsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Revenue Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track sales performance, top revenue contributors, and detailed product analysis.
        </Typography>
      </Box>

      <RevenueLineChart />

      <Box sx={{ mb: 4, mt: 4 }}>
        <TopCustomersBarChart />
      </Box>

      <RevenuePivotTable />
    </Box>
  );
}
