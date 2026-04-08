export function generateHomePageComponent(): string {
  return `import { useHead } from '@unhead/react'

export function HomePage() {
  useHead({ title: 'Home' })
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome</h1>
    </div>
  )
}
`;
}
