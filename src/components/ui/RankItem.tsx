import { Box, Typography, Avatar } from '@mui/material';

interface RankItemProps {
  rank: number;
  name: string;
  value: string | number;
}

export default function RankItem({ rank, name, value }: RankItemProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>
          {rank}
        </Avatar>
        <Typography fontWeight={500}>{name}</Typography>
      </Box>
      <Typography fontWeight={600}>{value}</Typography>
    </Box>
  );
}
