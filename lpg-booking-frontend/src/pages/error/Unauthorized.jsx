import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  
  const dashboardPath = user ? `/${user.role.toLowerCase()}/dashboard` : '/';

  return (
    <div className="container text-center py-5 my-5 animate-slide-up">
      <div className="glass-panel p-5 d-inline-block" style={{ maxWidth: '520px' }}>
        <i className="bi bi-shield-slash-fill text-danger display-1 d-block mb-3"></i>
        <h1 className="text-white display-5 mb-2">Access Denied</h1>
        <p className="text-secondary mb-4">You do not have the required security credentials to access this department's dashboard.</p>
        <Link to={dashboardPath} className="btn btn-gradient-primary rounded-pill px-4">
          <i className="bi bi-speedometer2"></i> Back to Safety
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
