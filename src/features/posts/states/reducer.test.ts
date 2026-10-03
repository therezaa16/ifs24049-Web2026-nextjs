import { describe, it, expect } from "vitest";
import * as reducers from "./reducer";
import { ActionType } from "./action";

const flagPairs: [keyof typeof reducers, string][] = [
  ["isPostReducer", ActionType.SET_IS_POST],
  ["isPostAddReducer", ActionType.SET_IS_POST_ADD],
  ["isPostAddedReducer", ActionType.SET_IS_POST_ADDED],
  ["isPostChangeReducer", ActionType.SET_IS_POST_CHANGE],
  ["isPostChangedReducer", ActionType.SET_IS_POST_CHANGED],
  ["isPostChangeCoverReducer", ActionType.SET_IS_POST_CHANGE_COVER],
  ["isPostChangedCoverReducer", ActionType.SET_IS_POST_CHANGED_COVER],
  ["isPostDeleteReducer", ActionType.SET_IS_POST_DELETE],
  ["isPostDeletedReducer", ActionType.SET_IS_POST_DELETED],
  ["isPostLikeReducer", ActionType.SET_IS_POST_LIKE],
  ["isPostLikedReducer", ActionType.SET_IS_POST_LIKED],
  ["isPostAddCommentReducer", ActionType.SET_IS_POST_ADD_COMMENT],
  ["isPostAddedCommentReducer", ActionType.SET_IS_POST_ADDED_COMMENT],
  ["isPostDeleteCommentReducer", ActionType.SET_IS_POST_DELETE_COMMENT],
  ["isPostDeletedCommentReducer", ActionType.SET_IS_POST_DELETED_COMMENT],
  ["isPostDeleteAllReducer", ActionType.SET_IS_POST_DELETE_ALL],
  ["isPostDeletedAllReducer", ActionType.SET_IS_POST_DELETED_ALL],
];

describe("post reducers", () => {
  it("should return default states", () => {
    expect(reducers.postsReducer(undefined, {})).toEqual([]);
    expect(reducers.postsReducer(undefined)).toEqual([]);
    expect(reducers.postReducer(undefined, {})).toBeNull();
    flagPairs.forEach(([name]) => {
      expect((reducers[name] as (s: undefined, a: object) => boolean)(undefined, {})).toBe(false);
    });
  });

  it("should keep state for unrelated actions", () => {
    expect(reducers.postsReducer([], { type: "OTHER" })).toEqual([]);
  });

  it("should handle collection and detail actions", () => {
    expect(
      reducers.postsReducer([], { type: ActionType.SET_POSTS, payload: [{ id: 1 }] } as never)
    ).toEqual([{ id: 1 }]);
    expect(
      reducers.postReducer(null, { type: ActionType.SET_POST, payload: { id: 2 } } as never)
    ).toEqual({ id: 2 });
  });

  it("should handle every status flag action", () => {
    flagPairs.forEach(([name, type]) => {
      const reducer = reducers[name] as (s: boolean, a: object) => boolean;
      expect(reducer(false, { type, payload: true })).toBe(true);
    });
  });
});
