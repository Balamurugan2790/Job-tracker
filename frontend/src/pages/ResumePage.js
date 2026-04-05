import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Container, Box, Typography, TextField, Button, Card, CardContent,
  CircularProgress, Select, MenuItem, FormControl, InputLabel,
  Chip, Stack, Avatar, Paper, LinearProgress
} from '@mui/material';
import Send from '@mui/icons-material/Send';
import SmartToy from '@mui/icons-material/SmartToy';
import Person from '@mui/icons-material/Person';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Lightbulb from '@mui/icons-material/Lightbulb';
import School from '@mui/icons-material/School';
import Code from '@mui/icons-material/Code';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Refresh from '@mui/icons-material/Refresh';
import UploadFile from '@mui/icons-material/UploadFile';

const API_BASE = 'https://job-tracker-xqv8.onrender.com';
const STEPS = { WELCOME: 'welcome', JOB_SELECT: 'job_select', ANALYZING: 'analyzing', DONE: 'done' };

function BotMessage({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
        <Avatar sx={{ bgcolor: '#0066cc', width: 36, height: 36, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,102,204,0.35)' }}>
          <SmartToy sx={{ fontSize: 20 }} />
        </Avatar>
        <Paper elevation={0} sx={{
          p: 2, maxWidth: '82%',
          backgroundColor: 'rgba(0,102,204,0.07)',
          borderRadius: '4px 16px 16px 16px',
          border: '1px solid rgba(0,102,204,0.14)',
        }}>
          <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
}

function UserMessage({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
        <Avatar sx={{ bgcolor: '#388e3c', width: 36, height: 36, flexShrink: 0, boxShadow: '0 2px 8px rgba(56,142,60,0.35)' }}>
          <Person sx={{ fontSize: 20 }} />
        </Avatar>
        <Paper elevation={0} sx={{
          p: 2, maxWidth: '82%',
          backgroundColor: 'rgba(56,142,60,0.07)',
          borderRadius: '16px 4px 16px 16px',
          border: '1px solid rgba(56,142,60,0.14)',
        }}>
          <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
}

function SectionBlock({ icon: Icon, title, color, bgColor, children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ bgcolor: bgColor, p: 0.7, borderRadius: '8px', display: 'flex' }}>
          <Icon sx={{ fontSize: 18, color }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function AnalysisMessage({ data }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
      <Avatar sx={{ bgcolor: '#0066cc', width: 36, height: 36, flexShrink: 0 }}>
        <SmartToy sx={{ fontSize: 20 }} />
      </Avatar>
      <Box sx={{ maxWidth: '92%', flexGrow: 1 }}>
        <Paper elevation={0} sx={{
          p: 2.5, mb: 1.5,
          background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
          borderRadius: '4px 16px 16px 16px',
        }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 0.5, fontSize: '1rem' }}>
            Resume Analysis Complete
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            {data.company} – {data.job_title}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Match Score</Typography>
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>{data.match_score}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={data.match_score} sx={{
              height: 6, borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: data.match_score >= 70 ? '#4caf50' : data.match_score >= 40 ? '#ff9800' : '#f44336',
                borderRadius: 3,
              },
            }} />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{
          p: 2.5, backgroundColor: '#fafbfc',
          borderRadius: '0 16px 16px 16px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {data.present_skills.length > 0 && (
            <SectionBlock icon={CheckCircle} title="Skills Matched" color="#388e3c" bgColor="rgba(56,142,60,0.1)">
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {data.present_skills.map((s, i) => (
                  <Chip key={i} label={s} size="small" sx={{ bgcolor: 'rgba(56,142,60,0.12)', color: '#388e3c', fontWeight: 600, borderRadius: '6px' }} />
                ))}
              </Stack>
            </SectionBlock>
          )}

          {data.missing_skills.length > 0 && (
            <SectionBlock icon={Cancel} title="Missing Skills" color="#d32f2f" bgColor="rgba(211,47,47,0.1)">
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {data.missing_skills.map((s, i) => (
                  <Chip key={i} label={s} size="small" sx={{ bgcolor: 'rgba(211,47,47,0.1)', color: '#d32f2f', fontWeight: 600, borderRadius: '6px' }} />
                ))}
              </Stack>
            </SectionBlock>
          )}

          <SectionBlock icon={TrendingUp} title="Recommended Keywords" color="#f57c00" bgColor="rgba(245,124,0,0.1)">
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {data.recommended_keywords.map((k, i) => (
                <Chip key={i} label={k} size="small" variant="outlined" sx={{ borderColor: '#f57c00', color: '#f57c00', fontWeight: 600, borderRadius: '6px' }} />
              ))}
            </Stack>
          </SectionBlock>

          <SectionBlock icon={Code} title="Suggested Projects" color="#7b1fa2" bgColor="rgba(123,31,162,0.1)">
            <Stack spacing={1}>
              {data.suggested_projects.map((p, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#7b1fa2', fontWeight: 700, minWidth: 12 }}>•</Typography>
                  <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.65 }}>{p}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionBlock>

          <SectionBlock icon={School} title="Certifications / Courses" color="#0288d1" bgColor="rgba(2,136,209,0.1)">
            <Stack spacing={1}>
              {data.certifications.map((c, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#0288d1', fontWeight: 700, minWidth: 12 }}>•</Typography>
                  <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.65 }}>{c}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionBlock>

          <SectionBlock icon={Lightbulb} title="Resume Improvements" color="#558b2f" bgColor="rgba(85,139,47,0.1)">
            <Stack spacing={1}>
              {data.improvements.map((imp, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#558b2f', fontWeight: 700, minWidth: 12 }}>•</Typography>
                  <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.65 }}>{imp}</Typography>
                </Box>
              ))}
            </Stack>
          </SectionBlock>
        </Paper>
      </Box>
    </Box>
  );
}

