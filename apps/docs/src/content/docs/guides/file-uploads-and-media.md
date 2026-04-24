---
title: File Uploads and Media
description: File uploaders, images, video, carousels, embeds, and rich text.
draft: false
---

```tsx
import { useState } from "react";
import { FileUploaderBase, SnapshotImageBase, CardBase } from "@lastshotlabs/snapshot/ui";
import type { UploadFileEntry } from "@lastshotlabs/snapshot/ui";

function AvatarUploader() {
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <CardBase title="Upload Avatar">
      {preview && (
        <SnapshotImageBase src={preview} alt="Preview" width={200} height={200} placeholder="skeleton" />
      )}
      <FileUploaderBase
        variant="dropzone"
        label="Drop an image here, or click to browse"
        accept="image/*"
        maxFiles={1}
        maxSize={5 * 1024 * 1024}
        files={files}
        onFilesAdded={(newFiles) => {
          const file = newFiles[0];
          if (file) {
            setPreview(URL.createObjectURL(file));
            setFiles([{ file, id: crypto.randomUUID(), status: "pending", progress: 0 }]);
          }
        }}
        onFileRemoved={(id) => {
          setFiles((prev) => prev.filter((f) => f.id !== id));
          setPreview(null);
        }}
      />
    </CardBase>
  );
}
```

## FileUploaderBase

Drag-and-drop file uploader with three visual variants: `dropzone`, `button`, and `compact`.

### Dropzone

Full drop area with label and description:

```tsx
<FileUploaderBase
  variant="dropzone"
  label="Drop files here"
  description="PNG, JPG, or PDF up to 10 MB"
  accept="image/*,.pdf"
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
  onFilesAdded={(files) => uploadFiles(files)}
/>
```

### Button

Single-line upload trigger:

```tsx
<FileUploaderBase
  variant="button"
  label="Upload document"
  accept=".pdf,.doc,.docx"
  maxFiles={1}
  onFilesAdded={(files) => uploadFile(files[0])}
/>
```

### Compact

Minimal inline variant:

```tsx
<FileUploaderBase
  variant="compact"
  accept="image/*"
  maxFiles={10}
  onFilesAdded={(files) => uploadFiles(files)}
/>
```

### Tracking upload state

Use controlled `files` with `UploadFileEntry` objects to show progress, completion, and errors:

```tsx
import type { UploadFileEntry } from "@lastshotlabs/snapshot/ui";

function DocumentUploader() {
  const [files, setFiles] = useState<UploadFileEntry[]>([]);

  async function handleUpload(newFiles: File[]) {
    const entries: UploadFileEntry[] = newFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      status: "uploading" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...entries]);

    for (const entry of entries) {
      try {
        await uploadToServer(entry.file);
        setFiles((prev) =>
          prev.map((f) => f.id === entry.id ? { ...f, status: "completed", progress: 100 } : f)
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) => f.id === entry.id ? { ...f, status: "error", errorMessage: "Upload failed" } : f)
        );
      }
    }
  }

  return (
    <FileUploaderBase
      variant="dropzone"
      label="Upload documents"
      accept=".pdf,.doc,.docx"
      maxFiles={10}
      maxSize={20 * 1024 * 1024}
      files={files}
      onFilesAdded={handleUpload}
      onFileRemoved={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
    />
  );
}
```

Each `UploadFileEntry` has:

| Field | Type | Description |
|-------|------|-------------|
| `file` | `File` | The native File object |
| `id` | `string` | Unique identifier |
| `status` | `"pending" \| "uploading" \| "completed" \| "error"` | Upload state |
| `progress` | `number` | Progress percentage (0-100) |
| `errorMessage` | `string?` | Error text if status is `"error"` |

### Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"dropzone" \| "button" \| "compact"` | `"dropzone"` | Visual variant |
| `label` | `string` | — | Label text |
| `description` | `string` | — | Description below label |
| `accept` | `string` | — | Accepted file types |
| `maxFiles` | `number` | `1` | Maximum number of files |
| `maxSize` | `number` | — | Maximum file size in bytes |
| `files` | `UploadFileEntry[]` | — | Controlled file entries |
| `onFilesAdded` | `(files: File[]) => void` | — | Called when files are added |
| `onFileRemoved` | `(id: string) => void` | — | Called when a file is removed |

## Images

### SnapshotImageBase

Optimized image component with placeholder loading, responsive srcset generation, and format conversion:

```tsx
import { SnapshotImageBase } from "@lastshotlabs/snapshot/ui";

<SnapshotImageBase
  src="/photos/hero.jpg"
  alt="Hero image"
  width={800}
  height={400}
  quality={85}
  format="webp"
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

Use `priority` for above-the-fold images to skip lazy loading:

```tsx
<SnapshotImageBase
  src="/photos/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="skeleton"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Image URL |
| `alt` | `string` | **required** | Alt text |
| `width` | `number` | **required** | Display width in px |
| `height` | `number` | — | Display height in px |
| `quality` | `number` | `75` | Output quality (1-100) |
| `format` | `"avif" \| "webp" \| "jpeg" \| "png" \| "original"` | `"original"` | Output format |
| `placeholder` | `"blur" \| "empty" \| "skeleton"` | `"empty"` | Loading placeholder |
| `priority` | `boolean` | `false` | Preload the image |
| `sizes` | `string` | — | Responsive sizes attribute |
| `aspectRatio` | `string` | — | CSS aspect ratio override |

## Video

### VideoBase

HTML5 video player with poster image support:

```tsx
import { VideoBase } from "@lastshotlabs/snapshot/ui";

<VideoBase
  src="/videos/demo.mp4"
  poster="/videos/demo-poster.jpg"
  controls
  autoPlay={false}
  loop={false}
  muted={false}
/>
```

