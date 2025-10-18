'use client';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useMemo, memo } from 'react';

// Memoizar a função de formatação para evitar recriação
const formatSegment = (segment: string) => {
  return segment
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
};

// Componente memoizado para cada item do breadcrumb
const BreadcrumbItemComponent = memo(
  ({
    segment,
    href,
    isLast,
  }: {
    segment: string;
    href: string;
    isLast: boolean;
  }) => (
    <BreadcrumbItem>
      {isLast ? (
        <BreadcrumbPage>
          {formatSegment(segment)}
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink href={href}>
          {formatSegment(segment)}
        </BreadcrumbLink>
      )}
      {!isLast && <BreadcrumbSeparator />}
    </BreadcrumbItem>
  ),
);

BreadcrumbItemComponent.displayName =
  'BreadcrumbItemComponent';

export const Breadcrumbs = memo(function Breadcrumbs() {
  const pathname = usePathname();

  // Memoizar o cálculo dos segments e breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname
      .split('/')
      .filter(Boolean);

    return pathSegments.map((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const href =
        '/' + pathSegments.slice(0, index + 1).join('/');

      return (
        <BreadcrumbItemComponent
          key={href}
          segment={segment}
          href={href}
          isLast={isLast}
        />
      );
    });
  }, [pathname]); // Só recalcula quando pathname mudar

  // Se não há segments, não renderiza nada
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';
