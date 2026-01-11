import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[8rem] md:auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-3 md:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  comingSoon,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
  comingSoon?: boolean;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      comingSoon && "hover:grayscale transition-all duration-300",
      className,
    )}
  >
    {/* Background - adjusted for mobile */}
    <div className="[&>div]:md:h-full [&>div>img]:md:h-full [&>div>img]:h-[120%] [&>div>img]:object-[right_center]">{background}</div>

    {/* Content - horizontal on mobile, vertical on desktop */}
    <div className="pointer-events-none z-10 flex transform-gpu flex-row md:flex-col items-center md:items-start gap-3 md:gap-1 p-4 md:p-6 transition-all duration-300 group-hover:-translate-y-0 md:group-hover:-translate-y-10">
      <Icon className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-100 md:group-hover:scale-75" />
      <div className="flex flex-col min-w-0">
        <h3 className="text-base md:text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="text-xs md:text-base text-stone-600 line-clamp-2 md:line-clamp-none md:max-w-lg">{description}</p>
      </div>
    </div>

    {/* CTA - only visible on hover for desktop */}
    {comingSoon ? (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100",
        )}
      >
        <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-md">
          Coming Soon
        </span>
      </div>
    ) : (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100",
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />

    {/* Make entire card clickable if not coming soon */}
    {!comingSoon && (
      <a href={href} className="absolute inset-0 z-0 text-transparent">
        {name}
      </a>
    )}
  </div>
);

export { BentoCard, BentoGrid };
