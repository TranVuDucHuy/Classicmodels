"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { CustomerSearchTable } from "../../components";

export default function CustomersPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Tra cứu Khách hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm kiếm và xem thông tin chi tiết khách hàng trong hệ thống.
        </Typography>
      </Box>

      <CustomerSearchTable />
    </Box>
  );
}
