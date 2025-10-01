'use client';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'; // ajuste para o seu caminho real

export const Breadcrumbs = () => {
  const pathname = usePathname(); // ex: "/times/minhas-equipes"
  const pathSegments = pathname.split('/').filter(Boolean); // ["times", "minhas-equipes"]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href =
            '/' +
            pathSegments.slice(0, index + 1).join('/');

          return (
            <BreadcrumbItem key={href}>
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
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

// Função para transformar "minhas-equipes" em "Minhas Equipes"
function formatSegment(segment: string) {
  return segment
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
