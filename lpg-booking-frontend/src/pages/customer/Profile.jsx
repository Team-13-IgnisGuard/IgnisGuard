import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';
import distributorService from '../../services/distributorService';
import bookingService from '../../services/bookingService';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(user?.role !== 'Admin');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        if (user.role === 'Customer') {
          const data = await customerService.getProfile();
          setProfile(data);
        } else if (user.role === 'Distributor') {
          const data = await distributorService.getProfile();
          setProfile(data);
        } else if (user.role === 'DeliveryAgent') {
          const data = await bookingService.getAgentProfile();
          setProfile(data);
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setErrorMsg("Profile details have not been fully completed or setup yet.");
        } else {
          setErrorMsg("Failed to retrieve profile details from the system.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-orange" role="status" style={{ color: '#ff5e36' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Back button path depending on user role
  const getBackPath = () => {
    if (!user) return '/';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  return (
    <div className="container py-4 d-flex justify-content-center align-items-center animate-slide-up">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '640px' }}>
        <div className="d-flex align-items-center gap-3 border-bottom border-secondary-subtle pb-3 mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255, 95, 37, 0.08)', border: '2px solid rgba(255, 95, 37, 0.25)' }}>
            <i className="bi bi-person-fill" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
          </div>
          <div>
            <h2 className="text-white mb-0">My Account Profile</h2>
            <p className="text-secondary small mb-0">View-only profile details record</p>
          </div>
        </div>

        {errorMsg ? (
          <div className="text-center py-4">
            <div className="alert alert-warning border-warning-subtle bg-warning bg-opacity-10 text-warning rounded-3 small p-3 mb-4">
              {errorMsg}
            </div>
            {user?.role === 'Customer' ? (
              <Link to="/customer/complete-profile" className="btn btn-gradient-primary rounded-pill px-4">
                Complete Profile Setup
              </Link>
            ) : user?.role === 'Distributor' ? (
              <Link to="/distributor/dashboard" className="btn btn-gradient-primary rounded-pill px-4">
                Set Up Agency Profile
              </Link>
            ) : (
              <button onClick={() => navigate(getBackPath())} className="btn btn-outline-light rounded-pill px-4">
                Back to Dashboard
              </button>
            )}
          </div>
        ) : (
          <div>
            {user?.role === 'Customer' && profile && (
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Registered Name:</div>
                  <div className="col-7 text-white fw-semibold">{profile.firstName || '-'} {profile.lastName || ''}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Email Address:</div>
                  <div className="col-7 text-white fw-semibold">{profile.email}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Connection Number:</div>
                  <div className="col-7 text-white fw-semibold">{profile.connectionNumber}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Preferred Distributor:</div>
                  <div className="col-7 text-white fw-semibold">{profile.preferredDistributorName}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Service/Delivery Address:</div>
                  <div className="col-7 text-white-50 small">{profile.address}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">City:</div>
                  <div className="col-7 text-white fw-semibold">{profile.city}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">State:</div>
                  <div className="col-7 text-white fw-semibold">{profile.state}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Pin Code:</div>
                  <div className="col-7 text-white fw-semibold">{profile.pinCode}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Mobile Number:</div>
                  <div className="col-7 text-white fw-semibold">{profile.mobileNumber || '-'}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Connection Status:</div>
                  <div className="col-7">
                    <span className={`badge ${profile.status === 'Active' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30'}`}>
                      {profile.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'Distributor' && profile && (
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Registered Name:</div>
                  <div className="col-7 text-white fw-semibold">{user.firstName || '-'} {user.lastName || ''}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Email Address:</div>
                  <div className="col-7 text-white fw-semibold">{user.email}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Agency Name:</div>
                  <div className="col-7 text-white fw-semibold">{profile.agencyName}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Contact Number:</div>
                  <div className="col-7 text-white fw-semibold">{profile.contactNumber}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Agency Address:</div>
                  <div className="col-7 text-white-50 small">{profile.address}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Inventory Capacity:</div>
                  <div className="col-7 text-white fw-semibold">{profile.inventoryCapacity} Cylinders</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Current Stock:</div>
                  <div className="col-7 text-white fw-semibold">{profile.currentStock} Cylinders</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Platform Role:</div>
                  <div className="col-7">
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-30">
                      Distributor Agency
                    </span>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'DeliveryAgent' && profile && (
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Registered Name:</div>
                  <div className="col-7 text-white fw-semibold">{profile.name || `${user.firstName} ${user.lastName}`}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Email Address:</div>
                  <div className="col-7 text-white fw-semibold">{user.email}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Phone Number:</div>
                  <div className="col-7 text-white fw-semibold">{profile.phone || '-'}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Vehicle Number:</div>
                  <div className="col-7 text-white fw-semibold">{profile.vehicleNumber || '-'}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Agent Status:</div>
                  <div className="col-7">
                    <span className={`badge ${profile.isAvailable ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-30'}`}>
                      {profile.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'Admin' && (
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Registered Name:</div>
                  <div className="col-7 text-white fw-semibold">{user.firstName || '-'} {user.lastName || ''}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">Email Address:</div>
                  <div className="col-7 text-white fw-semibold">{user.email}</div>
                </div>
                <div className="row border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <div className="col-5 text-secondary small">System Role:</div>
                  <div className="col-7">
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30">
                      System Administrator
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-3 mt-4">
              {user?.role === 'Customer' && (
                <Link to="/customer/edit-profile" className="btn btn-gradient-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                  <i className="bi bi-pencil-square"></i> Edit Profile Details
                </Link>
              )}
              <button
                type="button"
                className="btn btn-outline-light rounded-pill px-4"
                onClick={() => navigate(getBackPath())}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
