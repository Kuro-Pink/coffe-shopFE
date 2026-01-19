import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ title = 'Không có dữ liệu', description }: EmptyStateProps) {
  return (
    <Box textAlign="center" py={6} color="text.secondary">
      <InboxIcon sx={{ fontSize: 48, mb: 1 }} />
      <Typography fontWeight={600}>{title}</Typography>
      {description && <Typography variant="body2">{description}</Typography>}
    </Box>
  );
}
