// web/src/components/Informer/RequestList.tsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Request {
  id: number;
  missing_person_name: string;
  status: string;
  date_missing: string;
  applicant: { name: string };
}

const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests');
        setRequests(res.data.data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <p>Loading requests...</p>;

  return (
    <div>
      <h2>Requests</h2>
      <ul>
        {requests.map(req => (
          <li key={req.id}>
            <strong>{req.missing_person_name}</strong> — {req.status} — Applicant: {req.applicant.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestList;