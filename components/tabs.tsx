import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

interface TabsTriggerCustomProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsContentCustomProps {
  value: string;
  content: React.ReactNode;
}

const TabsTriggerCustom = ({
  value,
  label,
  icon,
}: TabsTriggerCustomProps) => {
  return (
    <TabsTrigger
      className="flex items-center justify-center rounded-xl py-3 text-base font-medium text-gray-400 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
      value={value}
    >
      {icon && (
        <span className="mr-2 inline-flex">{icon}</span>
      )}
      {label}
    </TabsTrigger>
  );
};

const TabsContentCustom = ({
  content,
  value,
}: TabsContentCustomProps) => {
  return <TabsContent value={value}>{content}</TabsContent>;
};

interface TabsCustomProps {
  tabsTrigger: TabsTriggerCustomProps[];
  tabsContent: TabsContentCustomProps[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  tabsListClassName?: string;
}

export const TabsCustom = ({
  tabsTrigger,
  tabsContent,
  defaultValue,
  value,
  onValueChange,
  className = 'w-full',
  tabsListClassName = 'bg-background grid h-fit w-full grid-cols-2 items-center border p-2',
}: TabsCustomProps) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList className={tabsListClassName}>
        {tabsTrigger.map((trigger) => (
          <TabsTriggerCustom
            key={trigger.value}
            value={trigger.value}
            label={trigger.label}
          />
        ))}
      </TabsList>
      {tabsContent.map((content) => (
        <TabsContentCustom
          key={content.value}
          content={content.content}
          value={content.value}
        />
      ))}
    </Tabs>
  );
};
