import { requireAuth } from "@/lib/route-guard";
import { SettingsForm } from "./form";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Site Settings - Admin Dashboard",
  description: "Manage your site configuration and branding",
};

export default async function SettingsPage() {
  await requireAuth();
  const settings = await getSiteSettings();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your site configuration and branding</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
