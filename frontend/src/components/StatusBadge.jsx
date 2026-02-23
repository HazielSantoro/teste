import { cn } from '../lib/utils';

const statusConfig = {
  pending: {
    label: 'Pendente',
    className: 'status-pending',
  },
  printing: {
    label: 'Em Impressão',
    className: 'status-printing',
  },
  completed: {
    label: 'Concluído',
    className: 'status-completed',
  },
  delivered: {
    label: 'Entregue',
    className: 'status-delivered',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'status-cancelled',
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