function ResumePage({ token, openJobs }) {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [messages, setMessages] = useState([
    { type: 'bot', content: "Hi! I'm your AI Resume Assistant.\n\nI'll analyze your resume against a specific job and give you personalized suggestions to improve your match score.\n\nLet's start” upload your resume or paste your resume text in the box below." }
  ]);
  const [resumeText, setResumeText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('text');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  const submitResume = (text, label) => {
    if (!text || text.trim().length < 50) {
      addMessage({ type: 'bot', content: 'The resume has too little text. Please try a different file or paste more content.' });
      return;
    }
    const preview = label ? `📄 ${label}` : text.trim().substring(0, 180) + (text.length > 180 ? '…' : '');
    addMessage({ type: 'user', content: preview });
    addMessage({ type: 'bot', content: "✅ Resume received!\n\nNow select the job you'd like to target from the dropdown, then click Analyze." });
    setStep(STEPS.JOB_SELECT);
  };

  const handleResumeSubmit = () => submitResume(resumeText, null);

  const handleAnalyze = async () => {
    if (!selectedJobId) return;
    const job = (openJobs || []).find(j => j.id === selectedJobId);
    addMessage({ type: 'user', content: `Analyze my resume for: ${job?.position} at ${job?.company}` });
    setStep(STEPS.ANALYZING);
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/ai-chat`, {
        resume_text: resumeText,
        job_id: selectedJobId,
      });
      setLoading(false);
      addMessage({ type: 'analysis', content: response.data });
      addMessage({ type: 'bot', content: "That's your personalized analysis! Use the button below to start a new analysis with a different resume or job." });
      setStep(STEPS.DONE);
    } catch (err) {
      setLoading(false);
      addMessage({ type: 'bot', content: '❌ Something went wrong during analysis. Please try again.' });
      setStep(STEPS.JOB_SELECT);
    }
  };

  const handleReset = () => {
    setMessages([{ type: 'bot', content: "👋 Ready for a new analysis!\n\nUpload or paste your updated resume to get started." }]);
    setResumeText('');
    setSelectedJobId(null);
    setInputMode('text');
    setUploadedFile(null);
    setStep(STEPS.WELCOME);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;
    const ext = uploadedFile.name.split('.').pop().toLowerCase();
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (ev) => submitResume(ev.target.result, uploadedFile.name);
      reader.readAsText(uploadedFile);
      return;
    }
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    try {
      const response = await axios.post(`${API_BASE}/parse-resume`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setResumeText(response.data.text);
      submitResume(response.data.text, uploadedFile.name);
    } catch (err) {
      addMessage({ type: 'bot', content: `❌ Could not parse the file: ${err.response?.data?.message || err.message}` });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#0066cc' }}>
          AI Assistant
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
          Get personalized resume feedback tailored to your target job
        </Typography>
      </Box>

      <Card sx={{
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute',
          top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #0066cc 0%, #00d4ff 100%)',
        },
      }}>
        <CardContent sx={{ p: 0 }}>
          {/* Chat window */}
          <Box sx={{
            height: '520px', overflowY: 'auto', p: 3,
            backgroundColor: '#f8fafb',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            {messages.map((msg, i) => {
              if (msg.type === 'bot') return <BotMessage key={i} content={msg.content} />;
              if (msg.type === 'user') return <UserMessage key={i} content={msg.content} />;
              if (msg.type === 'analysis') return <AnalysisMessage key={i} data={msg.content} />;
              return null;
            })}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#0066cc', width: 36, height: 36 }}>
                  <SmartToy sx={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ display: 'flex', gap: 0.6, p: 1.5, bgcolor: 'rgba(0,102,204,0.07)', borderRadius: '4px 16px 16px 16px', border: '1px solid rgba(0,102,204,0.14)' }}>
                  {[0, 1, 2].map(i => (
                    <Box key={i} sx={{
                      width: 8, height: 8, borderRadius: '50%', bgcolor: '#0066cc',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': { transform: 'scale(0.7)', opacity: 0.4 },
                        '40%': { transform: 'scale(1.2)', opacity: 1 },
                      },
                    }} />
                  ))}
                </Box>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Input area */}
          <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            {step === STEPS.WELCOME && (
              <Box>
                <Box sx={{ display: 'flex', mb: 2, border: '1px solid rgba(0,102,204,0.25)', borderRadius: '10px', overflow: 'hidden' }}>
                  {[['file', 'Upload File'], ['text', 'Paste Text']].map(([mode, label]) => (
                    <Button
                      key={mode}
                      onClick={() => { setInputMode(mode); setUploadedFile(null); }}
                      startIcon={mode === 'file' ? <UploadFile sx={{ fontSize: 18 }} /> : <Send sx={{ fontSize: 18 }} />}
                      sx={{
                        flex: 1, borderRadius: 0, py: 1, fontWeight: 600, fontSize: '0.85rem',
                        backgroundColor: inputMode === mode ? '#0066cc' : 'transparent',
                        color: inputMode === mode ? '#fff' : '#0066cc',
                        '&:hover': { backgroundColor: inputMode === mode ? '#0052a3' : 'rgba(0,102,204,0.06)' },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>

                {inputMode === 'file' ? (
                  <Box>
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    <Box
                      onDrop={handleFileDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('resume-file-input').click()}
                      sx={{
                        border: `2px dashed ${uploadedFile ? '#388e3c' : '#0066cc'}`,
                        borderRadius: '12px',
                        p: 3, mb: 2, textAlign: 'center', cursor: 'pointer',
                        backgroundColor: uploadedFile ? 'rgba(56,142,60,0.04)' : 'rgba(0,102,204,0.02)',
                        transition: 'all 0.2s',
                        '&:hover': { backgroundColor: uploadedFile ? 'rgba(56,142,60,0.08)' : 'rgba(0,102,204,0.06)' },
                      }}
                    >
                      {uploadedFile ? (
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#388e3c', mb: 0.5 }}>
                            {'\uD83D\uDCC4'} {uploadedFile.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {(uploadedFile.size / 1024).toFixed(1)} KB {'\u00B7'} Click to change
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <UploadFile sx={{ fontSize: 40, color: '#0066cc', mb: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                            Drop your resume here or click to browse
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            Supports PDF, DOCX, and TXT files
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleFileUpload}
                      disabled={!uploadedFile || uploadLoading}
                      endIcon={uploadLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Send />}
                      sx={{
                        py: 1.2, px: 4, borderRadius: '10px', fontWeight: 700,
                        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                      }}
                    >
                      {uploadLoading ? 'Extracting Text...' : 'Analyze File'}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <TextField
                      multiline rows={4} fullWidth
                      placeholder="Paste your full resume text here - include skills, experience, education, and projects..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.9rem' } }}
                    />
                    <Button
                      variant="contained" endIcon={<Send />}
                      onClick={handleResumeSubmit}
                      disabled={!resumeText.trim()}
                      sx={{
                        py: 1.2, px: 4, borderRadius: '10px', fontWeight: 700,
                        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                      }}
                    >
                      Submit Resume
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            {step === STEPS.JOB_SELECT && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <FormControl sx={{ minWidth: 300, flex: 1 }}>
                  <InputLabel sx={{ fontWeight: 600 }}>Select Target Job</InputLabel>
                  <Select
                    value={selectedJobId || ''}
                    onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
                    label="Select Target Job"
                    sx={{ borderRadius: '12px' }}
                  >
                    {(openJobs || []).map(job => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.company} - {job.position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained" endIcon={<SmartToy />}
                  onClick={handleAnalyze}
                  disabled={!selectedJobId}
                  sx={{
                    py: 1.5, px: 4, borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap',
                    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                  }}
                >
                  Analyze Resume
                </Button>
              </Box>
            )}

            {step === STEPS.ANALYZING && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>Analyzing your resume…</Typography>
              </Box>
            )}

            {step === STEPS.DONE && (
              <Button
                variant="outlined" startIcon={<Refresh />}
                onClick={handleReset}
                sx={{ py: 1.2, px: 4, borderRadius: '10px', fontWeight: 700 }}
              >
                Start New Analysis
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
    </motion.div>
  );
}

export default ResumePage;
