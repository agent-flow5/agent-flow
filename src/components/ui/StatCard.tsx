import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  iconBg: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
  iconBg,
  className,
  onClick,
  children,
}: StatCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 transition-all',
        onClick && 'hover:border-purple-200 hover:shadow-xl cursor-pointer',
        className
      )}
    >
      {onClick && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity',
          iconBg
        )}></div>
      )}

      <div className="relative">
        <div className={cn('inline-flex p-3 rounded-xl bg-gradient-to-br mb-4', gradient)}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">{value}</span>
            {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
          </div>
          {children}
        </div>
      </div>
    </Component>
  );
}
