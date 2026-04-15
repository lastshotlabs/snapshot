import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { endpointTargetSchema } from "../../../manifest/resources";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the LocationInput component.
 *
 * Geocode autocomplete input that searches a backend endpoint,
 * displays matching locations in a dropdown, and extracts
 * coordinates on selection. Publishes `{ name, lat, lng, address }`.
 *
 * @example
 * ```json
 * {
 *   "type": "location-input",
 *   "id": "venue-location",
 *   "label": "Venue",
 *   "placeholder": "Search for a location...",
 *   "searchEndpoint": "GET /api/geocode",
 *   "changeAction": {
 *     "type": "set-value",
 *     "target": "map",
 *     "value": { "from": "venue-location" }
 *   }
 * }
 * ```
 *
 * Expected API response format:
 * ```json
 * [
 *   {
 *     "name": "Central Park",
 *     "address": "New York, NY, USA",
 *     "lat": 40.7829,
 *     "lng": -73.9654
 *   }
 * ]
 * ```
 */
export const locationInputConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("location-input"),
    /** Label text above the input. */
    label: z.string().optional(),
    /** Placeholder text for the search input. */
    placeholder: z.string().optional(),
    /** Initial value (location name). Can be a FromRef. */
    value: z.union([z.string(), fromRefSchema]).optional(),
    /**
     * Backend endpoint for geocode search. Query appended as `?q={search}`.
     * Must return an array of location objects.
     */
    searchEndpoint: endpointTargetSchema,
    /** Field name for location display name in results. Default: "name". */
    nameField: z.string().optional(),
    /** Field name for address/secondary text in results. Default: "address". */
    addressField: z.string().optional(),
    /** Field name for latitude. Default: "lat". */
    latField: z.string().optional(),
    /** Field name for longitude. Default: "lng". */
    lngField: z.string().optional(),
    /** Debounce delay in ms before firing search. Default: 300. */
    debounceMs: z.number().optional(),
    /** Minimum characters before searching. Default: 2. */
    minChars: z.number().optional(),
    /** Show a map link after selection. Default: true. */
    showMapLink: z.boolean().optional(),
    /** Action dispatched when a location is selected. */
    changeAction: actionSchema.optional(),
    /** Whether the input is disabled. */
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Whether the input is required. */
    required: z.boolean().optional(),
    /** Helper text below the input. */
    helperText: z.string().optional(),
    /** Error text. Can be a FromRef. */
    errorText: z.union([z.string(), fromRefSchema]).optional(),
    slots: slotsSchema([
      "root",
      "label",
      "required",
      "field",
      "leadingIcon",
      "input",
      "loadingIcon",
      "results",
      "result",
      "resultIcon",
      "resultContent",
      "resultName",
      "resultAddress",
      "mapLink",
      "helper",
      "error",
    ]).optional(),
  }).strict();
