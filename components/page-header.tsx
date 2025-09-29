import { ReactNode } from 'react';

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function PageHeader({
  icon,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-white">
            {icon && <span className="">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
