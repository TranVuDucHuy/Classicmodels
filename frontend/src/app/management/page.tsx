"use client";
import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { OrderStatusPieChart, ShippingLatencyChart, CustomerRetentionChart } from "../../components";

export default function ManagementPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Management Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor logistics performance, order distribution, and customer retention.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <ShippingLatencyChart />
        </Grid>
        <Grid item xs={12} lg={6}>
          <OrderStatusPieChart />
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: 600 }}>
        <CustomerRetentionChart />
      </Box>
    </Box>
  );
}
