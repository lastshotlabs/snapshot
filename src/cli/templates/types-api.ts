export function generateTypesApi(): string {
  return `// Extend these types to match your API responses

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}
`;
}
