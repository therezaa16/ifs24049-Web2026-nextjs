"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect, useState } from "react";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import {
  asyncSetIsPostChange,
  asyncSetPost,
  setIsPostChangeActionCreator,
  setIsPostChangedActionCreator,
} from "../states/action";
import { IconX, IconEdit, IconLoader2 } from "@tabler/icons-react";

function ChangeModal({ show, onClose, onSaved, postId }) {
  const dispatch = useAppDispatch();

  const isPostChange = useAppSelector((state) => state.isPostChange);
  const isPostChanged = useAppSelector((state) => state.isPostChanged);
  const post = useAppSelector((state) => state.post);

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (postId && show) {
      dispatch(asyncSetPost(postId));
    }
  }, [postId, show, dispatch]);

  useEffect(() => {
    if (post && show && post.id === postId) {
      setDescription(post.description);
    }
  }, [post, show, postId]);

  useEffect(() => {
    if (isPostChange) {
      setLoading(false);
      dispatch(setIsPostChangeActionCreator(false));
      if (isPostChanged) {
        dispatch(setIsPostChangedActionCreator(false));
        onSaved();
        onClose();
      }
    }
  }, [isPostChange, isPostChanged, dispatch, onClose, onSaved]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
  }, [show]);

  function handleSave(e) {
    e.preventDefault();
    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    setLoading(true);
    dispatch(asyncSetIsPostChange(postId, description.trim()));
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ubah postingan"
      data-testid="edit-post-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <IconEdit size={18} stroke={2.5} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Ubah Postingan</h3>
          </div>
          <button
            type="button"
            data-testid="close-edit-modal-btn"
            aria-label="Tutup"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="edit-post-description"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Deskripsi <span className="text-red-600">*</span>
            </label>
            <textarea
              id="edit-post-description"
              data-testid="edit-post-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-700 transition-all text-sm resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              data-testid="cancel-edit-modal-btn"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="submit-edit-modal-btn"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-md shadow-amber-600/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <IconEdit size={18} stroke={2.5} />
                  <span>Perbarui Postingan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeModal;
