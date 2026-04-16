import type { z } from "zod";
import type { carouselConfigSchema } from "./schema";
/** Inferred config type from the Carousel Zod schema. */
export type CarouselConfig = z.infer<typeof carouselConfigSchema>;
