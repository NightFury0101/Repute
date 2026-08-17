import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="pt-10 sm:pt-14">
      <Container>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 mt-4" />

        <div className="mt-10 flex items-center justify-between border-b border-line pb-5">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-lg" />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
          <div className="hidden lg:flex flex-col gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
