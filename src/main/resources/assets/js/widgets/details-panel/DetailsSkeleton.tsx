import { Skeleton } from '@enonic/ui';

const SECTIONS = 2;
const SUBSECTIONS = 2;
const LINES = 3;

/** Sections whose contents are on their way: a labelled rule over a row of subsections, in shimmer. */
export function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      {Array.from({ length: SECTIONS }, (_, section) => (
        <Skeleton.Group key={section} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <Skeleton shape="rectangle" className="h-5 w-35" />
            <span className="border-bdr-subtle min-w-6 flex-1 border-b" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: SUBSECTIONS }, (_, subsection) => (
              <div key={subsection} className="flex flex-col gap-1">
                {Array.from({ length: LINES }, (_, line) => (
                  <Skeleton key={line} shape="rectangle" className="h-3 w-24" />
                ))}
              </div>
            ))}
          </div>
        </Skeleton.Group>
      ))}
    </div>
  );
}
