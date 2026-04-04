import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box, Snackbar, Alert, CircularProgress, Divider
} from '@mui/material';
import Work from '@mui/icons-material/Work';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import CheckCircle from '@mui/icons-material/CheckCircle';

const API_BASE = 'https://job-tracker-xqv8.onrender.com';

function LoginPage({ setToken }) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? `${API_BASE}/login` : `${API_BASE}/register`;
      console.log('Sending to:', endpoint, 'with data:', loginForm);
      const response = await axios.post(endpoint, loginForm);
      console.log('Response:', response);
      if (isLogin) {
        const newToken = response.data.access_token;
        console.log('Login successful! Token:', newToken ? `${newToken.substring(0, 30)}...` : 'null');
        localStorage.setItem('token', newToken);
        setToken(newToken);
      } else {
        setSnackbar({ open: true, message: 'User registered successfully! Please login.', severity: 'success' });
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Authentication error:', error.response?.data || error.message);
      setSnackbar({ open: true, message: 'Authentication failed! Check console for details.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 50%, #00d4ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-100px',
          left: '-100px',
          filter: 'blur(40px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(40px)',
        },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card
            sx={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Header Section */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                  p: 4,
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <div>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      width: '70px',
                      height: '70px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                      transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
                    >
                      <Work sx={{ fontSize: 40 }} />
                    </motion.div>
                  </Box>
                </div>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                  JobTracker
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {isLogin ? 'Welcome back' : 'Join us today'}
                </Typography>
              </Box>

              {/* Form Section */}
              <Box sx={{ p: 4 }}>
                <form onSubmit={handleAuth}>
                  <div>
                    <TextField
                      fullWidth
                      label="Username"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      margin="normal"
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: '#0066cc' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#0066cc',
                          },
                        },
                      }}
                    />
                  </div>

                  <div>
                    <TextField
                      fullWidth
                      label="Password"
                      placeholder="Enter your password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      margin="normal"
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Lock sx={{ mr: 1, color: '#0066cc' }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#0066cc',
                          },
                        },
                      }}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 3,
                        py: 1.8,
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                        boxShadow: '0 4px 15px rgba(0, 102, 204, 0.4)',
                        '&:hover': {
                          boxShadow: '0 6px 25px rgba(0, 102, 204, 0.6)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: '#fff' }} />
                      ) : isLogin ? (
                        'Login'
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </form>

                <Divider sx={{ my: 3 }} />

                <div>
                  <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: '#666' }}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setIsLogin(!isLogin)}
                    sx={{
                      py: 1.2,
                      borderRadius: '12px',
                      fontWeight: 600,
                      borderColor: '#0066cc',
                      color: '#0066cc',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 102, 204, 0.05)',
                        borderColor: '#0052a3',
                      },
                    }}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Button>
                </div>

                {!isLogin && (
                  <div>
                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 200, 83, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 200, 83, 0.2)' }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <CheckCircle sx={{ color: '#00c853', fontSize: 18, mt: 0.3 }} />
                        <Typography variant="body2" sx={{ color: '#00c853', fontWeight: 600 }}>
                          Secure account creation
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Your password is hashed and never stored in plain text
                      </Typography>
                    </Box>
                  </div>
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginPage;
