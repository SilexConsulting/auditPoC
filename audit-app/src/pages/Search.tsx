import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import api from '../services/api';

// Define interface for search result item
interface SearchResultItem {
  id: string | number;
  name: string;
  recordType: string;
}

// Define interface for search response data
interface SearchResponseData {
  results: SearchResultItem[];
  correlation_id: string;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchReason, setSearchReason] = useState('');
  const [searchingFor, setSearchingFor] = useState('other');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const navigate = useNavigate();
  const { setAuditReason, captureAuditEvent, getAuditContext } = useAudit();

  // Update audit reason when searchReason changes
  useEffect(() => {
    setAuditReason(searchReason);
  }, [searchReason, setAuditReason]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create audit context for this search
    const auditContext = {
      ...getAuditContext(),
      searchingForSelf: searchingFor === 'self',
    };

    try {
      // Use API service with audit context
      const data = await api.post<SearchResponseData>('/search', { term: searchTerm }, auditContext);

      // Capture search event
      captureAuditEvent('search', {
        term: searchTerm,
        searchingForSelf: searchingFor === 'self',
        resultsCount: data.results?.length || 0
      });

      // Set results
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      captureAuditEvent('search_error', { term: searchTerm, error: String(error) });

      // For demo purposes, still show results even if the API call fails
      setResults([
        { id: 1, name: 'John Smith', recordType: 'Personal' },
        { id: 2, name: 'Jane Doe', recordType: 'Medical' },
        { id: 3, name: 'Robert Johnson', recordType: 'Financial' },
      ] as SearchResultItem[]);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Records Search</h1>

        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            All searches are logged and audited. You must provide a valid reason for your search.
          </strong>
        </div>

        <form onSubmit={handleSearch} className="govuk-form-group">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="search">Search term</label>
            <input
              className="govuk-input"
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
          </div>

          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                Who are you searching for?
              </legend>
              <div className="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="searching-self"
                    name="searching-for"
                    type="radio"
                    value="self"
                    checked={searchingFor === 'self'}
                    onChange={() => setSearchingFor('self')}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="searching-self">
                    Myself
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="searching-other"
                    name="searching-for"
                    type="radio"
                    value="other"
                    checked={searchingFor === 'other'}
                    onChange={() => setSearchingFor('other')}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="searching-other">
                    Someone else
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="reason">Reason for search</label>
            <textarea
              className="govuk-textarea"
              id="reason"
              rows={3}
              value={searchReason}
              onChange={(e) => setSearchReason(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="govuk-button">Search Records</button>
        </form>

        {results.length > 0 && (
          <div className="govuk-!-margin-top-6">
            <h2 className="govuk-heading-m">Search Results</h2>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">ID</th>
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Record Type</th>
                  <th scope="col" className="govuk-table__header">Actions</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {results.map((result) => (
                  <tr key={result.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{result.id}</td>
                    <td className="govuk-table__cell">{result.name}</td>
                    <td className="govuk-table__cell">{result.recordType}</td>
                    <td className="govuk-table__cell">
                      <button 
                        className="govuk-button govuk-button--secondary" 
                        onClick={() => navigate(`/record/${result.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
