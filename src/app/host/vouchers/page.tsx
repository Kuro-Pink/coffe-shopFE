'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Switch,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, LocalOffer } from '@mui/icons-material';
import {
  Voucher,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherType,
  VoucherScope,
} from '@/types';
import { voucherService } from '@/lib/services/voucherService';
import { useAuthStore } from '@/lib/stores/authStore';

import ConfirmDialog from '@/components/common/ConfirmDialog';
import FormDialog from '@/components/common/FormDialog';
import ApplyVoucherDialog from '@/components/host/VoucherManager/ApplyVoucherDialog';
import { showToast } from '@/components/common/Toast';

export default function VoucherPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = user?.storeId;
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [openApply, setOpenApply] = useState(false);

  const [formData, setFormData] = useState<CreateVoucherPayload>({
    name: '',
    code: '',
    type: 'percent',
    value: 0,
    scope: 'order',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  useEffect(() => {
    if (user && user.role !== 'host') {
      router.replace('/host');
    }
  }, [user]);

  const fetchData = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const data = await voucherService.getVouchers(storeId);
      setVouchers(data);
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE =================
  const handleCreate = () => {
    setEditingVoucher(null);
    setFormData({
      name: '',
      code: '',
      type: 'percent',
      value: 0,
      scope: 'order',
      startDate: '',
      endDate: '',
    });
    setOpenForm(true);
  };

  // ================= EDIT =================
  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      name: voucher.name,
      code: voucher.code || '',
      type: voucher.type,
      value: voucher.value,
      scope: voucher.scope,
      minBillValue: voucher.minBillValue,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      startDate: voucher.startDate?.slice(0, 10),
      endDate: voucher.endDate?.slice(0, 10),
    });
    setOpenForm(true);
  };

  // ================= SUBMIT FORM =================
  const handleSubmit = async () => {
    if (!storeId) return;

    try {
      setLoading(true);

      if (editingVoucher) {
        const payload: UpdateVoucherPayload = {
          ...formData,
        };

        await voucherService.updateVoucher(editingVoucher._id, payload);
      } else {
        const payload: CreateVoucherPayload = {
          ...formData,
        };

        await voucherService.createVoucher(storeId, payload);
      }

      await fetchData();
      setOpenForm(false);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!selectedVoucher) return;
    await voucherService.deleteVoucher(selectedVoucher._id);
    setOpenDelete(false);
    fetchData();
  };

  // ================= TOGGLE ACTIVE =================
  const handleToggle = async (voucher: Voucher) => {
    await voucherService.toggleVoucher(voucher._id);
    showToast.success({ message: 'Thực hành thành công!' });
    fetchData();
  };

  if (!storeId) {
    return <Typography>Bạn chưa được gán cửa hàng</Typography>;
  }

  return (
    <Box className="p-6 space-y-6">
      {/* HEADER */}
      <Box className="flex justify-between items-center">
        <Typography variant="h4" className="font-bold text-gray-600">
          Quản lý Khuyến mại
        </Typography>

        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          Tạo Khyến mại
        </Button>
      </Box>

      {/* LIST */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vouchers.map((v) => (
          <Box
            key={v._id}
            className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            {/* TOP INFO */}
            <Box>
              <Typography className="font-semibold text-base text-gray-800">
                {v.code || v.name}
              </Typography>

              <Typography variant="body2" className="text-sm text-gray-500 mt-1">
                {v.type === 'percent' ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}
              </Typography>

              <Chip
                size="small"
                label={v.scope}
                className={`mt-2 font-medium
            ${v.scope === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
          `}
              />
            </Box>

            {/* ACTIONS */}
            <Box className="flex items-center justify-between mt-4">
              <Switch checked={v.isActive} onChange={() => handleToggle(v)} />

              <Box className="flex gap-1">
                <IconButton size="small" onClick={() => handleEdit(v)}>
                  <Edit fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setSelectedVoucher(v);
                    setOpenDelete(true);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setSelectedVoucher(v);
                    setOpenApply(true);
                  }}
                >
                  <LocalOffer fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* FORM DIALOG */}
      <FormDialog
        open={openForm}
        title={editingVoucher ? 'Sửa Khuyến mại' : 'Tạo Khuyến mại'}
        loading={loading}
        onCancel={() => setOpenForm(false)}
        onConfirm={handleSubmit}
        size="md"
      >
        <Box className="space-y-4">
          {/* NAME */}
          <TextField
            label="Tên Khuyến mại"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* CODE */}
          <TextField
            label="Mã Khuyến mại (không bắt buộc)"
            fullWidth
            margin="normal"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />

          {/* TYPE */}
          <TextField
            select
            label="Loại giảm"
            fullWidth
            margin="normal"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as VoucherType })}
          >
            <MenuItem value="percent">Phần trăm (%)</MenuItem>
            <MenuItem value="fixed">Số tiền (VND)</MenuItem>
          </TextField>

          {/* VALUE */}
          <TextField
            label="Giá trị giảm"
            type="number"
            fullWidth
            margin="normal"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
          />

          {/* SCOPE */}
          <TextField
            select
            label="Phạm vi áp dụng"
            fullWidth
            margin="normal"
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value as VoucherScope })}
          >
            <MenuItem value="order">Toàn đơn hàng</MenuItem>
            <MenuItem value="product">Theo sản phẩm</MenuItem>
          </TextField>

          {/* MIN BILL */}
          <TextField
            label="Giá trị đơn tối thiểu"
            type="number"
            fullWidth
            margin="normal"
            value={formData.minBillValue || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                minBillValue: Number(e.target.value) || undefined,
              })
            }
          />

          {/* MAX DISCOUNT */}
          <TextField
            label="Giảm tối đa"
            type="number"
            fullWidth
            margin="normal"
            value={formData.maxDiscount || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxDiscount: Number(e.target.value) || undefined,
              })
            }
          />

          {/* USAGE LIMIT */}
          <TextField
            label="Số lượng sử dụng"
            type="number"
            fullWidth
            margin="normal"
            value={formData.usageLimit || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                usageLimit: Number(e.target.value) || undefined,
              })
            }
          />

          {/* START DATE */}
          <TextField
            label="Ngày bắt đầu"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />

          {/* END DATE */}
          <TextField
            label="Ngày kết thúc"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </Box>
      </FormDialog>

      {/* APPLY PRODUCT */}
      <ApplyVoucherDialog
        open={openApply}
        voucher={selectedVoucher}
        onClose={() => setOpenApply(false)}
      />

      {/* DELETE */}
      <ConfirmDialog
        open={openDelete}
        title="Xóa voucher?"
        message="Hành động này không thể hoàn tác."
        variant="danger"
        onCancel={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
