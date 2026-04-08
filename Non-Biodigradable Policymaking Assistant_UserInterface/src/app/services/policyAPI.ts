/**
 * Policy API Service
 * Handles all communication between React frontend and Python Flask backend
 * Provides type-safe API interactions for policy analysis
 */

import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

interface RegionalData {
  region: string;
  province: string;
  wden: number;
  urb: number;
  msw: number;
  sor: number;
  fee: string;
  organic: number;
  paper: number;
  glass: number;
  plastic: number;
}

interface CompositionData {
  organic: number;
  paper: number;
  glass: number;
  plastic: number;
  metals: number;
  others: number;
}

interface InfrastructureData {
  waste_density: number;
  collection_coverage: number;
  recycling_facilities: number;
  landfill_capacity: number;
  treatment_capacity: number;
}

interface PolicyRecommendation {
  policy: string;
  instrument: string;
  priority: string;
  actions: string[];
  expected_impact: string;
}

interface PolicyAnalysisResult {
  region: string;
  metrics: Record<string, any>;
  recommendations: PolicyRecommendation[];
  policy_readiness_score: number;
  waste_management_score?: number;
  policy_readiness?: string;
  assessment_date: string;
  [key: string]: any;
}

class PolicyAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        throw new Error(
          error.response?.data?.error ||
          error.message ||
          'An error occurred while communicating with the server'
        );
      }
    );
  }

  /**
   * Health check - verify API is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get<ApiResponse<{ status: string }>>('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get model status
   */
  async getModelStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analyze Regional Profile
   * Generates comprehensive policy recommendations for a region
   * @param regionData - Regional waste management metrics
   * @returns Policy analysis with recommendations
   */
  async analyzeRegionalProfile(
    regionData: RegionalData
  ): Promise<PolicyAnalysisResult> {
    try {
      const response = await this.client.post<ApiResponse<PolicyAnalysisResult>>(
        '/analyze/regional-profile',
        regionData
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return {
        region: response.data.region,
        metrics: response.data.metrics,
        recommendations: response.data.recommendations,
        policy_readiness_score: response.data.policy_readiness_score,
        waste_management_score: response.data.policy_readiness_score,
        policy_readiness: this.getPolicyReadinessLabel(response.data.policy_readiness_score),
        assessment_date: response.data.timestamp,
        key_findings: this.extractKeyFindings(regionData),
        policy_recommendations: this.formatRecommendations(response.data.recommendations),
        implementation_roadmap: this.generateImplementationRoadmap(),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analyze Waste Composition
   * Provides segregation policy recommendations based on composition
   * @param composition - Waste stream percentages
   * @returns Segregation policy and facility recommendations
   */
  async analyzeComposition(composition: CompositionData): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(
        '/analyze/composition-assessment',
        composition
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analyze Infrastructure
   * Assesses infrastructure adequacy and provides improvement recommendations
   * @param infrastructure - Current infrastructure metrics
   * @returns Infrastructure assessment and recommendations
   */
  async analyzeInfrastructure(
    infrastructure: InfrastructureData
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(
        '/analyze/infrastructure-assessment',
        infrastructure
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analyze Policy Effectiveness
   * Evaluates how effective current policies are
   * @param metrics - Current policy performance metrics
   * @returns Effectiveness score and improvement recommendations
   */
  async analyzePolicyEffectiveness(metrics: Record<string, number>): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(
        '/analyze/policy-effectiveness',
        metrics
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate Comprehensive Policy Report
   * Creates full policy assessment report for a region
   * @param regionData - Complete regional data
   * @returns Full policy report
   */
  async generatePolicyReport(regionData: RegionalData): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post(
        '/generate/policy-report',
        regionData
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save Analysis Report
   * Saves generated report for future reference
   * @param report - Report data to save
   * @returns Save confirmation with report ID
   */
  async saveReport(report: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/save-report', report);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Analysis History
   * Retrieves previously saved analyses
   * @returns List of saved analyses
   */
  async getAnalysisHistory(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/analysis-history');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Convert policy readiness score to label
   */
  private getPolicyReadinessLabel(score: number): string {
    if (score < 30) return 'CRITICAL - Immediate intervention required';
    if (score < 50) return 'INADEQUATE - Significant improvements needed';
    if (score < 70) return 'DEVELOPING - On track for improvement';
    return 'ADVANCED - Strong policy implementation';
  }

  /**
   * Extract and format key findings from regional data
   */
  private extractKeyFindings(data: RegionalData): any[] {
    const findings = [];

    if (data.wden > 300000) {
      findings.push({
        indicator: 'Waste Generation Pressure',
        status: 'CRITICAL',
        finding: `Waste density of ${data.wden.toLocaleString()} kg/km² indicates severe pressure`,
        implication: 'Immediate infrastructure scaling required',
      });
    }

    if (data.sor < 30) {
      findings.push({
        indicator: 'Waste Segregation Effectiveness',
        status: 'CRITICAL',
        finding: `Sorting rate of ${data.sor.toFixed(1)}% is below 50% threshold`,
        implication: 'Enhanced segregation programs required',
      });
    }

    if (data.urb > 70) {
      findings.push({
        indicator: 'Urban Concentration',
        status: 'HIGH',
        finding: `${data.urb.toFixed(1)}% urbanization rate indicates concentrated population`,
        implication: 'Urban-focused policy needed',
      });
    }

    if (data.organic > 50) {
      findings.push({
        indicator: 'Organic Waste Management',
        status: 'OPPORTUNITY',
        finding: `Organic waste comprises ${data.organic.toFixed(1)}% - major composting opportunity`,
        implication: 'Establish composting infrastructure',
      });
    }

    return findings;
  }

  /**
   * Format and structure policy recommendations
   */
  private formatRecommendations(recommendations: any[]): PolicyRecommendation[] {
    return recommendations.map(rec => ({
      policy: rec.policy || 'Unknown Policy',
      instrument: rec.instrument || 'Standard Instrument',
      priority: rec.priority || 'MEDIUM',
      actions: rec.actions || [],
      expected_impact: rec.expected_impact || 'To be determined',
    }));
  }

  /**
   * Generate sample implementation roadmap
   */
  private generateImplementationRoadmap(): Record<string, any> {
    return {
      phase_1: {
        duration: '0-3 months',
        months: 'Months 0-3',
        focus: 'Policy Formulation & Stakeholder Engagement',
        deliverables: [
          'Stakeholder consultation',
          'Policy framework finalization',
          'Budget allocation',
        ],
      },
      phase_2: {
        duration: '3-6 months',
        months: 'Months 3-6',
        focus: 'Infrastructure Development',
        deliverables: [
          'Material Recovery Facility construction',
          'Equipment procurement',
          'Personnel training',
        ],
      },
      phase_3: {
        duration: '6-12 months',
        months: 'Months 6-12',
        focus: 'Implementation & Monitoring',
        deliverables: [
          'Program launch',
          'Performance monitoring',
          'Community engagement',
        ],
      },
    };
  }
}

// Export singleton instance
export const policyAPI = new PolicyAPI();

// Export class and types for advanced usage
export { PolicyAPI, type ApiResponse, type RegionalData, type PolicyAnalysisResult };
