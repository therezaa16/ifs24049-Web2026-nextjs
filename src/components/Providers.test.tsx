import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Providers from "./Providers";

describe("Providers", () => {
  it("should render children inside the redux provider", () => {
    render(
      <Providers>
        <p>anak komponen</p>
      </Providers>
    );

    expect(screen.getByText("anak komponen")).toBeInTheDocument();
  });
});
