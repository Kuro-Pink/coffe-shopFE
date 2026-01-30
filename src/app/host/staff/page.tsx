'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Coffee,
  Restaurant,
  AttachMoney,
  Check,
  CheckCircle,
  Close,
  Cancel,
  LockReset,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { staffService } from '@/lib/services/staffService';
import { Staff, StaffStats } from '@/types';
import StaffDialog from '@/components/host/StaffManager/StaffDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ChangePasswordDialog from '@/components/host/StaffManager/ChangePasswordDialog';
import { showToast } from '@/components/common/Toast';
export default function StaffManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cashier' | 'bar' | 'kitchen'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordStaff, setPasswordStaff] = useState<Staff | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      fetchData();
    }
  }, [user?.storeId]);
  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, typeFilter, statusFilter]);
  const fetchData = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const [staffData, statsData] = await Promise.all([
        staffService.getStaff(user.storeId),
        staffService.getStats(user.storeId),
      ]);
      console.log('Fetched statsData data:', statsData);
      setStaff(staffData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };
  const filterStaff = () => {
    let filtered = staff;
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.phone.includes(searchTerm),
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((s) => s.staffType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => (statusFilter === 'active' ? s.isActive : !s.isActive));
    }

    setFilteredStaff(filtered);
  };
  const handleToggleStatus = async (staff: Staff) => {
    try {
      // optimistic update
      setStaff((prev) =>
        prev.map((s) => (s._id === staff._id ? { ...s, isActive: !s.isActive } : s)),
      );

      const updated = await staffService.toggleStatus(staff._id);

      // sync lại đúng data BE
      setStaff((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));

      showToast.success({ message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
      showToast.error({ message: 'Cập nhật trạng thái thất bại!' });
      fetchData(); // fallback nếu lỗi
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;

    try {
      await staffService.deleteStaff(deletingStaff._id);

      setStaff((prev) => prev.filter((s) => s._id !== deletingStaff._id));

      showToast.success({ message: 'Xóa nhân viên thành công!' });
      setDeleteDialogOpen(false);
      setDeletingStaff(null);
    } catch (error) {
      showToast.error({ message: 'Xóa nhân viên thất bại!' });
    }
  };

  const getStaffTypeIcon = (type: string) => {
    switch (type) {
      case 'cashier':
        return <AttachMoney />;
      case 'bar':
        return <Coffee />;
      case 'kitchen':
        return <Restaurant />;
      default:
        return <Person />;
    }
  };
  const getStaffTypeLabel = (type: string) => {
    switch (type) {
      case 'cashier':
        return 'Thu ngân';
      case 'bar':
        return 'Pha chế';
      case 'kitchen':
        return 'Bếp';
      default:
        return type;
    }
  };
  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Quản lý Nhân viên
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Quản lý thông tin và hiệu suất làm việc của nhân viên
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingStaff(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Thêm nhân viên
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} className="mb-8">
          {/* ✅ Status Summary */}
          <div className="flex gap-2 flex-wrap">
            <Chip
              icon={<Person />}
              label={`Tổng: ${stats.totalStaff}`}
              size="small"
              color="primary"
            />
            <Chip
              icon={<CheckCircle />}
              label={`Đang làm: ${stats.activeStaff}`}
              size="small"
              color="success"
            />
            <Chip
              icon={<Cancel />}
              label={`Nghỉ việc: ${stats.inactiveStaff}`}
              size="small"
              color="error"
            />
            <Chip
              icon={<AttachMoney />}
              label={`Thu ngân: ${stats.staffByType.cashier}`}
              size="small"
              color="secondary"
            />
            <Chip
              icon={<Coffee />}
              label={`Pha chế: ${stats.staffByType.bar}`}
              size="small"
              color="warning"
            />
            <Chip
              icon={<Restaurant />}
              label={`Bếp: ${stats.staffByType.kitchen}`}
              size="small"
              color="info"
            />
          </div>
        </Grid>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                margin="normal"
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search className="text-gray-400 mr-2" />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <div className="flex gap-2 flex-wrap">
                <Chip
                  label="Tất cả"
                  onClick={() => setTypeFilter('all')}
                  color={typeFilter === 'all' ? 'primary' : 'default'}
                />
                <Chip
                  label="Thu ngân"
                  onClick={() => setTypeFilter('cashier')}
                  color={typeFilter === 'cashier' ? 'primary' : 'default'}
                  icon={<AttachMoney />}
                />
                <Chip
                  label="Pha chế"
                  onClick={() => setTypeFilter('bar')}
                  color={typeFilter === 'bar' ? 'primary' : 'default'}
                  icon={<Coffee />}
                />
                <Chip
                  label="Bếp"
                  onClick={() => setTypeFilter('kitchen')}
                  color={typeFilter === 'kitchen' ? 'primary' : 'default'}
                  icon={<Restaurant />}
                />
              </div>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <div className="flex gap-2 flex-wrap">
                <Chip
                  label="Tất cả"
                  onClick={() => setStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                />
                <Chip
                  label="Đang làm"
                  onClick={() => setStatusFilter('active')}
                  color={statusFilter === 'active' ? 'success' : 'default'}
                />
                <Chip
                  label="Nghỉ việc"
                  onClick={() => setStatusFilter('inactive')}
                  color={statusFilter === 'inactive' ? 'error' : 'default'}
                />
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Person className="text-gray-300 text-6xl mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Không tìm thấy nhân viên phù hợp'
                : 'Chưa có nhân viên nào'}
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc'
                : 'Bắt đầu bằng cách thêm nhân viên đầu tiên'}
            </Typography>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingStaff(null);
                  setDialogOpen(true);
                }}
              >
                Thêm nhân viên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredStaff.map((staffMember) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={staffMember._id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          staffMember.isActive
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gray-300'
                        } text-white`}
                      >
                        {getStaffTypeIcon(staffMember.staffType)}
                      </div>
                      <div>
                        <Typography variant="h6" className="font-semibold">
                          {staffMember.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={getStaffTypeLabel(staffMember.staffType)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <Switch
                        checked={staffMember.isActive}
                        onChange={() => handleToggleStatus(staffMember)}
                        size="medium"
                        color="success"
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          marginTop: '-12px',
                          color: staffMember.isActive ? 'success.main' : 'text.secondary',
                        }}
                      >
                        {staffMember.isActive ? 'Đang làm' : 'Tạm nghỉ'}
                      </Typography>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Typography variant="body2" className="text-gray-600">
                      📧 {staffMember.email}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      📱 {staffMember.phone}
                    </Typography>
                  </div>

                  <div className="flex gap-2">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setEditingStaff(staffMember);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => {
                        setPasswordStaff(staffMember);
                        setChangePasswordOpen(true);
                      }}
                    >
                      <LockReset />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setDeletingStaff(staffMember);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Staff Dialog */}
      <StaffDialog
        open={dialogOpen}
        staff={editingStaff}
        storeId={user?.storeId || ''}
        onClose={() => {
          setDialogOpen(false);
          setEditingStaff(null);
        }}
        onSuccess={(staff: Staff) => {
          setStaff((prev) => {
            const exists = prev.find((s) => s._id === staff._id);
            return exists ? prev.map((s) => (s._id === staff._id ? staff : s)) : [staff, ...prev];
          });

          setDialogOpen(false);
          setEditingStaff(null);
        }}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        staff={passwordStaff}
        onClose={() => {
          setChangePasswordOpen(false);
          setPasswordStaff(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xóa nhân viên"
        message={`Bạn có chắc muốn xóa nhân viên "${deletingStaff?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingStaff(null);
        }}
      />
    </div>
  );
}
