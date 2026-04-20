"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { OrderSearchTable } from "../../components";

export default function OrdersPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Order Lookup
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search and track customer orders by date and company name.
        </Typography>
      </Box>

      <OrderSearchTable />
    </Box>
  );
}
