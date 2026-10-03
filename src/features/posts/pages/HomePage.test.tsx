import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const nav = vi.hoisted(() => ({ tab: null as string | null }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.tab ? { tab: nav.tab } : {}),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
  useParams: () => ({}),
}));

const profile = { id: 1, name: "Eliza", email: "e@del.org" };

const posts = [
  {
    id: 1,
    user_id: 1,
    description: "Belajar Next.js itu seru",
    cover: "https://img.test/cover.png",
    created_at: "2026-10-01T10:00:00.000000Z",
    updated_at: "2026-10-01T10:00:00.000000Z",
    author: { name: "Eliza", photo: "https://img.test/eliza.png" },
    likes: [1, 2],
    comments: [{ id: 1, comment: "Mantap" }],
  },
  {
    id: 2,
    user_id: 2,
    description: "Redux Toolkit memudahkan state",
    cover: null,
    created_at: "2026-10-02T10:00:00.000000Z",
    updated_at: "2026-10-02T10:00:00.000000Z",
    author: { name: "budi", photo: null },
    likes: [],
    comments: [],
  },
];

describe("HomePage", () => {
  let listSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    nav.tab = null;
    listSpy = vi
      .spyOn(postAction, "asyncSetPosts")
      .mockReturnValue((() => Promise.resolve()) as never);
  });

  function renderPage(preloadedState: object = {}) {
    return renderWithProviders(<HomePage />, {
      preloadedState: { profile, posts, ...preloadedState },
    });
  }

  it("should render nothing without profile", () => {
    const { container } = renderWithProviders(<HomePage />, { preloadedState: { profile: null } });
    expect(container.firstChild).toBeNull();
  });

  it("should load all posts by default and my posts for tab=me", () => {
    renderPage();
    expect(listSpy).toHaveBeenCalledWith(false);
    nav.tab = "me";
    renderPage();
    expect(listSpy).toHaveBeenLastCalledWith(true);
  });

  it("should render post cards", () => {
    renderPage();
    expect(screen.getByTestId("post-card-1")).toHaveTextContent("Belajar Next.js itu seru");
    expect(screen.getByTestId("post-likes-1")).toHaveTextContent("2 suka");
    expect(screen.getByTestId("post-comments-1")).toHaveTextContent("1 komentar");
    expect(screen.getByAltText("Cover postingan Eliza")).toBeInTheDocument();
    expect(screen.getByAltText("Eliza")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-2")).toHaveTextContent("B");
    expect(screen.getByTestId("view-post-2")).toHaveAttribute("href", "/posts/2");
  });

  it("should show tabs with correct active state", () => {
    renderPage();
    expect(screen.getByTestId("tab-all")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("tab-me")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("tab-me")).toHaveAttribute("href", "/?tab=me");
    expect(screen.queryByTestId("delete-all-posts-btn")).not.toBeInTheDocument();
  });

  it("should show delete-all only on my posts tab", () => {
    nav.tab = "me";
    renderPage();
    expect(screen.getByTestId("tab-me")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("delete-all-posts-btn")).toBeInTheDocument();
  });

  it("should show empty state", async () => {
    renderPage({ posts: [] });
    await waitFor(() =>
      expect(screen.getByText("Belum ada postingan yang cocok.")).toBeInTheDocument()
    );
  });

  it("should show loading state", () => {
    listSpy.mockReturnValue((() => new Promise(() => {})) as never);
    renderPage({ posts: [] });
    expect(screen.getByText("Memuat postingan...")).toBeInTheDocument();
  });

  it("should filter by description and author name", async () => {
    renderPage();
    await act(async () => {});
    const input = screen.getByTestId("search-post-input");

    fireEvent.change(input, { target: { value: "redux" } });
    expect(screen.queryByTestId("post-card-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("post-card-2")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "ELIZA" } });
    expect(screen.getByTestId("post-card-1")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-2")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText("Belum ada postingan yang cocok.")).toBeInTheDocument();
  });

  it("should open and close the add modal", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("add-post-btn"));
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
  });

  it("should reload posts after a post was published", () => {
    renderPage({ isPostAdd: true, isPostAdded: true });
    expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should delete all my posts when confirmed", async () => {
    nav.tab = "me";
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockReturnValue((() => {}) as never);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
    renderPage();
    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    await waitFor(() => expect(deleteSpy).toHaveBeenCalled());
  });

  it("should not delete all when cancelled", async () => {
    nav.tab = "me";
    const deleteSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockReturnValue((() => {}) as never);
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as never);
    renderPage();
    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    await act(async () => {});
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should reload and reset flags after delete all finished", async () => {
    const { store } = renderPage({ isPostDeletedAll: true, isPostDeleteAll: true });
    await waitFor(() => expect(store.getState().isPostDeletedAll).toBe(false));
    expect(store.getState().isPostDeleteAll).toBe(false);
    expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
