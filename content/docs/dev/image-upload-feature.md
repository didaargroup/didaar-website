---
title: Image Upload Feature
description: Complete guide to the image upload feature implementation in the Pucked page builder.
order: 9
category: Development
tags:
  - image-upload
  - cloudinary
  - puck
  - features
  - implementation
lastModified: 2025-12-27
author: Pucked Team
---

# Image Upload Feature

Complete guide to the image upload feature implementation in the Pucked page builder.

## Overview

The image upload feature allows users to upload images directly from the page editor to Cloudinary, providing a seamless content creation experience.

**Key Features:**
- ✅ Drag-and-drop upload interface
- ✅ Image preview with hover-to-remove
- ✅ Manual URL entry option
- ✅ Loading state during upload
- ✅ File validation (type and size)
- ✅ Automatic image optimization
- ✅ Error handling and feedback

## Architecture

### Components

#### 1. Server-Side Upload Handler

**File**: `lib/cloudinary.ts`

**Purpose**: Cloudinary SDK configuration and upload utilities

**Functions**:
- `uploadImageToCloudinary(file)` - Upload with auto-optimization
- `deleteImageFromCloudinary(publicId)` - Delete images
- `getOptimizedImageUrl(publicId, width, height)` - Generate optimized URLs
- `getCloudinaryConfig()` - Get client-side config

