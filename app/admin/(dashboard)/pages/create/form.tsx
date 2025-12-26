"use client"

import { createPageAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useActionState } from "react"

type FormState = {
  errors?: {
    title?: string[]
    slug?: string[]
    isDraft?: string[]
    parentId?: string[]
    _form?: string[]
  }
  success?: boolean
}

const initialState = {
  errors: {},
}

export function CreatePageForm() {
  const [state, formAction] = useActionState(createPageAction, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Page</CardTitle>
        <CardDescription>Fill in the details to create a new page</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter page title"
              required
              className={state.errors && 'title' in state.errors ? "border-destructive focus:ring-destructive" : ""}
            />
            {state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated from title"
              className={state.errors && 'slug' in state.errors ? "border-destructive focus:ring-destructive" : ""}
            />
            {state.errors && 'slug' in state.errors && Array.isArray(state.errors.slug) && state.errors.slug.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.slug[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isDraft"
              name="isDraft"
              defaultChecked={true}
            />
            <Label htmlFor="isDraft" className="cursor-pointer">
              Save as draft
            </Label>
          </div>

          {state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Page
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}