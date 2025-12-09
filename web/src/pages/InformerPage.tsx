// web/src/pages/InformerPage.tsx
import React from 'react';
import RequestList from '../components/Informer/RequestList';

const InformerPage: React.FC = () => {
  return (
    <div>
      <h1>Informer Dashboard</h1>
      <RequestList />
    </div>
  );
};

export default InformerPage;