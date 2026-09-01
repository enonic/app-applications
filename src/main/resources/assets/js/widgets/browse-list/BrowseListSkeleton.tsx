import { Skeleton } from '@enonic/ui';

const ROWS = 8;

export function BrowseListSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-y-1.5" aria-busy="true">
      {Array.from({ length: ROWS }, (_, index) => (
        <Skeleton.Group key={index} className="flex items-center gap-2.5 px-2.5 py-1">
          <Skeleton shape="rectangle" className="size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton shape="rectangle" className="h-5 w-36" />
            <Skeleton shape="rectangle" className="h-4 w-24" />
          </div>
        </Skeleton.Group>
      ))}
    </div>
  );
}
