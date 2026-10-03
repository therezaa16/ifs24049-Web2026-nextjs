import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const onSaved = vi.fn();

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderModal(props = {}, preloadedState = {}) {
    return renderWithProviders(
      <AddModal show={true} onClose={vi.fn()} onSaved={onSaved} {...props} />,
      { preloadedState }
    );
  }

  it("should not render when show is false", () => {
    const { container } = renderModal({ show: false });
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should lock body scroll while shown", () => {
    renderModal();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate empty description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
    renderModal();
    fireEvent.change(screen.getByTestId("add-post-description-input"), { target: { value: "   " } });
    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form")!);
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch add with trimmed description and show loading", () => {
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue((() => {}) as never);
    renderModal();
    fireEvent.change(screen.getByTestId("add-post-description-input"), { target: { value: "  Halo dunia  " } });
    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form")!);
    expect(addSpy).toHaveBeenCalledWith("Halo dunia");
    expect(screen.getByText("Memublikasikan...")).toBeInTheDocument();
  });

  it("should call onSaved and onClose when add succeeded", () => {
    const onClose = vi.fn();
    renderModal({ onClose }, { isPostAdd: true, isPostAdded: true });
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("should stay open when add failed", () => {
    const onClose = vi.fn();
    renderModal({ onClose }, { isPostAdd: true, isPostAdded: false });
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close on close and cancel buttons", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
