"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Globe } from "lucide-react"
import Link from "next/link"

interface PageTranslationStatus {
  locale: string
  published: boolean
  hasContent: boolean
}

interface TranslationManagerProps {
  pageId: string
  pageSlug: string
  translations: PageTranslationStatus[]
}

const AVAILABLE_LOCALES = [
  { code: "en", name: "English", flag: "EN" },
  { code: "fa", name: "Farsi", flag: "FA" },
]

export function TranslationManager({ pageId, pageSlug, translations }: TranslationManagerProps) {
  const [open, setOpen] = useState(false)

  // Get existing locales
  const existingLocales = new Set(translations.map((t) => t.locale))

  // Get missing locales
  const missingLocales = AVAILABLE_LOCALES.filter((l) => !existingLocales.has(l.code))

  console.log("TranslationManager rendered:", { pageId, pageSlug, translations, existingLocales: Array.from(existingLocales) })

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        title="Manage translations"
        style={{ fontSize: "20px", minWidth: "24px", minHeight: "24px" }}
      >
        <Globe />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="admin-area sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Translations</DialogTitle>
          <DialogDescription>
            Create and manage translations for this page
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing translations */}
          <div>
            <h4 className="text-sm font-medium mb-2">Existing Translations</h4>
            <div className="space-y-2">
              {translations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No translations yet</p>
              ) : (
                translations.map((translation) => {
                  const localeInfo = AVAILABLE_LOCALES.find((l) => l.code === translation.locale)
                  return (
                    <div
                      key={translation.locale}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{localeInfo?.flag}</span>
                        <span className="text-sm">{localeInfo?.name}</span>
                        <Badge
                          variant={translation.published ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {translation.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <Link href={`/admin/pages/${translation.locale}/${pageSlug}/edit`}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Missing translations */}
          {missingLocales.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Create Translation</h4>
              <div className="space-y-2">
                {missingLocales.map((locale) => (
                  <Link
                    key={locale.code}
                    href={`/admin/pages/${locale.code}/${pageSlug}/edit`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border border-dashed bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{locale.flag}</span>
                        <span className="text-sm">{locale.name}</span>
                      </div>
                      <Button variant="primary">Create</Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
