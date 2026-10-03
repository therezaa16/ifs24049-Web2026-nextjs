import { describe, it, expect, vi, beforeEach } from "vitest";
import * as actions from "./action";
import postApi from "../api/postApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const { ActionType } = actions;

describe("post actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => Promise.resolve({} as never));
    vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => Promise.resolve({} as never));
  });

  it("should create plain action objects", () => {
    const cases: [(v: never) => unknown, string][] = [
      [actions.setPostsActionCreator, ActionType.SET_POSTS],
      [actions.setPostActionCreator, ActionType.SET_POST],
      [actions.setIsPostActionCreator, ActionType.SET_IS_POST],
      [actions.setIsPostAddActionCreator, ActionType.SET_IS_POST_ADD],
      [actions.setIsPostAddedActionCreator, ActionType.SET_IS_POST_ADDED],
      [actions.setIsPostChangeActionCreator, ActionType.SET_IS_POST_CHANGE],
      [actions.setIsPostChangedActionCreator, ActionType.SET_IS_POST_CHANGED],
      [actions.setIsPostChangeCoverActionCreator, ActionType.SET_IS_POST_CHANGE_COVER],
      [actions.setIsPostChangedCoverActionCreator, ActionType.SET_IS_POST_CHANGED_COVER],
      [actions.setIsPostDeleteActionCreator, ActionType.SET_IS_POST_DELETE],
      [actions.setIsPostDeletedActionCreator, ActionType.SET_IS_POST_DELETED],
      [actions.setIsPostLikeActionCreator, ActionType.SET_IS_POST_LIKE],
      [actions.setIsPostLikedActionCreator, ActionType.SET_IS_POST_LIKED],
      [actions.setIsPostAddCommentActionCreator, ActionType.SET_IS_POST_ADD_COMMENT],
      [actions.setIsPostAddedCommentActionCreator, ActionType.SET_IS_POST_ADDED_COMMENT],
      [actions.setIsPostDeleteCommentActionCreator, ActionType.SET_IS_POST_DELETE_COMMENT],
      [actions.setIsPostDeletedCommentActionCreator, ActionType.SET_IS_POST_DELETED_COMMENT],
      [actions.setIsPostDeleteAllActionCreator, ActionType.SET_IS_POST_DELETE_ALL],
      [actions.setIsPostDeletedAllActionCreator, ActionType.SET_IS_POST_DELETED_ALL],
    ];
    cases.forEach(([creator, type]) => {
      expect(creator("x" as never)).toEqual({ type, payload: "x" });
    });
  });

  describe("asyncSetPosts", () => {
    it("should dispatch posts (all and mine)", async () => {
      const spy = vi.spyOn(postApi, "getPosts").mockResolvedValue([{ id: 1 }] as never);
      const dispatch = vi.fn();
      await actions.asyncSetPosts()(dispatch);
      expect(spy).toHaveBeenCalledWith(false);
      await actions.asyncSetPosts(true)(dispatch);
      expect(spy).toHaveBeenLastCalledWith(true);
      expect(dispatch).toHaveBeenCalledWith(actions.setPostsActionCreator([{ id: 1 }] as never));
    });

    it("should dispatch empty list on error", async () => {
      vi.spyOn(postApi, "getPosts").mockRejectedValue(new Error("x"));
      const dispatch = vi.fn();
      await actions.asyncSetPosts()(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.setPostsActionCreator([]));
    });
  });

  describe("asyncSetPost", () => {
    it("should dispatch post and loaded flag", async () => {
      vi.spyOn(postApi, "getPostById").mockResolvedValue({ id: 1 } as never);
      const dispatch = vi.fn();
      await actions.asyncSetPost(1)(dispatch);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.setPostActionCreator({ id: 1 } as never));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.setIsPostActionCreator(true));
    });

    it("should dispatch null on error", async () => {
      vi.spyOn(postApi, "getPostById").mockRejectedValue(new Error("x"));
      const dispatch = vi.fn();
      await actions.asyncSetPost(1)(dispatch);
      expect(dispatch).toHaveBeenNthCalledWith(1, actions.setPostActionCreator(null));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.setIsPostActionCreator(true));
    });
  });

  type Case = {
    name: string;
    thunk: () => (d: (a: unknown) => unknown) => Promise<void>;
    api: keyof typeof postApi;
    succeeded: (v: boolean) => unknown;
    finished: (v: boolean) => unknown;
    message: string | null;
  };

  const cases: Case[] = [
    {
      name: "asyncSetIsPostAdd",
      thunk: () => actions.asyncSetIsPostAdd("Halo"),
      api: "postPost",
      succeeded: actions.setIsPostAddedActionCreator,
      finished: actions.setIsPostAddActionCreator,
      message: "Postingan berhasil dipublikasikan!",
    },
    {
      name: "asyncSetIsPostChange",
      thunk: () => actions.asyncSetIsPostChange(1, "Baru"),
      api: "putPost",
      succeeded: actions.setIsPostChangedActionCreator,
      finished: actions.setIsPostChangeActionCreator,
      message: "OK",
    },
    {
      name: "asyncSetIsPostChangeCover",
      thunk: () => actions.asyncSetIsPostChangeCover(1, new File(["x"], "a.png")),
      api: "postPostCover",
      succeeded: actions.setIsPostChangedCoverActionCreator,
      finished: actions.setIsPostChangeCoverActionCreator,
      message: "OK",
    },
    {
      name: "asyncSetIsPostDelete",
      thunk: () => actions.asyncSetIsPostDelete(1),
      api: "deletePost",
      succeeded: actions.setIsPostDeletedActionCreator,
      finished: actions.setIsPostDeleteActionCreator,
      message: "OK",
    },
    {
      name: "asyncSetIsPostLike",
      thunk: () => actions.asyncSetIsPostLike(1, true),
      api: "postPostLike",
      succeeded: actions.setIsPostLikedActionCreator,
      finished: actions.setIsPostLikeActionCreator,
      message: null,
    },
    {
      name: "asyncSetIsPostAddComment",
      thunk: () => actions.asyncSetIsPostAddComment(1, "Keren"),
      api: "postPostComment",
      succeeded: actions.setIsPostAddedCommentActionCreator,
      finished: actions.setIsPostAddCommentActionCreator,
      message: "OK",
    },
    {
      name: "asyncSetIsPostDeleteComment",
      thunk: () => actions.asyncSetIsPostDeleteComment(1),
      api: "deletePostComment",
      succeeded: actions.setIsPostDeletedCommentActionCreator,
      finished: actions.setIsPostDeleteCommentActionCreator,
      message: "OK",
    },
    {
      name: "asyncSetIsPostDeleteAll",
      thunk: () => actions.asyncSetIsPostDeleteAll(),
      api: "deleteAllPosts",
      succeeded: actions.setIsPostDeletedAllActionCreator,
      finished: actions.setIsPostDeleteAllActionCreator,
      message: "OK",
    },
  ];

  cases.forEach((c) => {
    describe(c.name, () => {
      it("should call the API and dispatch success flags", async () => {
        const spy = vi.spyOn(postApi, c.api as never).mockResolvedValue("OK" as never);
        const dispatch = vi.fn();
        await c.thunk()(dispatch);
        expect(spy).toHaveBeenCalled();
        if (c.message === null) {
          expect(toolsHelper.showSuccessDialog).not.toHaveBeenCalled();
        } else if (c.name === "asyncSetIsPostAdd") {
          expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(c.message);
        } else {
          expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("OK");
        }
        expect(dispatch).toHaveBeenNthCalledWith(1, c.succeeded(true));
        expect(dispatch).toHaveBeenNthCalledWith(2, c.finished(true));
      });

      it("should show error and dispatch failure flags", async () => {
        vi.spyOn(postApi, c.api as never).mockRejectedValue(new Error("Gagal") as never);
        const dispatch = vi.fn();
        await c.thunk()(dispatch);
        expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal");
        expect(dispatch).toHaveBeenNthCalledWith(1, c.succeeded(false));
        expect(dispatch).toHaveBeenNthCalledWith(2, c.finished(true));
      });
    });
  });
});
