import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the LinkEmbed component.
 *
 * Renders rich URL previews with platform-specific renderers for
 * YouTube, Instagram, TikTok, Twitter/X, and generic Open Graph cards.
 * Also supports inline GIF embeds.
 *
 * @example
 * ```json
 * {
 *   "type": "link-embed",
 *   "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 * }
 * ```
 *
 * @example
 * ```json
 * {
 *   "type": "link-embed",
 *   "url": "https://twitter.com/user/status/123",
 *   "meta": {
 *     "title": "Tweet by @user",
 *     "description": "Hello world!",
 *     "image": "https://pbs.twimg.com/...",
 *     "siteName": "Twitter",
 *     "favicon": "https://abs.twimg.com/favicons/twitter.3.ico"
 *   }
 * }
 * ```
 */
export const linkEmbedConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("link-embed"),
    /** The URL to embed. Can be a FromRef. */
    url: z.union([z.string(), fromRefSchema]),
    /**
     * Pre-fetched Open Graph metadata. If not provided, the component
     * renders a minimal link card. In production, the backend unfurls
     * the URL and passes this data.
     */
    meta: z
      .object({
        /** Page title. */
        title: z.union([z.string(), fromRefSchema]).optional(),
        /** Page description. */
        description: z.union([z.string(), fromRefSchema]).optional(),
        /** Preview image URL. */
        image: z.string().optional(),
        /** Site name (e.g., "YouTube", "Twitter"). */
        siteName: z.union([z.string(), fromRefSchema]).optional(),
        /** Site favicon URL. */
        favicon: z.string().optional(),
        /** Content type hint. */
        type: z.enum(["article", "video", "rich", "photo", "gif"]).optional(),
        /** Accent color (hex). */
        color: z.string().optional(),
        /** oEmbed HTML for rich embeds (iframes). */
        html: z.string().optional(),
      })
      .optional(),
    /** Maximum width for the embed card. Default: "100%". */
    maxWidth: z.string().optional(),
    /** Whether to allow iframe embeds for known platforms. Default: true. */
    allowIframe: z.boolean().optional(),
    /** Aspect ratio for video embeds. Default: "16/9". */
    aspectRatio: z.string().optional(),
    slots: slotsSchema([
      "root",
      "media",
      "card",
      "thumbnail",
      "content",
      "siteMeta",
      "title",
      "description",
      "url",
    ]).optional(),
  }).strict();
