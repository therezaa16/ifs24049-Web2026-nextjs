import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import store from "@/store";
import { useAppDispatch, useAppSelector } from "./redux";

describe("redux hooks", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it("should return the store dispatch", () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });

    expect(result.current).toBe(store.dispatch);
  });

  it("should select state from the store", () => {
    const { result } = renderHook(() => useAppSelector((state) => state.profile), { wrapper });

    expect(result.current).toBe(store.getState().profile);
  });
});
