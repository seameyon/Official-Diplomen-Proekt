import { cn } from '../../utils';
import { RECIPE_RANKS, type RecipeRank } from '../../config/regions';

interface MasteryBadgeProps {
  rank: RecipeRank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MasteryBadge({ rank, size = 'md', showLabel = false }: MasteryBadgeProps) {
  const rankInfo = RECIPE_RANKS[rank];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const tierIndicator = (
    <span className="font-mono tracking-tight">
      {'I'.repeat(rankInfo.tier)}
    </span>
  );

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md border',
        rankInfo.bgColor,
        rankInfo.color,
        rankInfo.borderColor,
        sizeClasses[size]
      )}
    >
      {tierIndicator}
      {showLabel && (
        <>
          <span className="w-px h-3 bg-current opacity-30" />
          <span>{rankInfo.label}</span>
        </>
      )}
    </div>
  );
}

// Simple tier dots for minimal display
export function MasteryDots({ rank }: { rank: RecipeRank }) {
  const rankInfo = RECIPE_RANKS[rank];
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors',
            i < rankInfo.tier ? rankInfo.color.replace('text-', 'bg-') : 'bg-dark-700'
          )}
        />
      ))}
    </div>
  );
}
