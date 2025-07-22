interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton = ({ className = "", count = 1 }: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="flex-shrink-0 w-48 space-y-2">
    <LoadingSkeleton className="w-full h-72 rounded-lg" />
    <LoadingSkeleton className="w-3/4 h-4" />
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative h-[80vh] w-full overflow-hidden">
    <LoadingSkeleton className="w-full h-full" />
    <div className="absolute bottom-0 left-0 p-8 space-y-4">
      <LoadingSkeleton className="w-96 h-12" />
      <LoadingSkeleton className="w-[600px] h-20" />
      <div className="flex space-x-4">
        <LoadingSkeleton className="w-32 h-12" />
        <LoadingSkeleton className="w-32 h-12" />
      </div>
    </div>
  </div>
);