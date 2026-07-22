import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

const NAV = [
  { to: "/contacts", label: "Contacts" },
  { to: "/darkroom-printing", label: "Darkroom Printing" },
  { to: "/exhibitions-and-works", label: "Exhibitions and Works" },
] as const;

type Props = {
  children: ReactNode;
  variant?: "light" | "darkroom";
  headerAction?: ReactNode;
  backgroundStyle?: CSSProperties;
};

export function Layout({ children, variant = "light", headerAction, backgroundStyle }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const dark = variant === "darkroom";
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    if (previousPathRef.current === "/" && pathname !== "/") {
      window.dispatchEvent(new CustomEvent("portfolio:leave-home"));
    }
    previousPathRef.current = pathname;
  }, [pathname]);

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row ${
        dark ? "bg-[#7a0a0a] text-red-50" : "bg-white text-neutral-900"
      }`}
      style={backgroundStyle}
    >
      <aside
        className="w-full md:min-h-screen md:w-56 lg:w-64 xl:w-72 px-5 sm:px-6 md:px-8 py-6 md:py-8 lg:py-10 md:sticky md:top-0 md:self-start"
      >
        <Link
          to="/"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("portfolio:leave-home"));
          }}
          className="block mb-6 md:mb-10 lg:mb-12"
        >
          <h1 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight leading-snug">
            Andrea Zanacco
          </h1>
        </Link>
        <nav>
          <ul className="flex flex-row flex-wrap gap-2 sm:gap-3 md:flex-col md:gap-4">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={(event) => {
                      if (item.to === "/") {
                        event.preventDefault();
                        window.dispatchEvent(new CustomEvent("portfolio:leave-home"));
                        window.location.assign("/");
                        return;
                      }

                      if (pathname === item.to) {
                        event.preventDefault();
                        window.location.assign(item.to);
                        return;
                      }

                      void router.navigate({ to: item.to });
                    }}
                    className={`text-sm sm:text-base transition-opacity hover:opacity-60 ${
                      active ? "opacity-100 underline underline-offset-4" : "opacity-80"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {headerAction && <div className="mt-8">{headerAction}</div>}
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
