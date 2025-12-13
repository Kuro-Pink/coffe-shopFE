'use client';

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from '@mui/material';
import { TrendingUp, EmojiEvents } from '@mui/icons-material';

interface TopProductsTableProps {
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}`;
    }
  };

  return (
    <Card className="shadow-lg border-0 h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <EmojiEvents className="text-yellow-600" />
          <Typography variant="h6" className="font-bold">
            Top 5 món bán chạy
          </Typography>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="body2" className="text-gray-500">
              Chưa có dữ liệu
            </Typography>
          </div>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold">#</TableCell>
                  <TableCell className="font-bold">Món ăn</TableCell>
                  <TableCell align="right" className="font-bold">
                    SL
                  </TableCell>
                  <TableCell align="right" className="font-bold">
                    Doanh thu
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow
                    key={product.productId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                        {getMedalIcon(index)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-semibold">
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={product.quantity}
                        size="small"
                        className="bg-blue-50 text-blue-600 font-semibold"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" className="font-bold text-green-600">
                        {product.revenue.toLocaleString('vi-VN')} ₫
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}