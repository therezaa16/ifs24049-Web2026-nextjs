import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const onSaved = vi.fn();
const mockPost = { id: 1, description: "Deskripsi awal" };

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(postAction, "asyncSetPost").mockReturnValue((() => {}) as never);
  });

  function renderModal(props = {}, preloadedState: object = { post: mockPost }) {
    return renderWithProviders(
      <ChangeModal show={true} onClose={vi.fn()} onSaved={onSaved} postId={1} {...props} />,
      { preloadedState }
    );
  }

  it("should not render or fetch when hidden", () => {
    const { container } = renderModal({ show: false });
    expect(container.firstChild).toBeNull();
    expect(postAction.asyncSetPost).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should fetch the post and populate description", () => {
    renderModal();
    expect(postAction.asyncSetPost).toHaveBeenCalledWith(1);
    expect(document.body.style.overflow).toBe("hidden");
    expect((screen.getByTestId("edit-post-description-input") as HTMLTextAreaElement).value).toBe("Deskripsi awal");
  });

  it("should not populate when stored post has another id", () => {
    renderModal({}, { post: { ...mockPost, id: 99 } });
    expect((screen.getByTestId("edit-post-description-input") as HTMLTextAreaElement).value).toBe("");
  });

  it("should not fetch without postId", () => {
    renderModal({ postId: null }, { post: null });
    expect(postAction.asyncSetPost).not.toHaveBeenCalled();
  });

  it("should validate empty description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
    renderModal();
    const input = screen.getByTestId("edit-post-description-input");
    fireEvent.change(input, { target: { value: "  " } });
    fireEvent.submit(input.closest("form")!);
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch change and show loading", () => {
    const changeSpy = vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue((() => {}) as never);
    renderModal();
    const input = screen.getByTestId("edit-post-description-input");
    fireEvent.change(input, { target: { value: "  Baru  " } });
    fireEvent.submit(input.closest("form")!);
    expect(changeSpy).toHaveBeenCalledWith(1, "Baru");
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });

  it("should call onSaved and onClose when change succeeded", () => {
    const onClose = vi.fn();
    renderModal({ onClose }, { post: mockPost, isPostChange: true, isPostChanged: true });
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should stay open when change failed", () => {
    const onClose = vi.fn();
    renderModal({ onClose }, { post: mockPost, isPostChange: true, isPostChanged: false });
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close on close and cancel buttons", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
