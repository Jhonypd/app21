import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description?: string;
}

const TitlePage = ({ icon, title }: Props) => {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="flex items-center gap-4 text-2xl font-bold text-gray-400 uppercase">
        {icon} {title}
      </h3>
    </div>
  );
};

export default TitlePage;
