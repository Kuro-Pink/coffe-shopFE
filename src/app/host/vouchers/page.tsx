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
import { Voucher, CreateVoucherPayload, UpdateVoucherPayload, VoucherType } from '@/types';
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
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateVoucherPayload>({
    name: '',
    code: '',
    type: 'percent',
    value: 0,
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    value?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const validateField = (field: string, value: any) => {
    let message = '';

    switch (field) {
      case 'name':
        if (!value.trim()) message = 'Tên khuyến mãi không được để trống';
        break;

      case 'value':
        if (!value || value <= 0) message = 'Giá trị giảm phải lớn hơn 0';
        if (formData.type === 'percent' && value > 100) {
          message = 'Giá trị giảm không được lớn hơn 100%';
        }
        break;

      case 'startDate':
        if (!value) message = 'Cần có thời gian bắt đầu';
        if (formData.endDate && new Date(value) > new Date(formData.endDate)) {
          message = 'Phải trước ngày kết thúc';
        }
        break;

      case 'endDate':
        if (!value) message = 'Cần có thời gian kết thúc';
        if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
          message = 'Phải sau ngày bắt đầu';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

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
      startDate: '',
      endDate: '',
    });
    setOpenForm(true);
    setErrors({});
  };

  // ================= EDIT =================
  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      name: voucher.name,
      code: voucher.code || '',
      type: voucher.type,
      value: voucher.value,
      minBillValue: voucher.minBillValue,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      startDate: voucher.startDate?.slice(0, 10),
      endDate: voucher.endDate?.slice(0, 10),
    });
    setOpenForm(true);
    setErrors({});
  };

  // ================= SUBMIT FORM =================
  const handleSubmit = async () => {
    if (!storeId) return;

    // validate toàn bộ lần cuối
    validateField('name', formData.name);
    validateField('value', formData.value);
    validateField('startDate', formData.startDate);
    validateField('endDate', formData.endDate);

    const hasError = Object.values(errors).some((e) => e);
    if (hasError) return;

    try {
      setLoading(true);

      const payload = {
        ...formData,
        code: formData.code?.toUpperCase() || undefined,
      };

      if (editingVoucher) {
        await voucherService.updateVoucher(editingVoucher._id, payload);
        showToast.success({ message: 'Cập nhật thành công' });
      } else {
        await voucherService.createVoucher(storeId, payload);
        showToast.success({ message: 'Tạo thành công' });
      }

      await fetchData();
      setOpenForm(false);
    } catch (err: any) {
      showToast.error({
        message: err?.response?.data?.message || 'Có lỗi xảy ra',
      });
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
    try {
      await voucherService.toggleVoucher(voucher._id);
      showToast.success({ message: 'Thành công' });
      fetchData();
    } catch {
      showToast.error({ message: 'Lỗi khi đổi trạng thái' });
    }
  };
  const handleChange = (field: keyof CreateVoucherPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };
  const now = new Date();

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
            {new Date(v.endDate) < now && <Chip label="Hết hạn" color="error" size="small" />}
            {/* TOP INFO */}
            <Box>
              <Typography className="font-semibold text-base text-gray-800">
                {v.code || v.name}
              </Typography>

              <Typography variant="body2" className="text-sm text-gray-500 mt-1">
                {v.type === 'percent' ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString()}đ`}
              </Typography>
              {v.usageLimit && (
                <Typography variant="caption" className="text-gray-500 block">
                  Còn {v.usageLimit - (v.usedCount || 0)} lượt
                </Typography>
              )}
            </Box>

            {/* ACTIONS */}
            <Box className="flex items-center justify-between mt-4">
              <Switch
                checked={v.isActive}
                disabled={v.usageLimit && v.usedCount >= v.usageLimit}
                onChange={() => handleToggle(v)}
              />

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
            error={!!errors.name}
            helperText={errors.name}
            onChange={(e) => handleChange('name', e.target.value)}
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
            inputProps={{
              min: 1,
              max: formData.type === 'percent' ? 100 : undefined,
            }}
            value={formData.value}
            error={!!errors.value}
            helperText={errors.value}
            onChange={(e) => handleChange('value', Math.max(0, Number(e.target.value)))}
          />

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
            error={!!errors.startDate}
            helperText={errors.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />

          {/* END DATE */}
          <TextField
            label="Ngày kết thúc"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            error={!!errors.endDate}
            helperText={errors.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
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
