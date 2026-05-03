import { Box, Typography } from '@mui/material';

const ProfilePage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        My Profile
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Profile page coming soon...
      </Typography>
    </Box>
  );
};

export default ProfilePage;
