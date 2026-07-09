"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Shield, LogOut, LogIn } from "lucide-react";
import Magnetic from "../motion/Magnetic";
import LangSwitcher from "./LangSwitcher";
import { useInvenimusCopy } from "@/app/lib/useInvenimusCopy";
import { logout } from "@/app/(components)/(authentication-layout)/authentication/actions";

// KOTA tarzı üst bar + tam ekran flyout menü.
// Logo (I mark) + mıknatıslı CTA + dil değiştirici + hamburger.
// Metinler invenimus-content.ts sözlüğünden (TR/EN/DE) gelir.
// Menü açıkken sayfa scroll kilitlenir, Hizmetler alt menüsü açılıp kapanır.

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 17.1 15.17" className={className} aria-hidden="true">
      <path
        d="m17.1,7.58s-.01-.04-.01-.06c.01-.22-.06-.45-.24-.61L9.23.19c-.31-.27-.78-.24-1.06.07-.27.31-.24.78.07,1.06l6.26,5.52H.75c-.41,0-.75.34-.75.75s.34.75.75.75h13.74l-6.26,5.52c-.31.27-.34.75-.07,1.06.15.17.35.25.56.25.18,0,.35-.06.5-.19l7.62-6.72c.18-.16.25-.39.24-.61,0-.02.01-.04.01-.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Invenimus "I" monogramı — köşeleri yuvarlatılmış kare içinde serifli I harfi.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="currentColor" />
      <path
        d="M20 18H44V23H36V41H44V46H20V41H28V23H20V18Z"
        fill="#efefef"
      />
    </svg>
  );
}

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export default function SiteNav({
  showAdmin = false,
  isLoggedIn = false,
}: {
  showAdmin?: boolean;
  isLoggedIn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const { copy } = useInvenimusCopy();
  const nav = copy.nav;

  // Flyout menü öğeleri: düz linkler + "Hizmetler" alt menüsü (Studio'dan sonra).
  const menuItems: MenuItem[] = [
    nav.links[0],
    nav.links[1],
    { label: nav.services.label, children: nav.services.children },
    ...nav.links.slice(2),
  ];

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Kaydırınca üst bara buzlu arka plan ver: koyu bölümler üzerinde de okunur kalsın.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Sabit üst bar — kompakt, cam efektli */}
      <header
        className={`fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-[6%] py-3.5 transition-colors duration-300 ${
          open
            ? "text-paper"
            : scrolled
            ? "bg-paper/80 text-ink shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md"
            : "text-ink"
        }`}
      >
        <a
          href="#top"
          aria-label="Invenimus"
          className="flex items-center gap-2.5 text-ink"
        >
          <LogoMark className="h-8 w-8 transition-transform duration-500 hover:rotate-[360deg]" />
          <span className="font-syne text-lg font-extrabold tracking-tight">
            invenimus<span className="text-kotapink">.</span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          {/* Admin paneli kısayolu — yalnızca panele erişimi olan kullanıcıya */}
          {showAdmin && (
            <a
              href="/admin"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                open
                  ? "bg-acid text-ink hover:bg-paper"
                  : "bg-ink text-paper hover:bg-kotapink"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </a>
          )}

          <Magnetic strength={0.35}>
            <a
              href="#contact"
              className={`group hidden items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors sm:inline-flex ${
                open
                  ? "border-paper/30 hover:bg-paper hover:text-ink"
                  : "border-ink/25 hover:bg-ink hover:text-paper"
              }`}
            >
              <span>{nav.cta}</span>
              <ArrowIcon className="h-3 w-3 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
            </a>
          </Magnetic>

          {/* Dil değiştirici — menü açıkken koyu, kapalıyken açık tema */}
          <LangSwitcher variant={open ? "dark" : "light"} />

          <button
            type="button"
            aria-label={open ? nav.close : nav.open}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`relative z-[70] flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              open
                ? "border-paper/30 hover:bg-paper hover:text-ink"
                : "border-ink/25 hover:bg-ink hover:text-paper"
            }`}
          >
            <span className="flex flex-col items-center justify-center gap-[5px]">
              <span
                className={`block h-px w-5 bg-current transition-transform duration-300 ${
                  open ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-current transition-transform duration-300 ${
                  open ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Flyout menü */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col justify-between gap-8 overflow-y-auto bg-ink px-[7%] pb-10 pt-24 text-paper sm:px-14"
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.6, ease: [0.75, 0, 0.25, 1] }}
            >
              <nav>
                <ul className="space-y-0.5">
                  {menuItems.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                    >
                      {item.children ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => setSub((v) => !v)}
                            className="flex w-full items-center justify-between py-1.5 font-syne text-3xl font-bold tracking-tight sm:text-4xl"
                          >
                            {item.label}
                            <Plus
                              className={`h-5 w-5 transition-transform duration-300 ${
                                sub ? "rotate-45" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {sub && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="overflow-hidden pl-1"
                              >
                                {item.children.map((c) => (
                                  <li key={c.label}>
                                    <a
                                      href={c.href}
                                      onClick={() => setOpen(false)}
                                      className="block py-1.5 text-lg text-paper/70 transition-colors hover:text-acid"
                                    >
                                      {c.label}
                                    </a>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <a
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block py-1.5 font-syne text-3xl font-bold tracking-tight transition-colors hover:text-acid sm:text-4xl"
                        >
                          {item.label}
                        </a>
                      )}
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#contact"
                    onClick={() => setOpen(false)}
                    className="group inline-flex items-center gap-3 rounded-full bg-acid px-6 py-3.5 font-medium text-ink"
                  >
                    {nav.menuCta}
                    <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                  {showAdmin && (
                    <a
                      href="/admin"
                      className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-5 py-3.5 font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Paneli
                    </a>
                  )}
                  {isLoggedIn ? (
                    <form action={logout}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-5 py-3.5 font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
                      >
                        <LogOut className="h-4 w-4" />
                        {copy.auth.logout}
                      </button>
                    </form>
                  ) : (
                    <a
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-5 py-3.5 font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
                    >
                      <LogIn className="h-4 w-4" />
                      {copy.auth.signInCta}
                    </a>
                  )}
                </div>
              </nav>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-paper/50">
                <a href={`mailto:${copy.contact.email}`} className="hover:text-paper">
                  {copy.contact.email}
                </a>
                <span>{copy.footer.location}</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
