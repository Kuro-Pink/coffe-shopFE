'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Tabs,
  Tab,
  TextField,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PendingActions,
  CheckCircle,
  Cancel,
  Store as StoreIcon,
  Phone,
  LocationOn,
  MoreVert,
  Delete,
} from '@mui/icons-material';
import { adminService } from '@/lib/services/adminService';
import { StoreRequest } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import FormDialog from '@/components/common/FormDialog';
import { showToast } from '@/components/common/Toast';
import { AxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useStoreRequestStore } from '@/lib/stores/storeRequestStore';
import { initAdminSocket, getSocket } from '@/lib/socket';

interface ErrorResponse {
  message?: string;
  error?: string;
}

type RequestStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function StoreRequestsPage() {
  const { loading, requests, fetchRequests } = useStoreRequestStore();
  // const [requests, setRequests] = useState<StoreRequest[]>([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<RequestStatus>('pending');

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<StoreRequest | null>(null);

  // Dialog states
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    request: StoreRequest | null;
  }>({ open: false, request: null });

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    request: StoreRequest | null;
  }>({ open: false, request: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    request: StoreRequest | null;
  }>({ open: false, request: null });

  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = initAdminSocket(token);

    const refetch = () => {
      fetchRequests();
    };

    socket.on('store_request_created', refetch);
    socket.on('store_request_updated', refetch);
    socket.on('store_request_deleted', refetch);

    return () => {
      socket.off('store_request_created', refetch);
      socket.off('store_request_updated', refetch);
      socket.off('store_request_deleted', refetch);
    };
  }, [fetchRequests]);

  // const fetchRequests = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await adminService.getStoreRequests();
  //     setRequests(
  //       data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  //     );
  //   } catch (err: unknown) {
  //     let errorMessage = 'Không thể tải danh sách yêu cầu';
  //     if (err instanceof AxiosError) {
  //       const responseData = err.response?.data as ErrorResponse;
  //       errorMessage = responseData?.message || responseData?.error || errorMessage;
  //     }
  //     setError(errorMessage);
  //     showToast.error({ message: errorMessage });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: StoreRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  // Action handlers
  const handleApproveClick = (request: StoreRequest) => {
    setApproveDialog({ open: true, request });
  };

  const handleApprove = async () => {
    if (!approveDialog.request) return;

    try {
      setActionLoading(true);
      await adminService.approveStoreRequest(approveDialog.request._id);
      await fetchRequests();
      setApproveDialog({ open: false, request: null });
      showToast.success({ message: 'Đã duyệt yêu cầu thành công! Email thông báo đã được gửi.' });
    } catch (err: unknown) {
      let errorMessage = 'Duyệt yêu cầu thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (request: StoreRequest) => {
    setRejectDialog({ open: true, request });
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectDialog.request || !rejectionReason.trim()) {
      showToast.warning({ message: 'Vui lòng nhập lý do từ chối' });
      return;
    }

    try {
      setActionLoading(true);
      await adminService.rejectStoreRequest(rejectDialog.request._id, rejectionReason);
      await fetchRequests();
      setRejectDialog({ open: false, request: null });
      setRejectionReason('');
      showToast.success({ message: 'Đã từ chối yêu cầu. Email thông báo đã được gửi.' });
    } catch (err: unknown) {
      let errorMessage = 'Từ chối yêu cầu thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialog({ open: true, request: selectedRequest });
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!deleteDialog.request) return;

    try {
      setActionLoading(true);
      await adminService.deleteStoreRequest(deleteDialog.request._id);
      await fetchRequests();
      setDeleteDialog({ open: false, request: null });
      showToast.success({ message: 'Đã xóa yêu cầu thành công!' });
    } catch (err: unknown) {
      let errorMessage = 'Xóa yêu cầu thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (selectedTab === 'all') return true;
    return req.status === selectedTab;
  });

  const getRequestCount = (status: RequestStatus): number => {
    if (status === 'all') return requests.length;
    return requests.filter((r) => r.status === status).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Yêu cầu đăng ký cửa hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Xem xét và duyệt yêu cầu từ các Host mới
          </Typography>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Status Tabs */}
      <Card className="shadow-md border-0 mb-6">
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          className="border-b border-gray-200"
        >
          <Tab
            label={
              <Badge badgeContent={getRequestCount('all')} color="primary">
                <span className="mr-2">Tất cả</span>
              </Badge>
            }
            value="all"
          />
          <Tab
            icon={<PendingActions />}
            iconPosition="start"
            label={
              <Badge badgeContent={getRequestCount('pending')} color="warning">
                <span className="mr-2">Chờ duyệt</span>
              </Badge>
            }
            value="pending"
          />
          <Tab
            icon={<CheckCircle />}
            iconPosition="start"
            label={
              <Badge badgeContent={getRequestCount('approved')} color="success">
                <span className="mr-2">Đã duyệt</span>
              </Badge>
            }
            value="approved"
          />
          <Tab
            icon={<Cancel />}
            iconPosition="start"
            label={
              <Badge badgeContent={getRequestCount('rejected')} color="error">
                <span className="mr-2">Đã từ chối</span>
              </Badge>
            }
            value="rejected"
          />
        </Tabs>
      </Card>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Typography variant="h6" className="text-gray-800 mb-2">
              Không có yêu cầu nào
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Chưa có yêu cầu đăng ký cửa hàng mới
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.map((request) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={request._id}>
              <Card
                className={`hover:shadow-xl transition-all border-2 ${
                  request.status === 'pending' ? 'border-orange-300' : 'border-gray-200'
                }`}
              >
                <CardContent>
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar
                      src={request.storeLogo}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600"
                    >
                      <StoreIcon />
                    </Avatar>
                    <div className="flex-1">
                      <Typography variant="h6" className="font-bold mb-1">
                        {request.storeName}
                      </Typography>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </div>
                    {/* Menu Button */}
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, request)}>
                      <MoreVert />
                    </IconButton>
                  </div>

                  {/* Store Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-gray-600">
                      <LocationOn fontSize="small" className="mt-0.5" />
                      <Typography variant="body2" className="flex-1">
                        {request.storeAddress}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone fontSize="small" />
                      <Typography variant="body2">{request.storePhone}</Typography>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <Typography
                      variant="caption"
                      className="font-semibold text-gray-700 block mb-2"
                    >
                      Thông tin chủ sở hữu:
                    </Typography>
                    {request.userId ? (
                      <>
                        <Typography variant="body2" className="mb-1">
                          {request.userId.name}
                        </Typography>
                        <Typography variant="body2" className="text-sm text-gray-600">
                          {request.userId.email}
                        </Typography>
                        <Typography variant="body2" className="text-sm text-gray-600">
                          {request.userId.phone}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" className="text-red-600 italic">
                        ⚠️ Tài khoản Host không tồn tại
                      </Typography>
                    )}
                  </div>

                  {/* Time */}
                  <Typography variant="caption" className="text-gray-500 block mb-3">
                    Gửi{' '}
                    {formatDistanceToNow(new Date(request.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </Typography>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApproveClick(request)}
                        className="bg-gradient-to-r from-green-600 to-teal-600"
                      >
                        Duyệt
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleRejectClick(request)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <Typography variant="caption" className="font-semibold text-red-800 block">
                        Lý do từ chối:
                      </Typography>
                      <Typography variant="body2" className="text-red-700">
                        {request.rejectionReason}
                      </Typography>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Typography variant="body2" className="text-green-700">
                        ✅ Đã duyệt và tạo cửa hàng
                      </Typography>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDeleteClick}>
          <Delete fontSize="small" className="mr-2" />
          Xóa yêu cầu
        </MenuItem>
      </Menu>

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        open={approveDialog.open}
        title="Xác nhận duyệt yêu cầu"
        message={`Bạn có chắc chắn muốn duyệt yêu cầu của "${approveDialog.request?.storeName}"? Email thông báo sẽ được gửi cho Host.`}
        confirmText="Duyệt"
        cancelText="Hủy"
        variant="success"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setApproveDialog({ open: false, request: null })}
      />

      {/* Reject Form Dialog */}
      <FormDialog
        open={rejectDialog.open}
        title="Từ chối yêu cầu"
        confirmText="Xác nhận từ chối"
        cancelText="Hủy"
        loading={actionLoading}
        size="sm"
        onConfirm={handleReject}
        onCancel={() => {
          setRejectDialog({ open: false, request: null });
          setRejectionReason('');
        }}
      >
        <Typography variant="body2" className="mb-4 text-gray-600">
          Vui lòng nhập lý do từ chối để gửi email thông báo cho Host:
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="VD: Thông tin cửa hàng chưa đầy đủ, vui lòng liên hệ để cung cấp thêm..."
          disabled={actionLoading}
        />
      </FormDialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Xác nhận xóa yêu cầu"
        message={`Bạn có chắc chắn muốn xóa yêu cầu của "${deleteDialog.request?.storeName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, request: null })}
      />
    </div>
  );
}
