"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AddModal from "../modals/AddModal";
import {
  asyncSetIsPostDeleteAll,
  asyncSetPosts,
  setIsPostDeleteAllActionCreator,
  setIsPostDeletedAllActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  IconPlus,
  IconSearch,
  IconHeart,
  IconMessageCircle,
  IconLoader2,
  IconTrash,
  IconArticle,
} from "@tabler/icons-react";

function HomePage() {
  const dispatch = useAppDispatch();
  const isMe = useSearchParams().get("tab") === "me";

  const profile = useAppSelector((state) => state.profile);
  const posts = useAppSelector((state) => state.posts);
  const isPostDeletedAll = useAppSelector((state) => state.isPostDeletedAll);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadPosts = useCallback(() => {
    setLoading(true);
    return Promise.resolve(dispatch(asyncSetPosts(isMe))).finally(() =>
      setLoading(false)
    );
  }, [dispatch, isMe]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (isPostDeletedAll) {
      dispatch(setIsPostDeleteAllActionCreator(false));
      dispatch(setIsPostDeletedAllActionCreator(false));
      loadPosts();
    }
  }, [isPostDeletedAll, loadPosts, dispatch]);

  if (!profile) return null;

  async function handleDeleteAll() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus SEMUA postingan milik Anda?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsPostDeleteAll());
    }
  }

  const keyword = searchQuery.trim().toLowerCase();
  const filteredPosts = posts.filter(
    (post) =>
      post.description.toLowerCase().includes(keyword) ||
      post.author.name.toLowerCase().includes(keyword)
  );

  const tabs = [
    { href: "/", label: "Semua Postingan", active: !isMe, testId: "tab-all" },
    { href: "/?tab=me", label: "Postingan Saya", active: isMe, testId: "tab-me" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Linimasa Postingan
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Bagikan cerita Anda dan lihat apa yang dibagikan pengguna lain.
          </p>
        </div>
        <button
          type="button"
          data-testid="add-post-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-700 hover:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Buat Postingan</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm font-semibold text-slate-700 self-start">
          {tabs.map((tab) => (
            <Link
              key={tab.testId}
              href={tab.href}
              data-testid={tab.testId}
              aria-current={tab.active ? "page" : undefined}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                tab.active ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <IconSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
            />
            <input
              type="text"
              data-testid="search-post-input"
              aria-label="Cari postingan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari deskripsi atau nama pembuat..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-700"
            />
          </div>
          {isMe && (
            <button
              type="button"
              data-testid="delete-all-posts-btn"
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              <IconTrash size={16} />
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {loading && filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-slate-600">
          <IconLoader2 size={36} className="mx-auto text-indigo-700 animate-spin mb-2" />
          <p className="font-medium">Memuat postingan...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-slate-600 bg-white rounded-2xl border border-slate-200/80">
          <IconArticle size={40} className="mx-auto text-slate-600 mb-2" />
          <p className="font-medium">Belum ada postingan yang cocok.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <li key={`post-${post.id}`} data-testid={`post-card-${post.id}`}>
              <article className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-shadow">
                {post.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover}
                    alt={`Cover postingan ${post.author.name}`}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex items-center gap-3">
                    {post.author.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.author.photo}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center text-sm font-bold">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-slate-600">{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 line-clamp-4 flex-1 whitespace-pre-wrap">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1.5" data-testid={`post-likes-${post.id}`}>
                        <IconHeart size={16} className="text-rose-600" />
                        {post.likes.length} suka
                      </span>
                      <span className="inline-flex items-center gap-1.5" data-testid={`post-comments-${post.id}`}>
                        <IconMessageCircle size={16} className="text-sky-700" />
                        {post.comments.length} komentar
                      </span>
                    </div>
                    <Link
                      href={`/posts/${post.id}`}
                      data-testid={`view-post-${post.id}`}
                      className="text-xs font-bold text-indigo-800 hover:underline"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <AddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadPosts}
      />
    </div>
  );
}

export default HomePage;
