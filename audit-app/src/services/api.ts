import { recordCorrelationId } from '../utils/openReplayTracker';

// Base API service
class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  // Generic request method with correlation ID tracking
  async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any, 
    auditContext?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Include audit context in request if provided
    const requestData = auditContext 
      ? { ...data, _audit: auditContext } 
      : data;
    
    try {
      // For demo purposes, simulate API call
      console.log(`Making ${method} request to ${url}`, requestData);
      
      // In a real app, this would be a fetch call
      // For demo, we'll simulate a response with a correlation ID
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Record the correlation ID
      if (auditContext) {
        recordCorrelationId(correlationId, {
          endpoint,
          method,
          ...auditContext
        });
      }
      
      // Mock responses based on endpoint
      let responseData: any;
      
      if (endpoint.startsWith('/search')) {
        responseData = {
          results: [
            { id: 1, name: 'John Smith', recordType: 'Personal' },
            { id: 2, name: 'Jane Doe', recordType: 'Medical' },
            { id: 3, name: 'Robert Johnson', recordType: 'Financial' },
          ],
          correlation_id: correlationId
        };
      } else if (endpoint.startsWith('/records/')) {
        const id = endpoint.split('/').pop();
        responseData = {
          id,
          name: id === '1' ? 'John Smith' : id === '2' ? 'Jane Doe' : 'Robert Johnson',
          recordType: id === '1' ? 'Personal' : id === '2' ? 'Medical' : 'Financial',
          dateOfBirth: '1980-01-01',
          address: '123 Government Street, London',
          contactNumber: '020 1234 5678',
          lastUpdated: '2023-05-15',
          correlation_id: correlationId
        };
      } else {
        responseData = {
          success: true,
          correlation_id: correlationId
        };
      }
      
      return responseData as T;
    } catch (error) {
      console.error(`API error for ${method} ${url}:`, error);
      throw error;
    }
  }
  
  // Convenience methods
  async get<T>(endpoint: string, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, auditContext);
  }
  
  async post<T>(endpoint: string, data: any, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, auditContext);
  }
  
  async put<T>(endpoint: string, data: any, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, auditContext);
  }
  
  async delete<T>(endpoint: string, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, auditContext);
  }
}

export default new ApiService();