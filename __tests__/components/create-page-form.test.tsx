import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreatePageForm } from '@/app/admin/(dashboard)/pages/create/form'

// Mock the notification context
vi.mock('@/contexts/notification-context', () => ({
  useNotifications: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}))

// Mock the form registry
vi.mock('@/lib/form-actions', () => ({
  useFormRegistry: vi.fn(({ isDirty, isValid, submit }) => {
    // Just call the registration, don't do anything
    return vi.fn()
  }),
}))

// Mock the server action
const mockCreatePageAction = vi.fn((prevState: any, formData: FormData) => {
  const title = formData.get('title')
  const slug = formData.get('slug')

  // Simulate validation errors
  if (!title || typeof title !== 'string' || title.length < 4) {
    return {
      errors: {
        fieldErrors: {
          title: ['Title must be at least 4 characters'],
        },
      },
    }
  }

  if (!slug || typeof slug !== 'string' || slug.length < 4) {
    return {
      errors: {
        fieldErrors: {
          slug: ['Slug must be at least 4 characters'],
        },
      },
    }
  }

  // Simulate successful creation
  return {
    success: 'Page created successfully',
  }
})

vi.mock('@/app/actions', () => ({
  createPageAction: mockCreatePageAction,
}))

describe('CreatePageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the form with all required fields', () => {
      render(<CreatePageForm />)

      // Check for title field
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('An Awesome Page')).toBeInTheDocument()

      // Check for slug field
      expect(screen.getByLabelText(/slug/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('an-awesome-page')).toBeInTheDocument()

      // Check for checkboxes
      expect(screen.getByLabelText(/save as draft/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/show on menu/i)).toBeInTheDocument()

      // Check for buttons
      expect(screen.getByRole('button', { name: /create page/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    })

    it('renders field descriptions and hints', () => {
      render(<CreatePageForm />)

      expect(screen.getByText(/enter a descriptive title for your page/i)).toBeInTheDocument()
      expect(screen.getByText(/url-friendly version of the title/i)).toBeInTheDocument()
      expect(screen.getByText(/page will not be visible to visitors/i)).toBeInTheDocument()
      expect(screen.getByText(/include this page in the site navigation/i)).toBeInTheDocument()
    })

    it('has draft checkbox checked by default', () => {
      render(<CreatePageForm />)

      const draftCheckbox = screen.getByLabelText(/save as draft/i)
      expect(draftCheckbox).toBeChecked()
    })

    it('has show on menu checkbox checked by default', () => {
      render(<CreatePageForm />)

      const menuCheckbox = screen.getByLabelText(/show on menu/i)
      expect(menuCheckbox).toBeChecked()
    })
  })

  describe('User Interactions', () => {
    it('auto-generates slug from title when user types', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      // Type a title
      await user.type(titleInput, 'My Awesome Page')

      // Slug should be auto-generated
      await waitFor(() => {
        expect(slugInput).toHaveValue('my-awesome-page')
      })
    })

    it('does not update slug if user has manually edited it', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      // First, let slug auto-generate
      await user.type(titleInput, 'Initial Title')
      await waitFor(() => {
        expect(slugInput).toHaveValue('initial-title')
      })

      // Manually edit the slug
      await user.clear(slugInput)
      await user.type(slugInput, 'custom-slug')

      // Now change the title again
      await user.type(titleInput, 'New Title')

      // Slug should remain as custom-slug
      expect(slugInput).toHaveValue('custom-slug')
    })

    it('allows user to toggle draft checkbox', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const draftCheckbox = screen.getByLabelText(/save as draft/i)
      
      // Should be checked by default
      expect(draftCheckbox).toBeChecked()

      // Uncheck it
      await user.click(draftCheckbox)
      expect(draftCheckbox).not.toBeChecked()

      // Check it again
      await user.click(draftCheckbox)
      expect(draftCheckbox).toBeChecked()
    })

    it('allows user to toggle show on menu checkbox', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const menuCheckbox = screen.getByLabelText(/show on menu/i)
      
      // Should be checked by default
      expect(menuCheckbox).toBeChecked()

      // Uncheck it
      await user.click(menuCheckbox)
      expect(menuCheckbox).not.toBeChecked()

      // Check it again
      await user.click(menuCheckbox)
      expect(menuCheckbox).toBeChecked()
    })

    it('resets form when reset button is clicked', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)
      const resetButton = screen.getByRole('button', { name: /reset/i })

      // Fill in the form
      await user.type(titleInput, 'Test Page')
      await user.type(slugInput, 'test-page')

      // Click reset
      await user.click(resetButton)

      // Form should be cleared
      await waitFor(() => {
        expect(titleInput).toHaveValue('')
        expect(slugInput).toHaveValue('')
      })
    })

    it('disables submit button when form is not dirty', () => {
      render(<CreatePageForm />)

      const submitButton = screen.getByRole('button', { name: /create page/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when form is dirty', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /create page/i })

      // Initially disabled
      expect(submitButton).toBeDisabled()

      // Type in title
      await user.type(titleInput, 'Test')

      // Should be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Form Validation', () => {
    it('shows validation error for short title', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /create page/i })

      // Enter a short title
      await user.type(titleInput, 'abc')
      
      // Submit form
      await user.click(submitButton)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/title must be at least 4 characters/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for short slug', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)
      const submitButton = screen.getByRole('button', { name: /create page/i })

      // Enter valid title but short slug
      await user.type(titleInput, 'Valid Title')
      await user.clear(slugInput)
      await user.type(slugInput, 'abc')

      // Submit form
      await user.click(submitButton)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/slug must be at least 4 characters/i)).toBeInTheDocument()
      })
    })

    it('applies error styling to invalid fields', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /create page/i })

      // Enter a short title
      await user.type(titleInput, 'abc')
      
      // Submit form
      await user.click(submitButton)

      // Should have error class
      await waitFor(() => {
        expect(titleInput).toHaveClass('border-destructive')
      })
    })
  })

  describe('Slug Generation', () => {
    it('converts spaces to hyphens', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      await user.type(titleInput, 'My Test Page')

      await waitFor(() => {
        expect(slugInput).toHaveValue('my-test-page')
      })
    })

    it('removes special characters', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      await user.type(titleInput, 'My Test @#$ Page!')

      await waitFor(() => {
        expect(slugInput).toHaveValue('my-test-page')
      })
    })

    it('converts to lowercase', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      await user.type(titleInput, 'MY UPPERCASE PAGE')

      await waitFor(() => {
        expect(slugInput).toHaveValue('my-uppercase-page')
      })
    })

    it('removes consecutive hyphens', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      await user.type(titleInput, 'My   Test    Page')

      await waitFor(() => {
        expect(slugInput).toHaveValue('my-test-page')
      })
    })

    it('trims hyphens from start and end', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      await user.type(titleInput, '---Test---')

      await waitFor(() => {
        expect(slugInput).toHaveValue('test')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper aria labels for screen readers', () => {
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)

      expect(titleInput).toHaveAttribute('id', 'title')
      expect(slugInput).toHaveAttribute('id', 'slug')
    })

    it('associates error messages with inputs using aria-describedby', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const submitButton = screen.getByRole('button', { name: /create page/i })

      // Trigger validation error
      await user.type(titleInput, 'abc')
      await user.click(submitButton)

      await waitFor(() => {
        expect(titleInput).toHaveAttribute('aria-describedby', 'title-error')
        expect(titleInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('has hint text associated with inputs', () => {
      render(<CreatePageForm />)

      const slugInput = screen.getByLabelText(/slug/i)
      expect(slugInput).toHaveAttribute('aria-describedby', 'slug-hint')
    })
  })

  describe('Form Submission', () => {
    it('submits form with correct data', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const slugInput = screen.getByLabelText(/slug/i)
      const submitButton = screen.getByRole('button', { name: /create page/i })

      await user.type(titleInput, 'My Test Page')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePageAction).toHaveBeenCalled()
      })
    })

    it('includes checkbox values in submission', async () => {
      const user = userEvent.setup()
      render(<CreatePageForm />)

      const titleInput = screen.getByLabelText(/title/i)
      const draftCheckbox = screen.getByLabelText(/save as draft/i)
      const menuCheckbox = screen.getByLabelText(/show on menu/i)
      const submitButton = screen.getByRole('button', { name: /create page/i })

      // Uncheck draft, keep menu checked
      await user.click(draftCheckbox)
      
      await user.type(titleInput, 'Test Page')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePageAction).toHaveBeenCalled()
        const callArgs = mockCreatePageAction.mock.calls[0][1] as FormData
        expect(callArgs.get('isDraft')).toBeNull()
        expect(callArgs.get('showOnMenu')).toBe('on')
      })
    })
  })
})
