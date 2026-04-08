export function generateRootLayoutMinimal(): string {
  return `export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  )
}
`;
}
