import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
          How It Works
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
          1. Post your surplus food with a photo<br />
          2. Get matched with nearby receivers<br />
          3. Coordinate pickup with a secure code<br />
          4. Track your impact
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksPage;
