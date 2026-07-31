export function generateTypesApi(): string {
  return `// Extend these types to match your API responses

export interface PaginatedResponse<T> {
  items: T[]
  cursor?: string
  nextCursor?: string
  hasMore?: boolean
}
`;
}
