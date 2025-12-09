// web/src/components/Coordinator/Dashboard.tsx
import React from 'react';
import MapView from './MapView';
import OperationList from './OperationList';

const Dashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', padding: '10px', overflowY: 'auto' }}>
        <OperationList />
      </div>
      <div style={{ width: '70%' }}>
        <MapView />
      </div>
    </div>
  );
};

export default Dashboard;