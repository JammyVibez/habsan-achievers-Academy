import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AcademicSettingsPanel } from '@/components/admin/academic-settings-panel';
import { GeneralSettingsPanel } from '@/components/admin/general-settings-panel';
import { SystemSettingsPanel } from '@/components/admin/system-settings-panel';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and configurations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsPanel />
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <AcademicSettingsPanel />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <SystemSettingsPanel variant="notifications" />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SystemSettingsPanel variant="security" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
