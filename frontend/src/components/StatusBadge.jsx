const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', color: '#065F46', border: '#6EE7B7' };
      case 'at_risk':
        return { bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#92400E', border: '#FCD34D' };
      case 'completed':
        return { bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', color: '#1E40AF', border: '#93C5FD' };
      case 'planted':
        return { bg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', color: '#166534', border: '#86EFAC' };
      case 'growing':
        return { bg: 'linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%)', color: '#155E75', border: '#67E8F9' };
      case 'ready':
        return { bg: 'linear-gradient(135deg, #FEF9C3 0%, #FDE047 100%)', color: '#854D0E', border: '#FACC15' };
      case 'harvested':
        return { bg: 'linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%)', color: '#6B21A8', border: '#C084FC' };
      default:
        return { bg: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', color: '#374151', border: '#D1D5DB' };
    }
  };

  const colors = getStatusColor(status);
  const displayText = status?.replace('_', ' ').toUpperCase();

  return (
    <span style={{
      padding: '0.375rem 0.875rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      background: colors.bg,
      color: colors.color,
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      border: `1px solid ${colors.border}`,
      display: 'inline-block',
    }}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
