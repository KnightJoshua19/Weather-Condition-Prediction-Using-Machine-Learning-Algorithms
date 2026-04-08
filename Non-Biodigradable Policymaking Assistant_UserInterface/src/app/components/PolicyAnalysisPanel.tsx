import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  TrendingUp,
  BarChart,
  CheckCircle,
  AlertTriangle,
  Target,
  Download,
  Send,
} from 'lucide-react';
import { policyAPI } from '../services/policyAPI';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface RegionalData {
  region: string;
  province: string;
  wden: number; // Waste density
  urb: number; // Urbanization rate
  msw: number; // Municipal solid waste
  sor: number; // Sorting rate
  fee: string; // Fee type
  organic: number;
  paper: number;
  glass: number;
  plastic: number;
  [key: string]: string | number;
}

interface PolicyRecommendation {
  policy: string;
  instrument: string;
  priority: string;
  actions: string[];
  expected_impact: string;
}

interface PolicyAnalysis {
  region: string;
  assessment_date: string;
  executive_summary: string;
  key_findings: any[];
  policy_recommendations: PolicyRecommendation[];
  implementation_roadmap: any;
  waste_management_score?: number;
  policy_readiness?: string;
}

export const PolicyAnalysisPanel: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Regional data state
  const [regionData, setRegionData] = useState<RegionalData>({
    region: '',
    province: '',
    wden: 0,
    urb: 0,
    msw: 0,
    sor: 0,
    fee: 'STANDARD',
    organic: 0,
    paper: 0,
    glass: 0,
    plastic: 0,
  });

  // Waste composition state
  const [composition, setComposition] = useState({
    organic: 0,
    paper: 0,
    glass: 0,
    plastic: 0,
    metals: 0,
    others: 0,
  });

  // Infrastructure state
  const [infrastructure, setInfrastructure] = useState({
    waste_density: 0,
    collection_coverage: 80,
    recycling_facilities: 0,
    landfill_capacity: 0,
    treatment_capacity: 0,
  });

  // Results
  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null);
  const [compositionResult, setCompositionResult] = useState<any>(null);
  const [infrastructureResult, setInfrastructureResult] = useState<any>(null);
  const [reportDialog, setReportDialog] = useState(false);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  // Update regional data
  const handleRegionalDataChange = (key: string, value: number | string) => {
    setRegionData(prev => ({ ...prev, [key]: value }));
  };

  // Update composition
  const handleCompositionChange = (key: string, value: number) => {
    setComposition(prev => ({ ...prev, [key]: value }));
  };

  // Update infrastructure
  const handleInfrastructureChange = (key: string, value: number) => {
    setInfrastructure(prev => ({ ...prev, [key]: value }));
  };

  // Analyze regional profile
  const analyzeRegionalProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await policyAPI.analyzeRegionalProfile(regionData);
      setAnalysis(result as PolicyAnalysis);
      setSuccess('Regional analysis completed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Analyze composition
  const analyzeComposition = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await policyAPI.analyzeComposition(composition);
      setCompositionResult(result);
      setSuccess('Composition analysis completed');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Composition analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Analyze infrastructure
  const analyzeInfrastructure = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await policyAPI.analyzeInfrastructure(infrastructure);
      setInfrastructureResult(result);
      setSuccess('Infrastructure analysis completed');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Infrastructure analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Save report
  const saveReport = async () => {
    if (!analysis) return;
    
    setLoading(true);
    try {
      await policyAPI.saveReport(analysis);
      setSuccess('Report saved successfully');
      setReportDialog(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to save report: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Download report
  const downloadReport = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `policy_analysis_${analysis.region}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="policy analysis tabs"
        >
          <Tab label="Regional Profile Analysis" />
          <Tab label="Waste Composition" />
          <Tab label="Infrastructure Assessment" />
          <Tab label="Policy Report" />
        </Tabs>
      </Box>

      {/* TAB 1: Regional Profile Analysis */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Regional Data Input"
                subheader="Enter waste management metrics for your region"
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Region Name"
                    value={regionData.region}
                    onChange={(e) => handleRegionalDataChange('region', e.target.value)}
                    fullWidth
                    placeholder="e.g., Metro Manila"
                  />
                  
                  <TextField
                    label="Province"
                    value={regionData.province}
                    onChange={(e) => handleRegionalDataChange('province', e.target.value)}
                    fullWidth
                    placeholder="e.g., NCR"
                  />
                  
                  <TextField
                    label="Waste Density (kg/km²)"
                    type="number"
                    value={regionData.wden}
                    onChange={(e) => handleRegionalDataChange('wden', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Urbanization Rate (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={regionData.urb}
                    onChange={(e) => handleRegionalDataChange('urb', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Municipal Solid Waste (tons/year)"
                    type="number"
                    value={regionData.msw}
                    onChange={(e) => handleRegionalDataChange('msw', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Source Segregation Rate (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={regionData.sor}
                    onChange={(e) => handleRegionalDataChange('sor', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Fee Collection Mechanism</InputLabel>
                    <Select
                      value={regionData.fee}
                      onChange={(e) => handleRegionalDataChange('fee', e.target.value)}
                      label="Fee Collection Mechanism"
                    >
                      <MenuItem value="STANDARD">Standard Fee</MenuItem>
                      <MenuItem value="PAYT">Pay-As-You-Throw (PAYT)</MenuItem>
                      <MenuItem value="VOLUME_BASED">Volume-Based</MenuItem>
                      <MenuItem value="WEIGHT_BASED">Weight-Based</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={analyzeRegionalProfile}
                    disabled={loading || !regionData.region}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send size={20} />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Regional Profile'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Column */}
          {analysis && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Analysis Results"
                  subheader={`Assessment Date: ${new Date(analysis.assessment_date).toLocaleDateString()}`}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Waste Management Score */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Waste Management Maturity Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={(analysis.waste_management_score || 0) * 1.25}
                            size={80}
                            thickness={4}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="h6" component="div">
                              {analysis.waste_management_score?.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Chip
                            label={analysis.policy_readiness}
                            color={analysis.policy_readiness?.includes('CRITICAL') ? 'error' : 'success'}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Key Findings */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Key Findings
                      </Typography>
                      <List>
                        {analysis.key_findings?.slice(0, 3).map((finding, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              {finding.status === 'CRITICAL' ? (
                                <AlertTriangle color="error" size={20} />
                              ) : (
                                <CheckCircle color="success" size={20} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={finding.indicator}
                              secondary={`${finding.status} - ${finding.implication}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Policy Recommendations */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Recommended Policies ({analysis.policy_recommendations?.length || 0})
                      </Typography>
                      {analysis.policy_recommendations?.map((policy, idx) => (
                        <Paper key={idx} sx={{ p: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {policy.policy}
                            </Typography>
                            <Chip label={policy.priority} size="small" color="primary" />
                          </Box>
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                            Instrument: {policy.instrument}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {policy.expected_impact}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* TAB 2: Waste Composition */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Waste Composition Input"
                subheader="Enter percentage breakdown of waste streams"
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(composition).map(([key, value]) => (
                    <TextField
                      key={key}
                      label={`${key.charAt(0).toUpperCase() + key.slice(1)} (%)`}
                      type="number"
                      inputProps={{min: 0, max: 100, step: 0.1}}
                      value={value}
                      onChange={(e) => handleCompositionChange(key, parseFloat(e.target.value))}
                      fullWidth
                    />
                  ))}
                  
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2">
                      Total: {Object.values(composition).reduce((a, b) => a + b, 0).toFixed(1)}%
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={analyzeComposition}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send size={20} />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Composition'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {compositionResult && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Segregation Policy Recommendations" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Recommended Streams */}
                    {compositionResult.segregation_policy?.recommended_streams && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Recommended Waste Streams
                        </Typography>
                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>Stream</TableCell>
                                <TableCell align="right">%</TableCell>
                                <TableCell>Treatment</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {compositionResult.segregation_policy.recommended_streams.map((stream: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>{stream.name}</TableCell>
                                  <TableCell align="right">{stream.percentage.toFixed(1)}</TableCell>
                                  <TableCell>{stream.treatment}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {/* Collection Frequency */}
                    {compositionResult.segregation_policy?.collection_frequency && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Recommended Collection Frequency
                        </Typography>
                        {Object.entries(compositionResult.segregation_policy.collection_frequency).map(([key, value]) => (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                            <Typography variant="body2">{key}:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Priority */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Priority Focus
                      </Typography>
                      <Chip label={compositionResult.policy_priority} color="primary" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* TAB 3: Infrastructure Assessment */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Infrastructure Metrics"
                subheader="Input current infrastructure capacity and coverage"
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Waste Density (kg/km²)"
                    type="number"
                    value={infrastructure.waste_density}
                    onChange={(e) => handleInfrastructureChange('waste_density', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Collection Coverage (%)"
                    type="number"
                    inputProps={{min: 0, max: 100}}
                    value={infrastructure.collection_coverage}
                    onChange={(e) => handleInfrastructureChange('collection_coverage', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Number of Recycling Facilities"
                    type="number"
                    value={infrastructure.recycling_facilities}
                    onChange={(e) => handleInfrastructureChange('recycling_facilities', parseInt(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Landfill Capacity (tons/day)"
                    type="number"
                    value={infrastructure.landfill_capacity}
                    onChange={(e) => handleInfrastructureChange('landfill_capacity', parseFloat(e.target.value))}
                    fullWidth
                  />
                  
                  <TextField
                    label="Treatment Capacity (%)"
                    type="number"
                    inputProps={{min: 0, max: 100}}
                    value={infrastructure.treatment_capacity}
                    onChange={(e) => handleInfrastructureChange('treatment_capacity', parseFloat(e.target.value))}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={analyzeInfrastructure}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send size={20} />}
                  >
                    {loading ? 'Analyzing...' : 'Assess Infrastructure'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {infrastructureResult && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Infrastructure Assessment Results" />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Infrastructure Score
                      </Typography>
                      <Typography variant="h4">
                        {infrastructureResult.infrastructure_score?.toFixed(1)} / 100
                      </Typography>
                    </Box>

                    {infrastructureResult.recommendations?.map((rec: any, idx: number) => (
                      <Paper key={idx} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {rec.area}
                          </Typography>
                          <Chip label={rec.priority} size="small" color={rec.priority === 'critical' ? 'error' : 'warning'} />
                        </Box>
                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                          Current: {rec.current_status} → Target: {rec.target}
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {rec.actions?.map((action: string, aidx: number) => (
                            <li key={aidx}>{action}</li>
                          ))}
                        </ul>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* TAB 4: Policy Report */}
      <TabPanel value={tabValue} index={3}>
        {analysis ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={`Policy Assessment Report: ${analysis.region}`}
                  subheader={new Date(analysis.assessment_date).toLocaleDateString()}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={downloadReport}
                        startIcon={<Download size={16} />}
                      >
                        Download
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setReportDialog(true)}
                      >
                        Save
                      </Button>
                    </Box>
                  }
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Executive Summary */}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Executive Summary
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {analysis.executive_summary}
                      </Typography>
                    </Box>

                    {/* Implementation Roadmap */}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Implementation Roadmap
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(analysis.implementation_roadmap || {}).map(([phase, details]: [string, any]) => (
                          <Grid item xs={12} md={4} key={phase}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {phase.toUpperCase()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                                {details.months}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {details.focus}
                              </Typography>
                              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem' }}>
                                {details.deliverables?.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            Complete a regional profile analysis to generate a comprehensive policy report.
          </Alert>
        )}
      </TabPanel>

      {/* Save Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save Policy Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Do you want to save this policy analysis report for future reference?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={saveReport} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PolicyAnalysisPanel;
