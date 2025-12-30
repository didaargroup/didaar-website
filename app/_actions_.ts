"use server";


import { tryCatch } from "@/lib/utils";
import { getDb } from "@/db";
import { updateFullPathTree, updateFullPathForSlugChange } from "@/lib/page";

 export type FormState = {
  errors?: {
    formErrors?: string[]
    fieldErrors?: {
      title?: string[]
      slug?: string[]
      isDraft?: string[]
      showOnMenu?: string[]
      parentId?: string[]
    }
  }
  success?: boolean
  updatedPage?: {
    id: number
    title: string
    slug: string
    isDraft: boolean
    showOnMenu: boolean
    sortOrder: number
    parentId: number | null
  }
}

export const db = getDb();

// Settings actions
export type SettingsFormState = {
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

