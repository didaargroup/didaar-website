"use client";

import type { ComponentConfig } from "@measured/puck";
import { Image as ImageIcon } from "lucide-react";
import { ImageField } from "@/components/admin/image-field";
import { getTextDirection } from "@/lib/text-direction";
import { RTLTextInput } from "@/components/admin/rtl-text-input";
import type { ImageBlockProps } from "@/types/components";

export const ImageBlock: ComponentConfig<ImageBlockProps> = {
  fields: {
    url: {
      type: "custom",
      label: "Image",
      render: (props) => (
        <ImageField
          value={props.value}
          onChange={props.onChange}
          label="Image"
        />
      ),
    },
    alt: {
      type: "text",
      label: "Alt Text",
    },
    caption: {
      type: "custom",
      label: "Caption (optional)",
      render: ({ name, value, onChange }) => {
        return (
          <RTLTextInput
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder="Enter caption..."
          />
        );
      },
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
  defaultProps: {
    url: "",
    alt: "",
    caption: "",
    width: undefined,
    height: undefined,
  },
  render: ({ url, alt, caption, width, height }) => {
    if (!url) {
      return (
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No image selected</p>
          </div>
        </div>
      );
    }

    // Check if URL is from Cloudinary
    const isCloudinary = url.includes('cloudinary.com');
    
    // Generate responsive srcset for Cloudinary images
    const getResponsiveSrc = (imageUrl: string, imageWidth?: number) => {
      if (!isCloudinary) {
        return { src: imageUrl, srcSet: undefined };
      }

      // If width is specified, use it; otherwise generate responsive sizes
      if (imageWidth) {
        const optimizedUrl = imageUrl.replace(
          /\/upload\//,
          `/upload/c_limit,w_${imageWidth},q_auto,f_auto/`
        );
        return { src: optimizedUrl, srcSet: undefined };
      }

      // Generate responsive srcset for automatic width
      const sizes = [400, 800, 1200, 1600];
      const srcSet = sizes.map(size => {
        const transformedUrl = imageUrl.replace(
          /\/upload\//,
          `/upload/c_limit,w_${size},q_auto,f_auto/`
        );
        return `${transformedUrl} ${size}w`;
      }).join(', ');

      return { src: imageUrl, srcSet };
    };

    const { src, srcSet } = getResponsiveSrc(url, width);
    const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    const captionDir = caption ? getTextDirection(caption) : undefined;

    return (
      <figure className="my-4">
        <img
          src={src}
          alt={alt || "Image"}
          width={width}
          height={height}
          srcSet={srcSet}
          sizes={sizes}
          className="rounded-lg max-w-full h-auto"
          style={{
            width: width ? `${width}px` : undefined,
            height: height ? `${height}px` : undefined,
            objectFit: 'contain',
          }}
          loading="lazy"
        />
        {caption && (
          <figcaption 
            className="text-xs text-center text-muted-foreground mt-2"
            dir={captionDir}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },
};
