'use client';

import { useEffect, useState } from 'react';
import { Container, Stack, Button } from '@mui/material';
import ProfileInfoCard from '@/components/host/AuthManager/ProfileInfoCard';
import ChangePasswordCard from '@/components/host/AuthManager/ChangePasswordCard';
import { authService } from '@/lib/services/authService';
import { User } from '@/types';

export default function ProfilePageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    authService.getMe().then((res) => setUser(res.data));
  }, []);

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <ProfileInfoCard user={user} onUpdated={setUser} />

        {!showChangePassword ? (
          <Button variant="outlined" onClick={() => setShowChangePassword(true)}>
            Đổi mật khẩu
          </Button>
        ) : (
          <ChangePasswordCard onClose={() => setShowChangePassword(false)} />
        )}
      </Stack>
    </Container>
  );
}
