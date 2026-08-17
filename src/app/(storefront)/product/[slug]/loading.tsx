import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Skeleton className="h-3 w-56 mb-8" />
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="flex-1 aspect-[4/5] rounded-2xl" />
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="flex gap-3">
              <Skeleton className="h-14 flex-1 rounded-full" />
              <Skeleton className="h-14 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
