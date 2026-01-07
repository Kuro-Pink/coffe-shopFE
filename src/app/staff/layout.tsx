
'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Container, Chip } from '@mui/material';
import { useAuthStore } from '@/lib/stores/authStore';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Restaurant, Coffee, AttachMoney, Logout } from '@mui/icons-material';
export default function StaffLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const handleLogout = () => {
        logout();
        router.push('/login');
        };
        const getStaffIcon = () => {
            switch (user?.staffType) {
            case 'cashier':
                return <AttachMoney />;
            case 'bar':
                return <Coffee />;
            case 'kitchen':
                return <Restaurant />;
            default:
                return null;
            }
        };
        const getStaffTypeLabel = () => {
        switch (user?.staffType) {
        case 'cashier':
            return 'Thu ngân';
        case 'bar':
            return 'Pha chế';
        case 'kitchen':
            return 'Bếp';
        default:
            return 'Nhân viên';
        }
    };
return (
    <ProtectedRoute allowedRoles={['staff']}>
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <AppBar position="static" className="bg-gradient-to-r from-teal-600 to-cyan-600">
                <Toolbar>
                    <div className="flex items-center gap-2 mr-2">
                        {getStaffIcon()}
                    </div>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {getStaffTypeLabel()} Dashboard
                    </Typography>
                    <div className="flex items-center gap-3">
                        <Chip
                        label={user?.name}
                        variant="outlined"
                        className="text-white border-white"
                        />
                        <Button
                        color="inherit"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        >
                        Đăng xuất
                        </Button>
                    </div>
                </Toolbar>
            </AppBar>
            {/* Content */}
            <Container maxWidth="xl" className="py-8">
            {children}
            </Container>
        </div>
    </ProtectedRoute>
);
}
