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
    <div className="p-6 space-y-6 text-xl">
      <h1 className="">Site Settings</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
