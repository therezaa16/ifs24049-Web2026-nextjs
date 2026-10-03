import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

const nav = vi.hoisted(() => ({ pathname: "/", tab: null as string | null }));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.tab ? { tab: nav.tab } : {}),
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({}),
}));

function renderSidebar(open = false, onClose = vi.fn()) {
  return renderWithProviders(
    <SidebarComponent isSidebarOpen={open} onCloseMobile={onClose} />
  );
}

describe("SidebarComponent", () => {
  beforeEach(() => {
    nav.pathname = "/";
    nav.tab = null;
  });

  it("should render all navigation links", () => {
    renderSidebar();
    ["Semua Postingan", "Postingan Saya", "Daftar Pengguna", "Profil Saya"].forEach(
      (label) => expect(screen.getByText(label)).toBeInTheDocument()
    );
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should mark 'Semua Postingan' active on the timeline", () => {
    renderSidebar();
    expect(screen.getByText("Semua Postingan").closest("a")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Postingan Saya").closest("a")).not.toHaveAttribute("aria-current");
  });

  it("should mark 'Postingan Saya' active for tab=me", () => {
    nav.tab = "me";
    renderSidebar();
    expect(screen.getByText("Postingan Saya").closest("a")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Semua Postingan").closest("a")).not.toHaveAttribute("aria-current");
  });

  it("should mark other pages active by pathname", () => {
    nav.pathname = "/users";
    renderSidebar();
    expect(screen.getByText("Daftar Pengguna").closest("a")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Semua Postingan").closest("a")).not.toHaveAttribute("aria-current");
  });

  it("should render backdrop and close on click", () => {
    const onClose = vi.fn();
    renderSidebar(true, onClose);
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should close mobile sidebar when a link is clicked", () => {
    const onClose = vi.fn();
    renderSidebar(true, onClose);
    fireEvent.click(screen.getByText("Profil Saya"));
    expect(onClose).toHaveBeenCalled();
  });
});
