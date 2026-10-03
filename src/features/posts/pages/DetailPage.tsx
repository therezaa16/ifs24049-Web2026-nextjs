"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  asyncSetPost,
  asyncSetIsPostDelete,
  asyncSetIsPostLike,
  asyncSetIsPostAddComment,
  asyncSetIsPostDeleteComment,
  setIsPostActionCreator,
  setIsPostDeleteActionCreator,
  setIsPostDeletedActionCreator,
  setIsPostLikeActionCreator,
  setIsPostLikedActionCreator,
  setIsPostAddCommentActionCreator,
  setIsPostAddedCommentActionCreator,
  setIsPostDeleteCommentActionCreator,
  setIsPostDeletedCommentActionCreator,
} from "../states/action";
import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconHeart,
  IconHeartFilled,
  IconSend,
} from "@tabler/icons-react";

function DetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const profile = useAppSelector((state) => state.profile);
  const post = useAppSelector((state) => state.post);
  const isPost = useAppSelector((state) => state.isPost);
  const isPostDeleted = useAppSelector((state) => state.isPostDeleted);
  const isPostLike = useAppSelector((state) => state.isPostLike);
  const isPostAddComment = useAppSelector((state) => state.isPostAddComment);
  const isPostAddedComment = useAppSelector((state) => state.isPostAddedComment);
  const isPostDeleteComment = useAppSelector((state) => state.isPostDeleteComment);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(asyncSetPost(postId));
  }, [postId, dispatch]);

  useEffect(() => {
    if (isPost) {
      dispatch(setIsPostActionCreator(false));
      if (!post) {
        router.push("/");
      }
    }
  }, [isPost, post, router, dispatch]);

  useEffect(() => {
    if (isPostDeleted) {
      dispatch(setIsPostDeleteActionCreator(false));
      dispatch(setIsPostDeletedActionCreator(false));
      router.push("/");
    }
  }, [isPostDeleted, router, dispatch]);

  // Like / unlike finished -> refresh detail
  useEffect(() => {
    if (isPostLike) {
      dispatch(setIsPostLikeActionCreator(false));
      dispatch(setIsPostLikedActionCreator(false));
      dispatch(asyncSetPost(postId));
    }
  }, [isPostLike, postId, dispatch]);

  // Comment added -> clear form when successful, refresh detail
  useEffect(() => {
    if (isPostAddComment) {
      dispatch(setIsPostAddCommentActionCreator(false));
      if (isPostAddedComment) {
        dispatch(setIsPostAddedCommentActionCreator(false));
        setComment("");
      }
      dispatch(asyncSetPost(postId));
    }
  }, [isPostAddComment, isPostAddedComment, postId, dispatch]);

  // Comment deleted -> refresh detail
  useEffect(() => {
    if (isPostDeleteComment) {
      dispatch(setIsPostDeleteCommentActionCreator(false));
      dispatch(setIsPostDeletedCommentActionCreator(false));
      dispatch(asyncSetPost(postId));
    }
  }, [isPostDeleteComment, postId, dispatch]);

  if (!profile || !post) {
    return (
      <div role="status" aria-label="Memuat detail postingan" className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const current = post;
  const isOwner = post.user_id === profile.id;
  const isLiked = post.likes.includes(profile.id);

  async function handleDelete() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus postingan ini?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDelete(current.id));
    }
  }

  async function handleDeleteComment() {
    const result = await showConfirmDialog("Hapus komentar Anda pada postingan ini?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDeleteComment(current.id));
    }
  }

  function handleLike() {
    dispatch(asyncSetIsPostLike(current.id, !isLiked));
  }

  function handleSubmitComment(e) {
    e.preventDefault();
    if (!comment.trim()) {
      showErrorDialog("Komentar tidak boleh kosong");
      return;
    }
    dispatch(asyncSetIsPostAddComment(current.id, comment.trim()));
  }

  function handleSaved() {
    dispatch(asyncSetPost(current.id));
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          data-testid="back-to-posts-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-800"
        >
          <IconArrowLeft size={18} />
          Kembali ke Linimasa
        </Link>

        {isOwner && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="edit-cover-btn"
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200"
            >
              <IconPhotoUp size={16} />
              Ubah Cover
            </button>
            <button
              type="button"
              data-testid="edit-detail-post-btn"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            >
              <IconEdit size={16} />
              Ubah
            </button>
            <button
              type="button"
              data-testid="delete-detail-post-btn"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-800 bg-red-50 hover:bg-red-100 border border-red-200"
            >
              <IconTrash size={16} />
              Hapus
            </button>
          </div>
        )}
      </div>

      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt={`Cover postingan ${post.author.name}`}
            className="w-full max-h-[28rem] object-cover"
          />
        )}

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            {post.author.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.photo}
                alt={post.author.name}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-base font-extrabold text-slate-900">{post.author.name}</h1>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <IconCalendar size={14} />
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              data-testid="like-btn"
              aria-pressed={isLiked}
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                isLiked
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isLiked ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
              {isLiked ? "Disukai" : "Suka"}
            </button>
            <span data-testid="like-count" className="text-sm font-semibold text-slate-700">
              {post.likes.length} suka
            </span>
          </div>
        </div>
      </article>

      <section
        aria-labelledby="comments-heading"
        className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5"
      >
        <h2 id="comments-heading" className="text-lg font-bold text-slate-900">
          Komentar ({post.comments.length})
        </h2>

        <form onSubmit={handleSubmitComment} className="space-y-3">
          <label htmlFor="comment-input" className="block text-sm font-semibold text-slate-700">
            Tulis komentar
          </label>
          <textarea
            id="comment-input"
            data-testid="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Tulis komentar Anda..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-700 text-sm resize-none"
          />
          <button
            type="submit"
            data-testid="submit-comment-btn"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl"
          >
            <IconSend size={16} />
            Kirim Komentar
          </button>
        </form>

        {post.comments.length === 0 ? (
          <p data-testid="no-comments" className="text-sm text-slate-600">
            Belum ada komentar.
          </p>
        ) : (
          <ul className="space-y-3">
            {post.comments.map((item) => {
              const isMine = post.my_comment?.id === item.id;
              return (
                <li
                  key={`comment-${item.id}`}
                  data-testid={`comment-${item.id}`}
                  className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">{item.comment}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {isMine && <strong className="text-indigo-800">Komentar Saya · </strong>}
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    {isMine && (
                      <button
                        type="button"
                        data-testid="delete-comment-btn"
                        aria-label="Hapus komentar saya"
                        onClick={handleDeleteComment}
                        className="p-1.5 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ChangeCoverModal
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onSaved={handleSaved}
        post={post}
      />
      <ChangeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSaved={handleSaved}
        postId={post.id}
      />
    </div>
  );
}

export default DetailPage;
