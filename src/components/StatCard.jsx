import styled from 'styled-components';
import { motion } from 'framer-motion';
import Panel from './Panel';
import { FiArrowUpRight, FiArrowDownRight, FiArrowRight } from 'react-icons/fi';

const StatContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.xs} 0;
  }
`;

const StatValue = styled.div.attrs(props => {
  // Filter out custom props
  const { gradient, color, ...rest } = props;
  return rest;
})`
  font-size: 2.5rem;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: ${props => props.theme.spacing.sm} 0;
  background: ${props => props.gradient 
    ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})` 
    : 'none'};
  background-clip: ${props => props.gradient ? 'text' : 'none'};
  -webkit-background-clip: ${props => props.gradient ? 'text' : 'none'};
  -webkit-text-fill-color: ${props => props.gradient ? 'transparent' : 'inherit'};
  color: ${props => 
    props.color === 'primary' ? props.theme.colors.primary :
    props.color === 'secondary' ? props.theme.colors.secondary :
    props.theme.colors.text.primary};
    
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: 1.75rem;
    margin: ${props => props.theme.spacing.xs} 0;
  }
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize.xs};
    letter-spacing: 0.5px;
  }
`;

const StatTrend = styled.div.attrs(props => {
  // Filter out custom props
  const { trend, ...rest } = props;
  return rest;
})`
  display: flex;
  align-items: center;
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => 
    props.trend > 0 ? props.theme.colors.success :
    props.trend < 0 ? props.theme.colors.error :
    props.theme.colors.text.secondary};
    
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    margin-top: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const TrendIcon = styled.span`
  margin-right: ${props => props.theme.spacing.xs};
`;

const StatIcon = styled.div.attrs(props => {
  // Filter out custom props
  const { color, ...rest } = props;
  return rest;
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.circular};
  background: ${props => 
    props.color === 'primary' ? `${props.theme.colors.primary}20` :
    props.color === 'secondary' ? `${props.theme.colors.secondary}20` :
    props.color === 'success' ? `${props.theme.colors.success}20` :
    props.color === 'error' ? `${props.theme.colors.error}20` :
    `linear-gradient(135deg, ${props.theme.colors.primary}20, ${props.theme.colors.secondary}20)`};
  color: ${props => 
    props.color === 'primary' ? props.theme.colors.primary :
    props.color === 'secondary' ? props.theme.colors.secondary :
    props.color === 'success' ? props.theme.colors.success :
    props.color === 'error' ? props.theme.colors.error :
    props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 36px;
    height: 36px;
    margin-bottom: ${props => props.theme.spacing.xs};
    
    svg {
      width: 18px !important;
      height: 18px !important;
    }
  }
`;

// Custom Panel styled component with mobile-specific adjustments
const StatPanel = styled(Panel)`
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

const StatCard = ({
  label,
  value,
  trend,
  trendLabel,
  icon,
  iconColor = 'primary',
  valueColor,
  gradientValue = false,
  variant = 'stat',
  accent,
  ...props
}) => {
  // Format trend display
  const formatTrend = (trend) => {
    if (trend > 0) return `+${trend}%`;
    if (trend < 0) return `${trend}%`;
    return '0%';
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend > 0) return <FiArrowUpRight size={16} />;
    if (trend < 0) return <FiArrowDownRight size={16} />;
    return <FiArrowRight size={16} />;
  };

  return (
    <StatPanel 
      variant={variant} 
      accent={accent}
      fullHeight
      {...props}
    >
      <StatContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {icon && <StatIcon color={iconColor}>{icon}</StatIcon>}
        
        <StatLabel>{label}</StatLabel>
        
        <StatValue 
          gradient={gradientValue}
          color={valueColor}
        >
          {value}
        </StatValue>
        
        {trend !== undefined && (
          <StatTrend trend={trend}>
            <TrendIcon>{getTrendIcon(trend)}</TrendIcon>
            {formatTrend(trend)} {trendLabel && `(${trendLabel})`}
          </StatTrend>
        )}
      </StatContainer>
    </StatPanel>
  );
};

export default StatCard; 