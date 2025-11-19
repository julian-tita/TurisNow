import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconType: 'money' | 'users' | 'clients' | 'sales';
  changeText: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconType, 
  changeText,
  changeType = 'positive'
}) => {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${iconType}`}>
        <i className={icon}></i>
      </div>
      <div className="kpi-content">
        <h3>{title}</h3>
        <div className="kpi-value">{value}</div>
        <div className={`kpi-change ${changeType}`}>
          {changeType === 'positive' && <i className="fas fa-arrow-up"></i>}
          {changeType === 'negative' && <i className="fas fa-arrow-down"></i>}
          {changeType === 'neutral' && <i className="fas fa-minus"></i>}
          {changeText}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
