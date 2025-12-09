// web/src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 — Страница не найдена</h1>
      <p>Извините, запрошенная вами страница не существует.</p>
      <Link to="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;