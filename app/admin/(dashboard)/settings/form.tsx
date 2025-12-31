"use client";

import { updateSiteSettingsAction } from "@/app/_actions"
import { useActionState, useEffect, useState, useCallback, useRef } from "react";
import type { SiteSettings } from "@/types/site-settings";
import { Plus, Trash2, Globe, Link2 } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";
import { useFormRegistry } from "@/lib/form-actions";
import { cn } from "@/lib/utils";
import { FormSection, HeadingSection } from "@/components/admin/form-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type FormState = {
  errors?: {
    siteNameEn?: string[];
    siteNameFa?: string[];
    logoUrl?: string[];
    twitter?: string[];
    facebook?: string[];
    instagram?: string[];
    linkedin?: string[];
    youtube?: string[];
    quickLinksEn?: string[];
    quickLinksFa?: string[];
    _form?: string[];
  };
  success?: boolean;
};

const initialState: FormState = {
  success: false,
};

interface QuickLink {
  label: string;
  url: string;
}

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, initialState);
  const { showSuccess, showError } = useNotifications();
  const formRef = useRef<HTMLFormElement>(null);

  // Quick links state
  const [quickLinksEn, setQuickLinksEn] = useState<QuickLink[]>(
    initialSettings.footerQuickLinks?.en || []
  );
  const [quickLinksFa, setQuickLinksFa] = useState<QuickLink[]>(
    initialSettings.footerQuickLinks?.fa || []
  );

  // Track dirty state
  const [isDirty, setIsDirty] = useState(false);

  // Register form with admin layout context
  useFormRegistry({
    formId: "settings-form",
    isDirty,
    isValid: !state.errors || Object.keys(state.errors).length === 0,
    errors: state.errors || {},
    submit: async () => formRef.current?.requestSubmit(),
  });

  // Show success/error notifications
  useEffect(() => {
    if (state.success) {
      showSuccess("Settings updated successfully!");
      setIsDirty(false);
      // Reload after a short delay to show updated data
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (state.errors?._form) {
      showError(state.errors._form[0]);
    }
  }, [state.success, state.errors, showSuccess, showError]);

  // Quick link handlers
  const addQuickLink = useCallback((locale: "en" | "fa") => {
    setIsDirty(true);
    if (locale === "en") {
      setQuickLinksEn((prev) => [...prev, { label: "", url: "" }]);
    } else {
      setQuickLinksFa((prev) => [...prev, { label: "", url: "" }]);
    }
  }, []);

  const removeQuickLink = useCallback((locale: "en" | "fa", index: number) => {
    setIsDirty(true);
    if (locale === "en") {
      setQuickLinksEn((prev) => prev.filter((_, i) => i !== index));
    } else {
      setQuickLinksFa((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleRemoveQuickLink = useCallback(
    (e: React.MouseEvent, locale: "en" | "fa", index: number) => {
      e.preventDefault();
      e.stopPropagation();
      removeQuickLink(locale, index);
    },
    [removeQuickLink]
  );

  const updateQuickLink = useCallback(
    (locale: "en" | "fa", index: number, field: "label" | "url", value: string) => {
      setIsDirty(true);
      if (locale === "en") {
        setQuickLinksEn((prev) =>
          prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
        );
      } else {
        setQuickLinksFa((prev) =>
          prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
        );
      }
    },
    []
  );

  const handleSubmit = (formData: FormData) => {
    // Add quick links as JSON strings
    formData.append("quickLinksEn", JSON.stringify(quickLinksEn));
    formData.append("quickLinksFa", JSON.stringify(quickLinksFa));
    // The formAction returned by useActionState expects FormData directly
    return formAction(formData);
  };

  return (
    <form
      action={handleSubmit}
      ref={formRef}
      id="settings-form"
      className="admin-area @container space-y-6 mb-20"
      onChange={() => setIsDirty(true)}
    >
        {/* General Settings Section */}
        <FormSection
          heading={
            <HeadingSection
              title="General Settings"
              description="Configure your site's basic information"
            />
          }
        >
          <div className="space-y-5">
            {/* Site Name (English) */}
            <div className="space-y-2">
              <Label htmlFor="siteNameEn" className="text-sm font-medium">
                <Globe className="w-4 h-4" />
                Site Name (English)
              </Label>
              <Input
                id="siteNameEn"
                name="siteNameEn"
                type="text"
                defaultValue={initialSettings.siteName.en}
                placeholder="Enter site name in English"
                required
                className={cn(
                  state.errors && "siteNameEn" in state.errors && "border-destructive"
                )}
                aria-invalid={!!state.errors && "siteNameEn" in state.errors}
                aria-describedby={
                  state.errors && "siteNameEn" in state.errors ? "siteNameEn-error" : undefined
                }
              />
              {state.errors && "siteNameEn" in state.errors && Array.isArray(state.errors.siteNameEn) && state.errors.siteNameEn.length > 0 && (
                <p id="siteNameEn-error" className="text-xs text-destructive">
                  {state.errors.siteNameEn[0]}
                </p>
              )}
            </div>

            {/* Site Name (Farsi) */}
            <div className="space-y-2">
              <Label htmlFor="siteNameFa" className="text-sm font-medium">
                <Globe className="w-4 h-4" />
                نام سایت (فارسی)
              </Label>
              <Input
                id="siteNameFa"
                name="siteNameFa"
                type="text"
                defaultValue={initialSettings.siteName.fa}
                placeholder="نام سایت را به فارسی وارد کنید"
                required
                dir="rtl"
                className={cn(
                  state.errors && "siteNameFa" in state.errors && "border-destructive"
                )}
                aria-invalid={!!state.errors && "siteNameFa" in state.errors}
                aria-describedby={
                  state.errors && "siteNameFa" in state.errors ? "siteNameFa-error" : undefined
                }
              />
              {state.errors && "siteNameFa" in state.errors && Array.isArray(state.errors.siteNameFa) && state.errors.siteNameFa.length > 0 && (
                <p id="siteNameFa-error" className="text-xs text-destructive">
                  {state.errors.siteNameFa[0]}
                </p>
              )}
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-sm font-medium">
                Logo URL
              </Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                type="text"
                defaultValue={initialSettings.logoUrl || ""}
                placeholder="https://example.com/logo.png"
                className={cn(
                  state.errors && "logoUrl" in state.errors && "border-destructive"
                )}
                aria-invalid={!!state.errors && "logoUrl" in state.errors}
                aria-describedby={
                  state.errors && "logoUrl" in state.errors ? "logoUrl-error" : undefined
                }
              />
              {state.errors && "logoUrl" in state.errors && Array.isArray(state.errors.logoUrl) && state.errors.logoUrl.length > 0 && (
                <p id="logoUrl-error" className="text-xs text-destructive">
                  {state.errors.logoUrl[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                URL to your site logo image (PNG, JPG, SVG recommended)
              </p>
            </div>
          </div>
        </FormSection>

        {/* Social Links Section */}
        <FormSection
          heading={
            <HeadingSection
              title="Social Links"
              description="Connect your social media accounts"
            />
          }
        >
          <div className="space-y-5">
            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm font-medium">
                Twitter URL
              </Label>
              <Input
                id="twitter"
                name="twitter"
                type="text"
                defaultValue={initialSettings.socialLinks.twitter || ""}
                placeholder="https://twitter.com/username"
                className={cn(
                  state.errors && "twitter" in state.errors && "border-destructive"
                )}
              />
              {state.errors && "twitter" in state.errors && Array.isArray(state.errors.twitter) && state.errors.twitter.length > 0 && (
                <p className="text-xs text-destructive">{state.errors.twitter[0]}</p>
              )}
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-sm font-medium">
                Facebook URL
              </Label>
              <Input
                id="facebook"
                name="facebook"
                type="text"
                defaultValue={initialSettings.socialLinks.facebook || ""}
                placeholder="https://facebook.com/page"
                className={cn(
                  state.errors && "facebook" in state.errors && "border-destructive"
                )}
              />
              {state.errors && "facebook" in state.errors && Array.isArray(state.errors.facebook) && state.errors.facebook.length > 0 && (
                <p className="text-xs text-destructive">{state.errors.facebook[0]}</p>
              )}
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm font-medium">
                Instagram URL
              </Label>
              <Input
                id="instagram"
                name="instagram"
                type="text"
                defaultValue={initialSettings.socialLinks.instagram || ""}
                placeholder="https://instagram.com/username"
                className={cn(
                  state.errors && "instagram" in state.errors && "border-destructive"
                )}
              />
              {state.errors && "instagram" in state.errors && Array.isArray(state.errors.instagram) && state.errors.instagram.length > 0 && (
                <p className="text-xs text-destructive">{state.errors.instagram[0]}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="text"
                defaultValue={initialSettings.socialLinks.linkedin || ""}
                placeholder="https://linkedin.com/company"
                className={cn(
                  state.errors && "linkedin" in state.errors && "border-destructive"
                )}
              />
              {state.errors && "linkedin" in state.errors && Array.isArray(state.errors.linkedin) && state.errors.linkedin.length > 0 && (
                <p className="text-xs text-destructive">{state.errors.linkedin[0]}</p>
              )}
            </div>

            {/* YouTube */}
            <div className="space-y-2">
              <Label htmlFor="youtube" className="text-sm font-medium">
                YouTube URL
              </Label>
              <Input
                id="youtube"
                name="youtube"
                type="text"
                defaultValue={initialSettings.socialLinks.youtube || ""}
                placeholder="https://youtube.com/channel"
                className={cn(
                  state.errors && "youtube" in state.errors && "border-destructive"
                )}
              />
              {state.errors && "youtube" in state.errors && Array.isArray(state.errors.youtube) && state.errors.youtube.length > 0 && (
                <p className="text-xs text-destructive">{state.errors.youtube[0]}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* Footer Quick Links Section */}
        <FormSection
          heading={
            <HeadingSection
              title="Footer Quick Links"
              description="Manage links displayed in the site footer"
            />
          }
        >
          <div className="space-y-6">
            {/* English Quick Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Quick Links (English)</Label>
                <Button type="button" variant="secondary" onClick={() => addQuickLink("en")}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Link
                </Button>
              </div>

              {quickLinksEn.map((link, index) => (
                <div key={`en-${index}`} className="grid  gap-2 items-center" style={{gridTemplateColumns: "1fr 2fr auto"}}>
                  <Input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateQuickLink("en", index, "label", e.target.value)}
                    placeholder="Link label"
                  />
                  <Input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateQuickLink("en", index, "url", e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={(e) => handleRemoveQuickLink(e, "en", index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {quickLinksEn.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No quick links added yet. Click "Add Link" to create one.
                </p>
              )}
            </div>

            {/* Farsi Quick Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">لینک‌های سریع (فارسی)</Label>
                <Button type="button" variant="secondary" onClick={() => addQuickLink("fa")}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  افزودن لینک
                </Button>
              </div>

              {quickLinksFa.map((link, index) => (
                <div key={`fa-${index}`} className="grid  gap-2 items-center" style={{gridTemplateColumns: "1fr 2fr auto"}}>
                  <Input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateQuickLink("fa", index, "label", e.target.value)}
                    placeholder="برچسب لینک"
                    dir="rtl"
                  />
                  <Input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateQuickLink("fa", index, "url", e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => handleRemoveQuickLink(e, "fa", index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {quickLinksFa.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  هنوز لینکی اضافه نشده. روی «افزودن لینک» کلیک کنید.
                </p>
              )}
            </div>

            {/* Quick Links Error Display */}
            {state.errors && "quickLinksEn" in state.errors && Array.isArray(state.errors.quickLinksEn) && state.errors.quickLinksEn.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.quickLinksEn[0]}</p>
            )}
            {state.errors && "quickLinksFa" in state.errors && Array.isArray(state.errors.quickLinksFa) && state.errors.quickLinksFa.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.quickLinksFa[0]}</p>
            )}
          </div>
        </FormSection>
    </form>
  );
}
