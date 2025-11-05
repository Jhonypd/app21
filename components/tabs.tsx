import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

interface TabsTriggerCustomProps {
  value: string;
  label: string;
}

interface TabsContentCustomProps {
  value: string;
  content: React.ReactNode;
}

const TabsTriggerCustom = ({
  value,
  label,
}: TabsTriggerCustomProps) => {
  return (
    <TabsTrigger
      className="data-[state=active]:bg-primary"
      value={value}
    >
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
}

export const TabsCustom = ({
  tabsTrigger,
  tabsContent,
  defaultValue,
}: TabsCustomProps) => {
  return (
    <Tabs
      defaultValue={defaultValue}
      className="w-full"
    >
      <TabsList className="bg-background grid h-fit w-full grid-cols-2 items-center border p-2">
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
