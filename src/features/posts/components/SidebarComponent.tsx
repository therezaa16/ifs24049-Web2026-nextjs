"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUserCircle,
  IconUsers,
  IconChevronRight,
  IconArticle,
} from "@tabler/icons-react";

const navItems = [
  { href: "/", label: "Semua Postingan", icon: IconLayoutDashboard, match: "all" },
  { href: "/?tab=me", label: "Postingan Saya", icon: IconArticle, match: "me" },
  { href: "/users", label: "Daftar Pengguna", icon: IconUsers, match: "/users" },
  { href: "/profile", label: "Profil Saya", icon: IconUserCircle, match: "/profile" },
];

function SidebarComponent({ isSidebarOpen, onCloseMobile }) {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");

  function isActive(match: string) {
    if (match === "all") return pathname === "/" && tab !== "me";
    if (match === "me") return pathname === "/" && tab === "me";
    return pathname === match;
  }

  return (
    <>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu samping"
          data-testid="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 w-full h-full cursor-default bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        aria-label="Navigasi utama"
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-600">
              Menu Utama
            </p>
            <nav className="mt-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-700 text-white shadow-md shadow-indigo-600/25 font-semibold"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                        className={active ? "text-white" : "text-slate-600"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {active && <IconChevronRight size={16} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/60">
            <p className="text-xs font-semibold text-indigo-900">Praktikum 4 PABWE</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;
