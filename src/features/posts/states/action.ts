import type { AppAction } from "@/types/action";
import type { Post } from "@/types";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import postApi from "../api/postApi";

type Dispatcher = (action: AppAction) => unknown;

export const ActionType = {
  SET_POSTS: "SET_POSTS",
  SET_POST: "SET_POST",
  SET_IS_POST: "SET_IS_POST",
  SET_IS_POST_ADD: "SET_IS_POST_ADD",
  SET_IS_POST_ADDED: "SET_IS_POST_ADDED",
  SET_IS_POST_CHANGE: "SET_IS_POST_CHANGE",
  SET_IS_POST_CHANGED: "SET_IS_POST_CHANGED",
  SET_IS_POST_CHANGE_COVER: "SET_IS_POST_CHANGE_COVER",
  SET_IS_POST_CHANGED_COVER: "SET_IS_POST_CHANGED_COVER",
  SET_IS_POST_DELETE: "SET_IS_POST_DELETE",
  SET_IS_POST_DELETED: "SET_IS_POST_DELETED",
  SET_IS_POST_LIKE: "SET_IS_POST_LIKE",
  SET_IS_POST_LIKED: "SET_IS_POST_LIKED",
  SET_IS_POST_ADD_COMMENT: "SET_IS_POST_ADD_COMMENT",
  SET_IS_POST_ADDED_COMMENT: "SET_IS_POST_ADDED_COMMENT",
  SET_IS_POST_DELETE_COMMENT: "SET_IS_POST_DELETE_COMMENT",
  SET_IS_POST_DELETED_COMMENT: "SET_IS_POST_DELETED_COMMENT",
  SET_IS_POST_DELETE_ALL: "SET_IS_POST_DELETE_ALL",
  SET_IS_POST_DELETED_ALL: "SET_IS_POST_DELETED_ALL",
};

// ---------------------------------------------------------------------------
// Collection & detail
// ---------------------------------------------------------------------------
export function setPostsActionCreator(posts: Post[]) {
  return { type: ActionType.SET_POSTS, payload: posts };
}

export function asyncSetPosts(isMe = false) {
  return async (dispatch: Dispatcher) => {
    try {
      const posts = await postApi.getPosts(isMe);
      dispatch(setPostsActionCreator(posts));
    } catch {
      dispatch(setPostsActionCreator([]));
    }
  };
}

export function setPostActionCreator(post: Post | null | undefined) {
  return { type: ActionType.SET_POST, payload: post };
}

export function setIsPostActionCreator(status: boolean) {
  return { type: ActionType.SET_IS_POST, payload: status };
}

export function asyncSetPost(postId: number | string) {
  return async (dispatch: Dispatcher) => {
    try {
      const post = await postApi.getPostById(postId);
      dispatch(setPostActionCreator(post));
    } catch {
      dispatch(setPostActionCreator(null));
    } finally {
      dispatch(setIsPostActionCreator(true));
    }
  };
}

// ---------------------------------------------------------------------------
// Mutations: each pair of flags is "<is>Action" (finished) and "<is>Actioned"
// (finished successfully), mirroring the other features of the app.
// ---------------------------------------------------------------------------
function mutation(
  call: () => Promise<string | unknown>,
  setSucceeded: (value: boolean) => AppAction,
  setFinished: (value: boolean) => AppAction,
  options: { silent?: boolean; successMessage?: string } = {}
) {
  return async (dispatch: Dispatcher) => {
    try {
      const message = await call();
      if (!options.silent) {
        showSuccessDialog(options.successMessage || String(message));
      }
      dispatch(setSucceeded(true));
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setSucceeded(false));
    } finally {
      dispatch(setFinished(true));
    }
  };
}

export function setIsPostAddActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_ADD, payload: value };
}
export function setIsPostAddedActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_ADDED, payload: value };
}
export function asyncSetIsPostAdd(description: string) {
  return mutation(
    () => postApi.postPost(description),
    setIsPostAddedActionCreator,
    setIsPostAddActionCreator,
    { successMessage: "Postingan berhasil dipublikasikan!" }
  );
}

export function setIsPostChangeActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_CHANGE, payload: value };
}
export function setIsPostChangedActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_CHANGED, payload: value };
}
export function asyncSetIsPostChange(postId: number | string, description: string) {
  return mutation(
    () => postApi.putPost(postId, description),
    setIsPostChangedActionCreator,
    setIsPostChangeActionCreator
  );
}

export function setIsPostChangeCoverActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_CHANGE_COVER, payload: value };
}
export function setIsPostChangedCoverActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_CHANGED_COVER, payload: value };
}
export function asyncSetIsPostChangeCover(postId: number | string, cover: File) {
  return mutation(
    () => postApi.postPostCover(postId, cover),
    setIsPostChangedCoverActionCreator,
    setIsPostChangeCoverActionCreator
  );
}

export function setIsPostDeleteActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_DELETE, payload: value };
}
export function setIsPostDeletedActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_DELETED, payload: value };
}
export function asyncSetIsPostDelete(postId: number | string) {
  return mutation(
    () => postApi.deletePost(postId),
    setIsPostDeletedActionCreator,
    setIsPostDeleteActionCreator
  );
}

export function setIsPostLikeActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_LIKE, payload: value };
}
export function setIsPostLikedActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_LIKED, payload: value };
}
export function asyncSetIsPostLike(postId: number | string, like: boolean) {
  return mutation(
    () => postApi.postPostLike(postId, like),
    setIsPostLikedActionCreator,
    setIsPostLikeActionCreator,
    { silent: true }
  );
}

export function setIsPostAddCommentActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_ADD_COMMENT, payload: value };
}
export function setIsPostAddedCommentActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_ADDED_COMMENT, payload: value };
}
export function asyncSetIsPostAddComment(postId: number | string, comment: string) {
  return mutation(
    () => postApi.postPostComment(postId, comment),
    setIsPostAddedCommentActionCreator,
    setIsPostAddCommentActionCreator
  );
}

export function setIsPostDeleteCommentActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_DELETE_COMMENT, payload: value };
}
export function setIsPostDeletedCommentActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_DELETED_COMMENT, payload: value };
}
export function asyncSetIsPostDeleteComment(postId: number | string) {
  return mutation(
    () => postApi.deletePostComment(postId),
    setIsPostDeletedCommentActionCreator,
    setIsPostDeleteCommentActionCreator
  );
}

export function setIsPostDeleteAllActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_DELETE_ALL, payload: value };
}
export function setIsPostDeletedAllActionCreator(value: boolean) {
  return { type: ActionType.SET_IS_POST_DELETED_ALL, payload: value };
}
export function asyncSetIsPostDeleteAll() {
  return mutation(
    () => postApi.deleteAllPosts(),
    setIsPostDeletedAllActionCreator,
    setIsPostDeleteAllActionCreator
  );
}
