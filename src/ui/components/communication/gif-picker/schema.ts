import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { endpointTargetSchema } from "../../../manifest/resources";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the GifPicker component.
 *
 * Searchable GIF picker that queries a GIF API (Giphy/Tenor) and
 * displays results in a masonry-style grid.
 *
 * The component expects a backend proxy endpoint that handles the
 * actual API key and returns GIF results. This avoids exposing
 * API keys in the frontend.
 *
 * @example
 * ```json
 * {
 *   "type": "gif-picker",
 *   "searchEndpoint": "GET /api/gifs/search",
 *   "trendingEndpoint": "GET /api/gifs/trending",
 *   "selectAction": {
 *     "type": "toast",
 *     "message": "GIF selected!"
 *   }
 * }
 * ```
 *
 * Expected API response format:
 * ```json
 * {
 *   "results": [
 *     {
 *       "id": "abc123",
 *       "url": "https://media.giphy.com/media/abc123/giphy.gif",
 *       "preview": "https://media.giphy.com/media/abc123/200w.gif",
 *       "width": 480,
 *       "height": 270,
 *       "title": "Funny cat"
 *     }
 *   ]
 * }
 * ```
 */
export const gifPickerConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("gif-picker"),
    /** Backend endpoint for GIF search. Query appended as `?q={search}`. */
    searchEndpoint: endpointTargetSchema.optional(),
    /** Backend endpoint for trending GIFs (shown by default). */
    trendingEndpoint: endpointTargetSchema.optional(),
    /** Static GIF data (for demos without a backend). */
    gifs: z
      .array(
        z.object({
          id: z.string(),
          url: z.string(),
          preview: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          title: z.union([z.string(), fromRefSchema]).optional(),
        }),
      )
      .optional(),
    /** Field name for the GIF URL in API results. Default: "url". */
    urlField: z.string().optional(),
    /** Field name for the preview URL. Default: "preview". */
    previewField: z.string().optional(),
    /** Field name for title. Default: "title". */
    titleField: z.string().optional(),
    /** Action dispatched when a GIF is selected. */
    selectAction: actionSchema.optional(),
    /** Number of columns in the grid. Default: 2. */
    columns: z.number().optional(),
    /** Max height of the scrollable area. Default: "300px". */
    maxHeight: z.string().optional(),
    /** Placeholder text for search. Default: "Search GIFs...". */
    placeholder: z.union([z.string(), fromRefSchema]).optional(),
    /** Attribution text (e.g., "Powered by Giphy"). */
    attribution: z.union([z.string(), fromRefSchema]).optional(),
    slots: slotsSchema([
      "root",
      "searchSection",
      "searchShell",
      "searchIcon",
      "searchInput",
      "content",
      "loadingState",
      "loadingIcon",
      "emptyState",
      "grid",
      "item",
      "image",
      "attribution",
    ]).optional(),
  })
  .strict();
