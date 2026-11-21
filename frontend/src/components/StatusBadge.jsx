import React from 'react';
import { Clock, Eye, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status = 'pending', className = '' }) => {
  const normalized = (status || 'pending').toLowerCase().replace(' ', '-');

  const getStatusConfig = () => {
    switch (normalized) {
      case 'completed':
      case 'resolved':
        return {
          label: 'Resolved',
          icon: <CheckCircle2 size={13} strokeWidth={2.5} />,
          className: 'completed'
        };
      case 'reviewing':
      case 'in-progress':
        return {
          label: 'In Review',
          icon: <Eye size={13} strokeWidth={2.5} />,
          className: 'reviewing'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: <XCircle size={13} strokeWidth={2.5} />,
          className: 'rejected'
        };
      case 'pending':
      default:
        return {
          label: 'Pending',
          icon: <Clock size={13} strokeWidth={2.5} />,
          className: 'pending'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`status-pill ${config.className} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
