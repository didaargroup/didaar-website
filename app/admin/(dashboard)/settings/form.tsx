"use client"

import { updateSiteSettingsAction } from "@/app/_actions"
import { Button } from "@measured/puck"
import { useActionState, useEffect, useState, useCallback } from "react"
import type { SiteSettings } from "@/lib/site-settings"
import { Plus, Trash2 } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

type FormState = {
  errors?: {
    siteNameEn?: string[]
    siteNameFa?: string[]
    logoUrl?: string[]
    twitter?: string[]
    facebook?: string[]
    instagram?: string[]
    linkedin?: string[]
    youtube?: string[]
    quickLinksEn?: string[]
    quickLinksFa?: string[]
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {
  success: false
}

interface QuickLink {
  label: string
  url: string
}

interface SettingsFormProps {
  initialSettings: SiteSettings
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, initialState)
  const { showSuccess, showError } = useNotifications()
  
  // Quick links state
  const [quickLinksEn, setQuickLinksEn] = useState<QuickLink[]>(
    initialSettings.footerQuickLinks?.en || []
  )
  const [quickLinksFa, setQuickLinksFa] = useState<QuickLink[]>(
    initialSettings.footerQuickLinks?.fa || []
  )

  // Show success/error notifications
  useEffect(() => {
    if (state.success) {
      showSuccess("Settings updated successfully!")
      // Reload after a short delay to show updated data
      const timer = setTimeout(() => {
        window.location.reload()
      }, 2000)
      return () => clearTimeout(timer)
    }
    
    if (state.errors?._form) {
      showError(state.errors._form[0])
    }
  }, [state.success, state.errors, showSuccess, showError])

  // Quick link handlers
  const addQuickLink = useCallback((locale: 'en' | 'fa') => {
    if (locale === 'en') {
      setQuickLinksEn(prev => [...prev, { label: '', url: '' }])
    } else {
      setQuickLinksFa(prev => [...prev, { label: '', url: '' }])
    }
  }, [])

  const removeQuickLink = useCallback((locale: 'en' | 'fa', index: number) => {
    if (locale === 'en') {
      setQuickLinksEn(prev => prev.filter((_, i) => i !== index))
    } else {
      setQuickLinksFa(prev => prev.filter((_, i) => i !== index))
    }
  }, [])

  const handleRemoveQuickLink = useCallback((e: React.MouseEvent, locale: 'en' | 'fa', index: number) => {
    e.preventDefault()
    e.stopPropagation()
    removeQuickLink(locale, index)
  }, [removeQuickLink])

  const updateQuickLink = useCallback((locale: 'en' | 'fa', index: number, field: 'label' | 'url', value: string) => {
    if (locale === 'en') {
      setQuickLinksEn(prev => prev.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ))
    } else {
      setQuickLinksFa(prev => prev.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ))
    }
  }, [])

  const handleSubmit = (formData: FormData) => {
    // Add quick links as JSON strings
    formData.append('quickLinksEn', JSON.stringify(quickLinksEn))
    formData.append('quickLinksFa', JSON.stringify(quickLinksFa))
    // The formAction returned by useActionState expects FormData directly
    return formAction(formData)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault()
      const form = (e.target as HTMLElement).closest('form')
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div style={{ maxWidth: "800px", paddingBottom: "80px" }}>
      <form action={handleSubmit} onKeyDown={handleKeyDown}>
        {/* General Settings Card */}
        <div
          style={{
            background: "var(--puck-color-white)",
            border: "1px solid var(--puck-color-grey-09)",
            borderRadius: "8px",
            marginBottom: "24px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--puck-color-grey-09)",
              background: "var(--puck-color-grey-12)"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--puck-color-black)" }}>
              General Settings
            </h3>
          </div>
          
          <div style={{ padding: "20px" }} className="space-y-4">
            {/* Site Name (English) */}
            <div>
              <label
                htmlFor="siteNameEn"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                Site Name (English) *
              </label>
              <input
                id="siteNameEn"
                name="siteNameEn"
                type="text"
                defaultValue={initialSettings.siteName.en}
                placeholder="Enter site name in English"
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: state.errors && 'siteNameEn' in state.errors
                    ? "1px solid var(--puck-color-red-06)"
                    : "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
              {state.errors && 'siteNameEn' in state.errors && Array.isArray(state.errors.siteNameEn) && state.errors.siteNameEn.length > 0 && (
                <p style={{ color: "var(--puck-color-red-06)", fontSize: "var(--puck-font-size-xxs)", marginTop: "4px" }}>
                  {state.errors.siteNameEn[0]}
                </p>
              )}
            </div>

            {/* Site Name (Farsi) */}
            <div>
              <label
                htmlFor="siteNameFa"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                Site Name (Farsi) *
              </label>
              <input
                id="siteNameFa"
                name="siteNameFa"
                type="text"
                defaultValue={initialSettings.siteName.fa}
                placeholder="نام سایت را به فارسی وارد کنید"
                required
                dir="rtl"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: state.errors && 'siteNameFa' in state.errors
                    ? "1px solid var(--puck-color-red-06)"
                    : "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
              {state.errors && 'siteNameFa' in state.errors && Array.isArray(state.errors.siteNameFa) && state.errors.siteNameFa.length > 0 && (
                <p style={{ color: "var(--puck-color-red-06)", fontSize: "var(--puck-font-size-xxs)", marginTop: "4px" }}>
                  {state.errors.siteNameFa[0]}
                </p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label
                htmlFor="logoUrl"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                Logo URL
              </label>
              <input
                id="logoUrl"
                name="logoUrl"
                type="text"
                defaultValue={initialSettings.logoUrl || ""}
                placeholder="https://example.com/logo.png"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
              {state.errors && 'logoUrl' in state.errors && Array.isArray(state.errors.logoUrl) && state.errors.logoUrl.length > 0 && (
                <p style={{ color: "var(--puck-color-red-06)", fontSize: "var(--puck-font-size-xxs)", marginTop: "4px" }}>
                  {state.errors.logoUrl[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Social Links Card */}
        <div
          style={{
            background: "var(--puck-color-white)",
            border: "1px solid var(--puck-color-grey-09)",
            borderRadius: "8px",
            marginBottom: "24px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--puck-color-grey-09)",
              background: "var(--puck-color-grey-12)"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--puck-color-black)" }}>
              Social Links
            </h3>
          </div>
          
          <div style={{ padding: "20px" }} className="space-y-4">
            {/* Twitter */}
            <div>
              <label
                htmlFor="twitter"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                Twitter URL
              </label>
              <input
                id="twitter"
                name="twitter"
                type="text"
                defaultValue={initialSettings.socialLinks.twitter || ""}
                placeholder="https://twitter.com/username"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
            </div>

            {/* Facebook */}
            <div>
              <label
                htmlFor="facebook"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                Facebook URL
              </label>
              <input
                id="facebook"
                name="facebook"
                type="text"
                defaultValue={initialSettings.socialLinks.facebook || ""}
                placeholder="https://facebook.com/page"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
            </div>

            {/* Instagram */}
            <div>
              <label
                htmlFor="instagram"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                Instagram URL
              </label>
              <input
                id="instagram"
                name="instagram"
                type="text"
                defaultValue={initialSettings.socialLinks.instagram || ""}
                placeholder="https://instagram.com/username"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label
                htmlFor="linkedin"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                LinkedIn URL
              </label>
              <input
                id="linkedin"
                name="linkedin"
                type="text"
                defaultValue={initialSettings.socialLinks.linkedin || ""}
                placeholder="https://linkedin.com/company"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
            </div>

            {/* YouTube */}
            <div>
              <label
                htmlFor="youtube"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "var(--puck-font-size-xs)",
                  fontWeight: 500,
                  color: "var(--puck-color-black)"
                }}
              >
                YouTube URL
              </label>
              <input
                id="youtube"
                name="youtube"
                type="text"
                defaultValue={initialSettings.socialLinks.youtube || ""}
                placeholder="https://youtube.com/channel"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid var(--puck-color-grey-09)",
                  fontSize: "var(--puck-font-size-xs)",
                  background: "var(--puck-color-white)",
                  color: "var(--puck-color-black)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div
          style={{
            background: "var(--puck-color-white)",
            border: "1px solid var(--puck-color-grey-09)",
            borderRadius: "8px",
            marginBottom: "24px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--puck-color-grey-09)",
              background: "var(--puck-color-grey-12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--puck-color-black)" }}>
              Footer Quick Links
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--puck-color-grey-06)" }}>
              Links shown in the footer
            </p>
          </div>
          
          <div style={{ padding: "20px" }}>
            {/* English Quick Links */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "var(--puck-font-size-xs)",
                    fontWeight: 600,
                    color: "var(--puck-color-black)"
                  }}
                >
                  Quick Links (English)
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addQuickLink('en')}
                >
                  <Plus style={{ width: "14px", height: "14px", marginRight: "4px" }} />
                  Add Link
                </Button>
              </div>
              
              {quickLinksEn.map((link, index) => (
                <div
                  key={`en-${index}`}
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "flex-start"
                  }}
                >
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateQuickLink('en', index, 'label', e.target.value)}
                    placeholder="Link label"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "1px solid var(--puck-color-grey-09)",
                      fontSize: "var(--puck-font-size-xs)",
                      background: "var(--puck-color-white)",
                      color: "var(--puck-color-black)",
                    }}
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateQuickLink('en', index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    style={{
                      flex: 2,
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "1px solid var(--puck-color-grey-09)",
                      fontSize: "var(--puck-font-size-xs)",
                      background: "var(--puck-color-white)",
                      color: "var(--puck-color-black)",
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => handleRemoveQuickLink(e, 'en', index)}
                  >
                    <Trash2 style={{ width: "16px", height: "16px"}} />
                  </Button>
                </div>
              ))}
              
              {quickLinksEn.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--puck-color-grey-06)", fontStyle: "italic" }}>
                  No quick links added yet. Click "Add Link" to create one.
                </p>
              )}
            </div>

            {/* Farsi Quick Links */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "var(--puck-font-size-xs)",
                    fontWeight: 600,
                    color: "var(--puck-color-black)"
                  }}
                >
                  لینک‌های سریع (فارسی)
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addQuickLink('fa')}
                >
                  <Plus style={{ width: "14px", height: "14px", marginRight: "4px" }} />
                  افزودن لینک
                </Button>
              </div>
              
              {quickLinksFa.map((link, index) => (
                <div
                  key={`fa-${index}`}
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "flex-start"
                  }}
                >
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateQuickLink('fa', index, 'label', e.target.value)}
                    placeholder="برچسب لینک"
                    dir="rtl"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "1px solid var(--puck-color-grey-09)",
                      fontSize: "var(--puck-font-size-xs)",
                      background: "var(--puck-color-white)",
                      color: "var(--puck-color-black)",
                    }}
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateQuickLink('fa', index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    style={{
                      flex: 2,
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "1px solid var(--puck-color-grey-09)",
                      fontSize: "var(--puck-font-size-xs)",
                      background: "var(--puck-color-white)",
                      color: "var(--puck-color-black)",
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => handleRemoveQuickLink(e, 'fa', index)}
                  >
                    <Trash2 style={{ width: "16px", height: "16px"}} />
                  </Button>
                </div>
              ))}
              
              {quickLinksFa.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--puck-color-grey-06)", fontStyle: "italic" }}>
                  هنوز لینکی اضافه نشده. روی «افزودن لینک» کلیک کنید.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
