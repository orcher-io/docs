// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import { Command, Menu, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { memo, useState } from "react";
// End of third-party imports

import { buttonVariants, cn } from "ui";
import { CommandMenuTriggerInput } from "ui-patterns";
import { BASE_PATH } from "~/lib/constants";
import GlobalNavigationMenu from "./GlobalNavigationMenu";

const GlobalMobileMenu = dynamic(() => import("./GlobalMobileMenu"));
const TopNavDropdown = dynamic(() => import("./TopNavDropdown"));

const TopNavBar: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="top bar"
        className="w-full z-40 flex flex-col border-b backdrop-blur backdrop-filter bg bg-opacity-75"
      >
        <div className="w-full px-5 lg:pl-10 flex justify-between h-[var(--header-height)] gap-3">
          <div className="hidden lg:flex h-full items-center justify-center gap-0">
            <HeaderLogo />
            <GlobalNavigationMenu />
          </div>
          <div className="w-full grow lg:w-auto flex gap-3 justify-between lg:justify-end items-center h-full">
            <div className="lg:hidden">
              <HeaderLogo />
            </div>

            <div className="flex gap-2 items-center">
              <CommandMenuTriggerInput
                placeholder={
                  <>
                    Search
                    <span className="hidden xl:inline ml-1"> docs...</span>
                  </>
                }
              />
              <button
                title="Menu dropdown button"
                className={cn(
                  buttonVariants({ type: "default" }),
                  "flex lg:hidden border-default bg-surface-100/75 text-foreground-light rounded-md min-w-[30px] w-[30px] h-[30px] data-[state=open]:bg-overlay-hover/30",
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={18} strokeWidth={1} />
              </button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-end gap-3">
            <TopNavDropdown />
          </div>
        </div>
      </nav>
      <GlobalMobileMenu open={mobileMenuOpen} setOpen={setMobileMenuOpen} />
    </>
  );
};

const HeaderLogo = memo(() => {
  return (
    <Link
      href="/"
      className={cn(
        buttonVariants({ type: "default" }),
        "flex shrink-0 items-center gap-1 w-fit !bg-transparent !border-none !shadow-none",
      )}
    >
      <Image
        className="!m-0 dark:invert"
        src={`${BASE_PATH}/logo.png`}
        priority={true}
        loading="eager"
        width={22}
        height={22}
        alt="Orcher"
      />
      <span className="text-base font-bold tracking-tight text-foreground">orcher</span>
    </Link>
  );
});

HeaderLogo.displayName = "HeaderLogo";

TopNavBar.displayName = "TopNavBar";

export default TopNavBar;
