import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Region } from '../../config/regions';
import { cn } from '../../utils';

interface RegionCardProps {
  region: Region;
  index?: number;
  variant?: 'default' | 'featured' | 'compact';
}

export function RegionCard({ region, index = 0, variant = 'default' }: RegionCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={`/regions/${region.id}`}>
        <div
          className={cn(
            'group relative overflow-hidden transition-all duration-500',
            'panel-hover',
            isFeatured ? 'p-8' : isCompact ? 'p-4' : 'p-6'
          )}
        >
          {/* Atmospheric background glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${region.colors.glow}, transparent 70%)`,
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-50 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(90deg, transparent, ${region.colors.primary}, transparent)`,
            }}
          />

          <div className="relative z-10">
            {/* Region accent bar */}
            <div
              className="h-0.5 w-12 rounded-full mb-5 transition-all duration-500 group-hover:w-20"
              style={{ backgroundColor: region.colors.primary }}
            />

            {/* Origin label */}
            <p className="text-xs text-dark-500 uppercase tracking-[0.2em] mb-2">
              {region.inspiration}
            </p>

            {/* Region name */}
            <h3
              className={cn(
                'font-display font-semibold text-dark-100 mb-1 transition-colors group-hover:text-dark-50',
                isFeatured ? 'text-2xl' : isCompact ? 'text-base' : 'text-xl'
              )}
            >
              {region.name}
            </h3>

            {/* Subtitle */}
            <p
              className={cn(
                'text-dark-400 italic mb-4',
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              {region.subtitle}
            </p>

            {!isCompact && (
              <>
                {/* Description */}
                <p className="text-dark-400 text-sm leading-relaxed mb-6 line-clamp-2">
                  {region.description}
                </p>

                {/* Divider */}
                <div className="h-px bg-dark-700/50 mb-4" />

                {/* Character info */}
                <div className="mb-4">
                  <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">
                    Master Chef
                  </p>
                  <p className="text-dark-200 font-medium text-sm">
                    {region.character.name}
                  </p>
                  <p className="text-dark-500 text-xs">
                    {region.character.title}
                  </p>
                </div>

                {/* Signature dishes */}
                <div className="flex flex-wrap gap-1.5">
                  {region.dishes.slice(0, 3).map((dish) => (
                    <span
                      key={dish}
                      className="px-2 py-0.5 text-xs bg-surface-100/30 text-dark-400 rounded border border-dark-700/30"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Explore link */}
            <div className="flex items-center gap-2 mt-4 text-sm text-dark-500 group-hover:text-primary-400 transition-colors">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
