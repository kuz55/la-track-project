import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Operation {
  id: number;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  coordinator: {
    id: number;
    name: string;
  };
}

const OperationList: React.FC = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await api.get('/operations');
        setOperations(response.data.data.operations);
      } catch (error) {
        console.error('Error fetching operations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, []);

  if (loading) return <p>Loading operations...</p>;

  return (
    <div>
      <h3>Operations</h3>
      <ul>
        {operations.map(op => (
          <li key={op.id}>
            <strong>{op.name}</strong> - {op.status} ({new Date(op.start_date).toLocaleDateString()} - {new Date(op.end_date).toLocaleDateString()})
            <br />
            Coordinator: {op.coordinator.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperationList;