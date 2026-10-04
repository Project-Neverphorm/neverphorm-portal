import Footer from '@/components/Footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  )
}