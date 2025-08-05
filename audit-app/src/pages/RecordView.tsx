import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAudit } from '../context/AuditContext';
import api from '../services/api';

// Define interface for record data
interface RecordData {
  id: string | number;
  name: string;
  recordType: string;
  dateOfBirth: string;
  address: string;
  contactNumber: string;
  lastUpdated: string;
  correlation_id: string;
}

const RecordView = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<RecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const { captureAuditEvent, getAuditContext } = useAudit();

  useEffect(() => {
    // Fetch record details using API service
    const fetchRecord = async () => {
      try {
        // Create audit context for this record view
        const auditContext = {
          ...getAuditContext(),
          action: 'view_record',
          recordId: id
        };

        // Use API service with audit context
        const data = await api.get<RecordData>(`/records/${id}`, auditContext);

        // Capture record view event
        captureAuditEvent('record_view', {
          recordId: id,
          recordType: data.recordType,
          timestamp: new Date().toISOString()
        });

        setRecord(data);
      } catch (error) {
        console.error('Failed to fetch record:', error);
        captureAuditEvent('record_view_error', { 
          recordId: id, 
          error: String(error) 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, captureAuditEvent, getAuditContext]);

  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Loading Record...</h1>
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Record Not Found</h1>
          <p className="govuk-body">The requested record could not be found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Record Details</h1>

        <div className="govuk-panel govuk-panel--confirmation">
          <h2 className="govuk-panel__title">{record.name}</h2>
          <div className="govuk-panel__body">
            Record ID: {record.id}
          </div>
        </div>

        <div className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Record Type</dt>
            <dd className="govuk-summary-list__value">{record.recordType}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Date of Birth</dt>
            <dd className="govuk-summary-list__value">{record.dateOfBirth}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Address</dt>
            <dd className="govuk-summary-list__value">{record.address}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Contact Number</dt>
            <dd className="govuk-summary-list__value">{record.contactNumber}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Last Updated</dt>
            <dd className="govuk-summary-list__value">{record.lastUpdated}</dd>
          </div>
        </div>

        <button 
          className="govuk-button govuk-button--secondary" 
          onClick={() => window.history.back()}
        >
          Back to Search Results
        </button>
      </main>
    </div>
  );
};

export default RecordView;
