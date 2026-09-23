import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container text-center py-5 my-5 animate-slide-up">
      <div className="glass-panel p-5 d-inline-block" style={{ maxWidth: '520px' }}>
        <i className="bi bi-exclamation-octagon text-orange display-1 d-block mb-3" style={{ color: '#ff5e36' }}></i>
        <h1 className="text-white display-5 mb-2">404 - Page Not Found</h1>
        <p className="text-secondary mb-4">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link to="/" className="btn btn-gradient-primary rounded-pill px-4">
          <i className="bi bi-house-door-fill"></i> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