**Implementation**:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'pucked',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1920, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}
```

#### 2. API Endpoint

**File**: `app/api/upload/route.ts`

**Purpose**: Handle image upload requests

**Features**:
- Protected by authentication (`requireAuth`)
- File type validation (images only)
- File size validation (max 5MB)
- Returns URL, dimensions, and metadata

**Implementation**:
```typescript
import { requireAuth } from "@/lib/route-guard";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const { user } = await requireAuth();

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'File must be an image' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File size exceeds 5MB' }, { status: 400 });
  }

  try {
    const result = await uploadImageToCloudinary(file);

    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
```

#### 3. Custom Puck Field

**File**: `components/admin/image-field.tsx`

**Purpose**: UI component for image uploads in the editor

**Features**:
- Drag-and-drop upload area
- Image preview with hover-to-remove
- Manual URL entry option
- Loading state during upload
- File validation feedback

**Implementation**:
```tsx
"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function ImageField({ name, value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || "");

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      setManualUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setManualUrl("");
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {!value && !showUrlInput && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-700",
            "hover:border-gray-400 dark:hover:border-gray-600"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            disabled={uploading}
            className="hidden"
            id={`file-${name}`}
          />
          <label htmlFor={`file-${name}`} className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {uploading ? "Uploading..." : "Drop image or click to upload"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </label>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-800"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Manual URL Input */}
      {showUrlInput && (
        <div className="space-y-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          />
          <button
            onClick={() => setShowUrlInput(false)}
            className="text-sm text-blue-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Toggle Buttons */}
      {!value && !showUrlInput && (
        <button
          onClick={() => setShowUrlInput(true)}
          className="text-sm text-blue-500 hover:underline"
        >
          Or enter image URL
        </button>
      )}

      {showUrlInput && !value && (
        <button
          onClick={() => setShowUrlInput(false)}
          className="text-sm text-blue-500 hover:underline"
        >
          Or upload file
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

#### 4. Puck Component

**File**: `components/admin/image-block.tsx`

**Purpose**: Render images in the page builder

**Fields**:
- `url` - Image URL (custom field with upload UI)
- `alt` - Alt text for accessibility
- `width` - Optional width in pixels
- `height` - Optional height in pixels

**Implementation**:
```tsx
import { ImageField } from "./image-field";

export const ImageBlock = {
  type: "image",
  label: "Image",
  fields: {
    url: {
      type: "custom",
      render: ({ name, value, onChange }) => (
        <ImageField
          name={name}
          value={value || ""}
          onChange={onChange}
        />
      ),
    },
    alt: {
      type: "text",
      label: "Alt Text",
    },
    width: {
      type: "number",
      label: "Width (px)",
    },
    height: {
      type: "number",
      label: "Height (px)",
    },
  },
  render: ({ url, alt, width, height }) => (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      className="max-w-full h-auto"
    />
  ),
};
```

#### 5. Puck Configuration

**File**: `puck.config.tsx`

**Changes**:
- Import `ImageBlock` component
- Add to "Content" category
- Register in components object

**Implementation**:
```tsx
import { ImageBlock } from "@/components/blocks/image-block";

export const getConfig = (locale: string) => ({
  categories: {
    content: {
      components: [
        // ... other components
        ImageBlock,
      ],
    },
  },
  // ... rest of config
});
```

## Data Flow

### Upload Flow

```
User selects file
    ↓
ImageField component validates file
    ↓
FormData sent to /api/upload
    ↓
Server validates authentication
    ↓
Server uploads to Cloudinary
    ↓
Cloudinary returns URL and metadata
    ↓
API returns response to client
    ↓
ImageField updates component data
    ↓
ImageBlock renders preview
```

### Response Format

```typescript
{
  url: string;           // Cloudinary URL
  publicId: string;      // Cloudinary public ID
  width: number;         // Image width
  height: number;        // Image height
  format: string;        // Image format (jpg, png, etc.)
}
```

## Configuration

### Environment Variables

Required variables in `.env.local`:

```bash
# Server-side (required for uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Upload preset
CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Upload Preset (Optional)

Create an upload preset in Cloudinary dashboard:

1. Go to Settings → Upload
2. Click "Add upload preset"
3. Configure:
   - **Signing Mode**: Signed (recommended)
   - **Folder**: `pucked`
   - **Transformation**: `f_auto,q_auto,w_1920,c_limit`

## Usage

### In Page Editor

1. **Add Image Block**:
   - Drag "Image" component to page
   - Or click "+" in a zone and select "Image"

2. **Upload Image**:
   - Drop image file on upload area
   - Or click to open file picker
   - Or enter image URL manually

3. **Configure**:
   - Set alt text for accessibility
   - Optionally set width/height
   - See preview in real-time

4. **Save**:
   - Changes are saved with page
   - Image URL stored in page data

## Best Practices

### Accessibility

1. **Always provide alt text** for images
2. **Use descriptive alt text** for screen readers
3. **Decorative images**: Use empty alt text (`alt=""`)

### Performance

1. **Use optimized formats** (WebP, AVIF)
2. **Set appropriate dimensions** (don't use full resolution)
3. **Lazy load images** below the fold
4. **Use responsive images** for different screen sizes

### SEO

1. **Use descriptive file names** before uploading
2. **Add alt text** with relevant keywords
3. **Optimize file size** for faster loading
4. **Use structured data** for images

## Troubleshooting

### Upload Fails

**Possible causes:**
- File size exceeds 5MB limit
- Invalid file type
- Cloudinary credentials incorrect
- Network error

**Solutions:**
- Check file size and type
- Verify environment variables
- Check browser console for errors
- Test Cloudinary connection

### Image Not Displaying

**Possible causes:**
- Invalid URL
- CORS issues
- Network error

**Solutions:**
- Verify URL is correct
- Check browser console for CORS errors
- Test URL in new tab

### Slow Uploads

**Possible causes:**
- Large file size
- Slow network
- Cloudinary processing

**Solutions:**
- Compress image before upload
- Check network speed
- Wait for Cloudinary optimization

## Future Enhancements

Potential improvements:

1. **Multiple images** - Gallery component
2. **Image editing** - Crop, rotate, filters
3. **Bulk upload** - Upload multiple images at once
4. **Image search** - Search Unsplash/Pexels
5. **CDN options** - Support other CDNs
6. **Image optimization** - Automatic compression
7. **Lazy loading** - Built-in lazy load support
8. **Responsive images** - Generate multiple sizes

## Related Documentation

- [Cloudinary Setup](./cloudinary-setup.md) - Cloudinary configuration guide
- [Puck Components Guide](./puck-components.md) - Using Puck components
- [API Reference](./api-reference.md) - Upload API endpoint
