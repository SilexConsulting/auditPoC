import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const RecordView = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch record details
    const fetchRecord = async () => {
      try {
        // In a real application, this would be an actual API call
        // For demo purposes, we'll just simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setRecord({
          id,
          name: id === '1' ? 'John Smith' : id === '2' ? 'Jane Doe' : 'Robert Johnson',
          recordType: id === '1' ? 'Personal' : id === '2' ? 'Medical' : 'Financial',
          dateOfBirth: '1980-01-01',
          address: '123 Government Street, London',
          contactNumber: '020 1234 5678',
          lastUpdated: '2023-05-15',
        });
      } catch (error) {
        console.error('Failed to fetch record:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

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