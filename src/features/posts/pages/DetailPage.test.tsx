import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ postId: "1" }),
  usePathname: () => "/posts/1",
  useSearchParams: () => new URLSearchParams(),
}));

const profile = { id: 1, name: "Eliza", email: "e@del.org" };

const basePost = {
  id: 1,
  user_id: 1,
  description: "Isi postingan lengkap",
  cover: "https://img.test/cover.png",
  created_at: "2026-10-01T10:00:00.000000Z",
  updated_at: "2026-10-01T10:00:00.000000Z",
  author: { name: "Eliza", photo: "https://img.test/eliza.png" },
  likes: [1, 5],
  comments: [
    { id: 10, comment: "Komentar saya", created_at: "2026-10-02T10:00:00.000000Z" },
    { id: 11, comment: "Komentar orang lain", created_at: "2026-10-02T11:00:00.000000Z" },
  ],
  my_comment: { id: 10, comment: "Komentar saya" },
};

describe("DetailPage", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue((() => {}) as never);
  });

  function renderPage(preloadedState: object = {}) {
    return renderWithProviders(<DetailPage />, {
      preloadedState: { profile, post: basePost, ...preloadedState },
    });
  }

  it("should fetch detail by route param", () => {
    renderPage();
    expect(fetchSpy).toHaveBeenCalledWith("1");
  });

  it("should render loading status without profile or post", () => {
    renderPage({ profile: null });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render owner view with cover, author photo, and counts", () => {
    renderPage();
    expect(screen.getByText("Isi postingan lengkap")).toBeInTheDocument();
    expect(screen.getAllByAltText("Cover postingan Eliza")).toHaveLength(1);
    expect(screen.getByAltText("Eliza")).toBeInTheDocument();
    expect(screen.getByTestId("like-count")).toHaveTextContent("2 suka");
    expect(screen.getByTestId("edit-cover-btn")).toBeInTheDocument();
    expect(screen.getByTestId("edit-detail-post-btn")).toBeInTheDocument();
    expect(screen.getByTestId("delete-detail-post-btn")).toBeInTheDocument();
    expect(screen.getByText("Disukai")).toBeInTheDocument();
  });

  it("should render non-owner view without cover and with initial avatar", () => {
    renderPage({
      post: {
        ...basePost,
        user_id: 2,
        cover: null,
        author: { name: "budi", photo: null },
        likes: [],
        comments: [],
        my_comment: null,
      },
    });
    expect(screen.queryByTestId("edit-cover-btn")).not.toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("Suka")).toBeInTheDocument();
    expect(screen.getByTestId("no-comments")).toBeInTheDocument();
    expect(screen.queryByAltText("Cover postingan budi")).not.toBeInTheDocument();
  });

  it("should redirect home when post could not be loaded", () => {
    const { store } = renderPage({ post: null, isPost: true });
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(store.getState().isPost).toBe(false);
  });

  it("should stay when post loaded", () => {
    renderPage({ isPost: true });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should toggle like and unlike", () => {
    const likeSpy = vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue((() => {}) as never);
    renderPage();
    fireEvent.click(screen.getByTestId("like-btn"));
    expect(likeSpy).toHaveBeenLastCalledWith(1, false);

    renderPage({ post: { ...basePost, likes: [] } });
    fireEvent.click(screen.getAllByTestId("like-btn")[1]);
    expect(likeSpy).toHaveBeenLastCalledWith(1, true);
  });

  it("should reload detail after like finished", () => {
    const { store } = renderPage({ isPostLike: true, isPostLiked: true });
    expect(store.getState().isPostLike).toBe(false);
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should list comments and mark mine", () => {
    renderPage();
    expect(screen.getByTestId("comment-10")).toHaveTextContent("Komentar Saya");
    expect(screen.getByTestId("comment-11")).not.toHaveTextContent("Komentar Saya");
    expect(screen.getAllByTestId("delete-comment-btn")).toHaveLength(1);
  });

  it("should validate empty comment", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
    renderPage();
    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "  " } });
    fireEvent.submit(screen.getByTestId("comment-input").closest("form")!);
    expect(errorSpy).toHaveBeenCalledWith("Komentar tidak boleh kosong");
  });

  it("should submit trimmed comment", () => {
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAddComment").mockReturnValue((() => {}) as never);
    renderPage();
    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "  Keren  " } });
    fireEvent.submit(screen.getByTestId("comment-input").closest("form")!);
    expect(addSpy).toHaveBeenCalledWith(1, "Keren");
  });

  it("should clear the form and reload after comment added", () => {
    const { store } = renderPage({ isPostAddComment: true, isPostAddedComment: true });
    expect(store.getState().isPostAddedComment).toBe(false);
    expect(store.getState().isPostAddComment).toBe(false);
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should keep the form but reload when comment failed", () => {
    const { store } = renderPage({ isPostAddComment: true, isPostAddedComment: false });
    expect(store.getState().isPostAddComment).toBe(false);
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should clear typed comment after a successful add", async () => {
    vi.spyOn(postAction, "asyncSetIsPostAddComment").mockReturnValue(((dispatch: (a: unknown) => void) => {
      dispatch(postAction.setIsPostAddedCommentActionCreator(true));
      dispatch(postAction.setIsPostAddCommentActionCreator(true));
    }) as never);
    renderPage();
    const input = screen.getByTestId("comment-input") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Halo" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("should delete my comment when confirmed and reload after", async () => {
    const delSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockReturnValue((() => {}) as never);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
    renderPage();
    fireEvent.click(screen.getByTestId("delete-comment-btn"));
    await waitFor(() => expect(delSpy).toHaveBeenCalledWith(1));
  });

  it("should not delete my comment when cancelled", async () => {
    const delSpy = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockReturnValue((() => {}) as never);
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as never);
    renderPage();
    fireEvent.click(screen.getByTestId("delete-comment-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    await act(async () => {});
    expect(delSpy).not.toHaveBeenCalled();
  });

  it("should reload after comment deletion finished", () => {
    const { store } = renderPage({ isPostDeleteComment: true, isPostDeletedComment: true });
    expect(store.getState().isPostDeleteComment).toBe(false);
    expect(store.getState().isPostDeletedComment).toBe(false);
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should delete the post when confirmed", async () => {
    const delSpy = vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue((() => {}) as never);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
    renderPage();
    fireEvent.click(screen.getByTestId("delete-detail-post-btn"));
    await waitFor(() => expect(delSpy).toHaveBeenCalledWith(1));
  });

  it("should not delete the post when cancelled", async () => {
    const delSpy = vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue((() => {}) as never);
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as never);
    renderPage();
    fireEvent.click(screen.getByTestId("delete-detail-post-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    await act(async () => {});
    expect(delSpy).not.toHaveBeenCalled();
  });

  it("should navigate home and reset flags after post deleted", () => {
    const { store } = renderPage({ isPostDeleted: true, isPostDelete: true });
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(store.getState().isPostDeleted).toBe(false);
    expect(store.getState().isPostDelete).toBe(false);
  });

  it("should open and close cover and edit modals", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-post-btn"));
    expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should reload detail after cover saved", () => {
    renderPage({ isPostChangeCover: true, isPostChangedCover: true });
    expect(fetchSpy).toHaveBeenCalledWith(1);
  });
});
