// TurisNow: Skeleton Loader Component
import React from 'react';
import './SkeletonCard.css';

interface SkeletonCardProps {
  variant?: 'experiencia' | 'reserva' | 'dashboard' | 'detail' | 'experienciaDetail';
  count?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  variant = 'experiencia',
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'experiencia':
        return (
          <div className="card h-100 skeleton-card">
            <div className="skeleton-image" style={{ height: '200px' }}></div>
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2"></div>
              <div className="skeleton-text skeleton-subtitle mb-3"></div>
              <div className="d-flex justify-content-between mb-2">
                <div className="skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton-text" style={{ width: '30%' }}></div>
              </div>
              <div className="skeleton-text mb-3" style={{ width: '60%' }}></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        );

      case 'reserva':
        return (
          <div className="card h-100 skeleton-card">
            <div className="card-header d-flex justify-content-between">
              <div className="skeleton-text" style={{ width: '80px' }}></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2"></div>
              <div className="skeleton-text mb-2" style={{ width: '70%' }}></div>
              <div className="skeleton-text mb-2" style={{ width: '60%' }}></div>
              <div className="skeleton-text mb-3" style={{ width: '50%' }}></div>
              <div className="d-flex justify-content-between">
                <div className="skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton-text" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-flex gap-2">
                <div className="skeleton-button flex-fill"></div>
                <div className="skeleton-button" style={{ width: '80px' }}></div>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="kpi-card skeleton-card">
            <div className="kpi-icon skeleton-circle"></div>
            <div className="kpi-content">
              <div className="skeleton-text" style={{ width: '100px', marginBottom: '8px' }}></div>
              <div className="skeleton-text skeleton-title" style={{ width: '120px', marginBottom: '8px' }}></div>
              <div className="skeleton-text" style={{ width: '80px' }}></div>
            </div>
          </div>
        );

      case 'detail':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image" style={{ height: '400px', marginBottom: '20px' }}></div>
            <div className="skeleton-text skeleton-title mb-3"></div>
            <div className="skeleton-text mb-2" style={{ width: '90%' }}></div>
            <div className="skeleton-text mb-2" style={{ width: '85%' }}></div>
            <div className="skeleton-text mb-4" style={{ width: '80%' }}></div>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="skeleton-text mb-2"></div>
                <div className="skeleton-text mb-2"></div>
                <div className="skeleton-text"></div>
              </div>
              <div className="col-md-6">
                <div className="skeleton-text mb-2"></div>
                <div className="skeleton-text mb-2"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <div className="skeleton-button flex-fill"></div>
              <div className="skeleton-button flex-fill"></div>
            </div>
          </div>
        );

      case 'experienciaDetail':
        return (
          <div className="experiencia-detail-skeleton">
            {/* Breadcrumb */}
            <div className="mb-3">
              <div className="skeleton-text" style={{ width: '300px', height: '20px' }}></div>
            </div>

            {/* Hero Image */}
            <div className="detail-hero mb-4">
              <div className="skeleton-image" style={{ height: '400px', borderRadius: '12px' }}></div>
            </div>

            {/* Content Grid */}
            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
              {/* Main Content */}
              <div className="main-content">
                {/* Description Section */}
                <div className="mb-4">
                  <div className="skeleton-text skeleton-title mb-3" style={{ width: '200px' }}></div>
                  <div className="skeleton-text mb-2" style={{ width: '100%' }}></div>
                  <div className="skeleton-text mb-2" style={{ width: '95%' }}></div>
                  <div className="skeleton-text mb-2" style={{ width: '98%' }}></div>
                  <div className="skeleton-text mb-4" style={{ width: '85%' }}></div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <div className="skeleton-text" style={{ width: '180px', height: '24px', marginBottom: '16px' }}></div>
                  <div className="d-flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="skeleton-badge" style={{ width: '100px', height: '32px' }}></div>
                    ))}
                  </div>
                </div>

                {/* Salidas Section */}
                <div className="mb-4">
                  <div className="skeleton-text skeleton-title mb-3" style={{ width: '220px' }}></div>
                  <div className="salidas-grid" style={{ display: 'grid', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="skeleton-card p-3" style={{ borderRadius: '8px' }}>
                        <div className="skeleton-text mb-2" style={{ width: '70%' }}></div>
                        <div className="skeleton-text mb-2" style={{ width: '40%' }}></div>
                        <div className="skeleton-text" style={{ width: '60%' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="booking-sidebar">
                <div className="skeleton-card p-4" style={{ borderRadius: '12px' }}>
                  <div className="skeleton-text mb-2" style={{ width: '150px' }}></div>
                  <div className="skeleton-text skeleton-title mb-4" style={{ width: '120px' }}></div>
                  
                  <div className="mb-4">
                    <div className="skeleton-text mb-2" style={{ width: '180px' }}></div>
                    <div className="skeleton-text mb-2" style={{ width: '100%' }}></div>
                    <div className="skeleton-text mb-3" style={{ width: '60%' }}></div>
                  </div>

                  <div className="skeleton-button mb-2" style={{ height: '50px' }}></div>
                  <div className="d-flex gap-2 mb-3">
                    <div className="skeleton-button flex-fill"></div>
                    <div className="skeleton-button" style={{ width: '80px' }}></div>
                  </div>
                  <div className="skeleton-text" style={{ width: '100%' }}></div>
                </div>

                {/* Info Card */}
                <div className="skeleton-card p-3 mt-3" style={{ borderRadius: '12px' }}>
                  <div className="skeleton-text mb-3" style={{ width: '200px' }}></div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton-text mb-2" style={{ width: '90%' }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions mt-4 d-flex gap-2">
              <div className="skeleton-button" style={{ width: '120px' }}></div>
              <div className="skeleton-button" style={{ width: '200px' }}></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="card skeleton-card">
            <div className="card-body">
              <div className="skeleton-text skeleton-title mb-2"></div>
              <div className="skeleton-text mb-2"></div>
              <div className="skeleton-text" style={{ width: '70%' }}></div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonCard;
