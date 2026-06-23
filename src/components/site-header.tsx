import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {
  updatedAtLabel?: string;
  sourceFile?: string;
};

export function SiteHeader({ updatedAtLabel, sourceFile }: Props) {
  const fileName = sourceFile?.split(/[/\\]/).pop();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate text-base font-medium">ДДС · Executive Dashboard</h1>
          {(updatedAtLabel || fileName) && (
            <p className="truncate text-xs text-muted-foreground">
              {fileName && <span>{fileName}</span>}
              {fileName && updatedAtLabel && " · "}
              {updatedAtLabel && <span>Обновлено: {updatedAtLabel}</span>}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
