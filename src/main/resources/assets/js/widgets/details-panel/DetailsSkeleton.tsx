import { Skeleton } from '@enonic/ui';

const SECTIONS = 3;
const SECTION_ROWS = 2;
const LIST_ROWS = 3;

export type DetailsSkeletonProps = {
  header?: boolean;
};

export function DetailsSkeleton({ header = false }: DetailsSkeletonProps) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      {header && (
        <Skeleton.Group className="flex items-center gap-5">
          <Skeleton shape="rectangle" className="size-12 shrink-0" />
          <div className="flex flex-col gap-2.5">
            <Skeleton shape="rectangle" className="h-7 w-52" />
            <Skeleton shape="rectangle" className="h-5 w-32" />
          </div>
        </Skeleton.Group>
      )}

      {Array.from({ length: SECTIONS }, (_, section) => (
        <Skeleton.Group key={section} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <Skeleton shape="rectangle" className="h-5 w-35" />
            <span className="border-bdr-subtle min-w-6 flex-1 border-b" />
          </div>
          <ItemRows rows={SECTION_ROWS} />
        </Skeleton.Group>
      ))}
    </div>
  );
}

export type DetailsListSkeletonProps = {
  rows?: number;
};

export function DetailsListSkeleton({ rows = LIST_ROWS }: DetailsListSkeletonProps) {
  return (
    <Skeleton.Group className="flex flex-col gap-2.5" aria-busy="true">
      <ItemRows rows={rows} />
    </Skeleton.Group>
  );
}

function ItemRows({ rows }: { rows: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <div key={row} className="flex items-center gap-2.5">
      <Skeleton shape="rectangle" className="size-6 shrink-0" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton shape="rectangle" className="h-5 w-44" />
        <Skeleton shape="rectangle" className="h-4 w-32" />
      </div>
      <Skeleton shape="rectangle" className="h-4 w-20 shrink-0" />
    </div>
  ));
}
