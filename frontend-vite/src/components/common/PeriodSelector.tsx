// TurisNow: Period Selector Component
import React from 'react';

type Period = 'day' | 'week' | 'month' | 'year';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods: { value: Period; label: string; icon: string }[] = [
    { value: 'day', label: 'Día', icon: 'fa-calendar-day' },
    { value: 'week', label: 'Semana', icon: 'fa-calendar-week' },
    { value: 'month', label: 'Mes', icon: 'fa-calendar-alt' },
    { value: 'year', label: 'Año', icon: 'fa-calendar' }
  ];

  return (
    <div className="period-selector">
      <div className="period-buttons">
        {periods.map(({ value, label, icon }) => (
          <button
            key={value}
            className={`period-btn ${selectedPeriod === value ? 'active' : ''}`}
            onClick={() => onPeriodChange(value)}
          >
            <i className={`fas ${icon} me-2`}></i>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;
