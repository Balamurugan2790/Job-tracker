import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Container, Card, CardContent, Typography, Button, Box, Grid, Chip, Stack, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, CircularProgress, Avatar
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Send from '@mui/icons-material/Send';
import Work from '@mui/icons-material/Work';
import LocationOn from '@mui/icons-material/LocationOn';
import AttachMoney from '@mui/icons-material/AttachMoney';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Rocket from '@mui/icons-material/RocketLaunch';

const API_BASE = 'https://job-tracker-xqv8.onrender.com';

function JobsPage({ openJobs, fetchOpenJobs, applications, fetchApplications, fetchInsights, onStatusUpdate }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingJob, setEditingJob] = useState(null);
  const [open, setOpen] = useState(false);
  const [statusForm, setStatusForm] = useState('applied');
  const [pendingJobs, setPendingJobs] = useState(new Set());
  const pendingTimers = useRef({});

  const STATUS_POOL = ['interview', 'interview', 'interview', 'rejected', 'rejected', 'hired'];

  const getApplicationStatus = (jobId) => {
    const app = applications.find(a => a.job_id === jobId);
    return app ? app.status : 'applied';
  };

  const applyToJob = async (jobId) => {
    const job = openJobs.find(j => j.id === jobId);
    try {
      const response = await axios.post(`${API_BASE}/apply/${jobId}`);
      const appId = response.data.id;
      setSnackbar({ open: true, message: 'Application submitted! Awaiting employer response...', severity: 'success' });
      await fetchApplications();
      await fetchOpenJobs();

      const delay = Math.floor(Math.random() * 8000) + 7000;
      const newStatus = STATUS_POOL[Math.floor(Math.random() * STATUS_POOL.length)];
      setPendingJobs(prev => new Set([...prev, jobId]));

      pendingTimers.current[jobId] = setTimeout(async () => {
        try {
          await axios.put(`${API_BASE}/applications/${appId}`, { status: newStatus });
          await fetchApplications();
          if (fetchInsights) await fetchInsights();
          setPendingJobs(prev => { const next = new Set(prev); next.delete(jobId); return next; });
          if (onStatusUpdate) onStatusUpdate({ status: newStatus, company: job?.company || '', position: job?.position || '' });
        } catch (e) {
          console.error('Auto-status update failed', e);
          setPendingJobs(prev => { const next = new Set(prev); next.delete(jobId); return next; });
        }
      }, delay);
    } catch (error) {
      console.error('Error applying to job:', error.response?.data);
      setSnackbar({ open: true, message: 'Error: ' + (error.response?.data?.message || error.message), severity: 'error' });
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    const app = applications.find(a => a.job_id === job.id);
    setStatusForm(app ? app.status : 'applied');
    setOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingJob) return;
    try {
      const apiUrl = `${API_BASE}/applications/${editingJob.app_id}`;
      await axios.put(apiUrl, { status: statusForm });
      setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
      setOpen(false);
      setEditingJob(null);
      await fetchApplications();
      if (fetchInsights) await fetchInsights();
    } catch (error) {
      console.error('Error updating status:', error.response?.data);
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const handleDelete = async (appId) => {
    try {
      const apiUrl = `${API_BASE}/applications/${appId}`;
      await axios.delete(apiUrl);
      setSnackbar({ open: true, message: 'Application deleted!', severity: 'success' });
      await fetchApplications();
    } catch (error) {
      console.error('Error deleting:', error.response?.data);
      setSnackbar({ open: true, message: 'Error deleting application', severity: 'error' });
    }
  };

  const isApplied = (jobId) => {
    return applications.some(app => app.job_id === jobId);
  };

  const getApplicationId = (jobId) => {
    const app = applications.find(a => a.job_id === jobId);
    return app ? app.id : null;
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: { bg: 'rgba(33, 150, 243, 0.1)', color: '#1976d2', label: 'Applied' },
      interview: { bg: 'rgba(255, 152, 0, 0.1)', color: '#f57c00', label: 'Interview' },
      rejected: { bg: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f', label: 'Rejected' },
      hired: { bg: 'rgba(76, 175, 80, 0.1)', color: '#388e3c', label: 'Hired' }
    };
    return colors[status] || colors.applied;
  };

  const COMPANY_COLORS = [
    ['#0066cc', '#00d4ff'], ['#7b1fa2', '#e040fb'], ['#d32f2f', '#ff5252'],
    ['#388e3c', '#69f0ae'], ['#f57c00', '#ffca28'], ['#0288d1', '#40c4ff'],
    ['#e91e63', '#f48fb1'], ['#00796b', '#80cbc4'], ['#5e35b1', '#b39ddb'],
    ['#c62828', '#ef9a9a'], ['#1565c0', '#90caf9'], ['#2e7d32', '#a5d6a7'],
    ['#6a1b9a', '#ce93d8'],
  ];
  const getCompanyColor = (id) => COMPANY_COLORS[(id - 1) % COMPANY_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Box sx={{
          mb: 6, p: 4, borderRadius: '20px',
          background: 'linear-gradient(135deg, #0066cc08 0%, #00d4ff10 100%)',
          border: '1px solid rgba(0,102,204,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #0066cc, #00d4ff)', borderRadius: '14px', p: 1.2, display: 'flex' }}>
              <Rocket sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0066cc' }}>
              Open Job Opportunities
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', pl: 7 }}>
            Browse and apply to the latest job postings
          </Typography>
        </Box>
      </motion.div>

      <Stack spacing={3}>
        {openJobs.length === 0 ? (
          <div>
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <Work sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', fontWeight: 600 }}>
                No job postings available
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc', mt: 1 }}>
                Check back later for new opportunities
              </Typography>
            </Card>
          </div>
        ) : (
          openJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -5 }}
              style={{ cursor: 'default' }}
            >
              <Card
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': { boxShadow: '0 12px 40px rgba(0,102,204,0.18)' },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${getCompanyColor(job.id)[0]} 0%, ${getCompanyColor(job.id)[1]} 100%)`,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                        <Avatar sx={{
                          background: `linear-gradient(135deg, ${getCompanyColor(job.id)[0]} 0%, ${getCompanyColor(job.id)[1]} 100%)`,
                          width: 52, height: 52, borderRadius: '14px',
                          fontWeight: 800, fontSize: '1.3rem',
                          boxShadow: `0 4px 14px ${getCompanyColor(job.id)[0]}44`,
                        }}>
                          {job.company[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111', mb: 0.2, lineHeight: 1.2 }}>
                            {job.company}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#555', fontSize: '1rem' }}>
                            {job.position}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs="auto">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ color: '#f57c00', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                              {job.location}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs="auto">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoney sx={{ color: '#388e3c', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                              {job.salary}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 102, 204, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 102, 204, 0.1)' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#333' }}>
                          {job.description}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0066cc', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.7px' }}>
                          Required Skills
                        </Typography>
                        <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', rowGap: '8px' }}>
                          {job.required_skills.split(',').map((skill, idx) => {
                            const [c1, c2] = getCompanyColor(job.id);
                            return (
                              <Chip
                                key={idx}
                                label={skill.trim()}
                                size="small"
                                sx={{
                                  borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem',
                                  background: `linear-gradient(135deg, ${c1}18 0%, ${c2}18 100%)`,
                                  color: c1, border: `1px solid ${c1}40`,
                                  '&:hover': { background: `linear-gradient(135deg, ${c1}30 0%, ${c2}30 100%)`, transform: 'scale(1.05)' },
                                  transition: 'all 0.2s ease',
                                }}
                              />
                            );
                          })}
                        </Stack>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      {isApplied(job.id) ? (
                        <div>
                          <Stack spacing={1.5}>
                            <Box sx={{
                              p: 2,
                              backgroundColor: getStatusColor(getApplicationStatus(job.id)).bg,
                              borderRadius: '12px',
                              border: `1px solid ${getStatusColor(getApplicationStatus(job.id)).color}50`,
                              textAlign: 'center',
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <CheckCircle sx={{ color: getStatusColor(getApplicationStatus(job.id)).color, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: getStatusColor(getApplicationStatus(job.id)).color, fontWeight: 700 }}>
                                  {getStatusColor(getApplicationStatus(job.id)).label}
                                </Typography>
                              </Box>
                              {pendingJobs.has(job.id) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1 }}>
                                  <CircularProgress size={11} sx={{ color: '#f57c00' }} />
                                  <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600, fontSize: '0.7rem' }}>
                                    Awaiting response...
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Button
                              variant="outlined"
                              size="medium"
                              onClick={() => handleEdit({ ...job, app_id: getApplicationId(job.id) })}
                              startIcon={<Edit />}
                              fullWidth
                              sx={{
                                py: 1.2,
                                borderRadius: '10px',
                                fontWeight: 600,
                              }}
                            >
                              Update Status
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="medium"
                              onClick={() => handleDelete(getApplicationId(job.id))}
                              startIcon={<Delete />}
                              fullWidth
                              sx={{
                                py: 1.2,
                                borderRadius: '10px',
                                fontWeight: 600,
                              }}
                            >
                              Remove
                            </Button>
                          </Stack>
                        </div>
                      ) : (
                        <div>
                          <Button
                            variant="contained"
                            size="large"
                            endIcon={<Send />}
                            onClick={() => applyToJob(job.id)}
                            fullWidth
                            sx={{
                              py: 1.8,
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '1rem',
                              background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                              boxShadow: '0 4px 15px rgba(0, 102, 204, 0.4)',
                              '&:hover': {
                                boxShadow: '0 6px 25px rgba(0, 102, 204, 0.6)',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Apply Now
                          </Button>
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{
        sx: {
          borderRadius: '16px',
        }
      }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 1 }}>
          Update Application Status
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 1, overflow: 'visible' }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: 600 }}>Status</InputLabel>
            <Select
              value={statusForm}
              onChange={(e) => setStatusForm(e.target.value)}
              label="Status"
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="applied">Applied</MenuItem>
              <MenuItem value="interview">Interview</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="hired">Hired</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </motion.div>
  );
}

export default JobsPage;
