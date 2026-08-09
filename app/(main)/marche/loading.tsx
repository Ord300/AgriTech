import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto flex flex-col items-center px-4 py-12 text-center lg:py-16">
          <Skeleton className="mb-5 h-8 w-48 rounded-full" />
          <Skeleton className="h-12 w-64 sm:w-80" />
          <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
          <div className="mt-8 flex items-center gap-6 sm:gap-8">
            <Skeleton className="h-14 w-16" />
            <Skeleton className="h-10 w-px" />
            <Skeleton className="h-14 w-16" />
            <Skeleton className="h-10 w-px" />
            <Skeleton className="h-14 w-16" />
          </div>
        </div>
      </section>

      {/* Category chips skeleton */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="mt-6 border-y py-3">
        <div className="container mx-auto flex flex-col gap-3 px-4 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full rounded-full sm:w-[180px]" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-5 w-40" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
