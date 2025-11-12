import "./StatsGrid.css";

export type StatCardConfig = {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
};

const StatsGrid = ({ stats }: { stats: StatCardConfig[] }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <p className="stat-card__label">{stat.label}</p>
          <p className="stat-card__value">{stat.value}</p>
          {stat.helper && <p className="stat-card__helper">{stat.helper}</p>}
          {stat.trend && <p className="stat-card__trend">{stat.trend}</p>}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