When `autoPlay` is set, `muted` defaults to `true` (required by most browsers for autoplay):

```tsx
<VideoBase src="/videos/background.mp4" autoPlay loop />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Video source URL |
| `poster` | `string` | — | Poster image URL |
| `controls` | `boolean` | `true` | Show playback controls |
| `autoPlay` | `boolean` | — | Auto-play on mount |
| `loop` | `boolean` | — | Loop playback |
| `muted` | `boolean` | `true` if autoPlay | Mute audio |

## Carousel

### CarouselBase

Slide carousel with auto-play, arrow navigation, and dot indicators. Pauses on hover:

```tsx
import { CarouselBase, SnapshotImageBase } from "@lastshotlabs/snapshot/ui";

<CarouselBase autoPlay interval={5000} showArrows showDots>
  <SnapshotImageBase src="/slides/1.jpg" alt="Slide 1" width={800} height={400} />
  <SnapshotImageBase src="/slides/2.jpg" alt="Slide 2" width={800} height={400} />
  <SnapshotImageBase src="/slides/3.jpg" alt="Slide 3" width={800} height={400} />
</CarouselBase>
```

Children can be any React elements — not just images:

```tsx
<CarouselBase showArrows showDots>
  <CardBase title="Feature 1">Fast builds with Bun</CardBase>
  <CardBase title="Feature 2">113 standalone components</CardBase>
  <CardBase title="Feature 3">Full auth out of the box</CardBase>
</CarouselBase>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode[]` | **required** | Slide elements |
| `autoPlay` | `boolean` | — | Auto-advance slides |
| `interval` | `number` | `5000` | Auto-advance interval in ms |
| `showArrows` | `boolean` | `true` | Show prev/next arrows |
| `showDots` | `boolean` | `true` | Show dot indicators |

## Embeds

### EmbedBase

Responsive iframe embed for videos and external content:

```tsx
import { EmbedBase } from "@lastshotlabs/snapshot/ui";

<EmbedBase
  url="https://www.youtube.com/embed/dQw4w9WgXcQ"
  aspectRatio="16/9"
  title="Video embed"
/>
```

### LinkEmbedBase

URL preview card with metadata. Supports automatic iframe embeds for YouTube, Vimeo, and other platforms:

```tsx
import { LinkEmbedBase } from "@lastshotlabs/snapshot/ui";

<LinkEmbedBase
  url="https://github.com/lastshotlabs/snapshot"
  meta={{
    title: "Snapshot",
    description: "Build React apps with 113 components and 108 hooks",
    image: "/og-image.png",
    siteName: "GitHub",
  }}
  allowIframe
  maxWidth="600px"
/>
```

## Rich text

### RichTextEditorBase

Markdown-based WYSIWYG editor with toolbar, edit/preview/split modes, and custom preview rendering:

```tsx
import { useState } from "react";
import { RichTextEditorBase } from "@lastshotlabs/snapshot/ui";

function PostEditor() {
  const [content, setContent] = useState("");

  return (
    <RichTextEditorBase
      content={content}
      onChange={setContent}
      placeholder="Write your post..."
      mode="edit"
      toolbar={["bold", "italic", "heading", "link", "code", "image"]}
      minHeight="200px"
      maxHeight="500px"
    />
  );
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | Markdown content |
| `onChange` | `(content: string) => void` | — | Content change handler |
| `placeholder` | `string` | — | Placeholder text |
| `readonly` | `boolean` | — | Read-only mode |
| `mode` | `"edit" \| "preview" \| "split"` | `"edit"` | Editor mode |
| `toolbar` | `boolean \| string[]` | — | Toolbar config |
| `minHeight` | `string` | — | Minimum editor height |
| `maxHeight` | `string` | — | Maximum editor height |
| `renderPreview` | `(content: string) => ReactNode` | — | Custom preview renderer |

### RichInputBase

Compact rich text input designed for chat and comment fields. Supports formatting features and send-on-Enter:

```tsx
import { RichInputBase } from "@lastshotlabs/snapshot/ui";

<RichInputBase
  placeholder="Type a message..."
  features={["bold", "italic", "link"]}
  sendOnEnter
  maxLength={2000}
  showSendButton
  onSend={({ html, text }) => sendMessage(text)}
  onChange={({ text }) => updateDraft(text)}
/>
```

### MarkdownBase

Render Markdown content with syntax highlighting and Snapshot design tokens:

```tsx
import { MarkdownBase } from "@lastshotlabs/snapshot/ui";

<MarkdownBase content={markdownString} maxHeight="400px" />
```

### CodeBlockBase

Syntax-highlighted code block with copy button and line numbers:

```tsx
import { CodeBlockBase } from "@lastshotlabs/snapshot/ui";

<CodeBlockBase
  code={`function hello() {\n  console.log("world");\n}`}
  language="typescript"
  title="hello.ts"
  showCopy
  showLineNumbers
  maxHeight="300px"
/>
```

### CompareViewBase

Side-by-side text comparison with line numbers and diff highlighting:

```tsx
import { CompareViewBase } from "@lastshotlabs/snapshot/ui";

<CompareViewBase
  left={originalCode}
  right={modifiedCode}
  leftLabel="Before"
  rightLabel="After"
  showLineNumbers
  maxHeight="400px"
/>
```

## Other content components

| Component | Description |
|-----------|-------------|
| `BannerBase` | Announcement banners |
| `HeadingBase` | Styled headings |
| `LinkBase` | Styled links |
| `TextBase` | Styled text |
| `TimelineBase` | Vertical timeline |

## Next steps

- [Forms and Validation](/guides/forms/) -- form fields for upload metadata
- [Community and Chat](/guides/community-and-chat/) -- media in chat messages
- [Theming and Styling](/guides/theming-and-styling/) -- customize media components
