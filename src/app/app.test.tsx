import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ variable: "font-test" }),
}));

vi.mock("@/features/posts/layouts/PostLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="post-layout">{children}</div>
  ),
}));

vi.mock("@/features/auth/layouts/AuthLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

import RootLayout, { metadata } from "./layout";
import NotFound from "./not-found";
import DashboardLayout from "./(dashboard)/layout";
import DashboardPage from "./(dashboard)/page";
import PostDetailPage from "./(dashboard)/posts/[postId]/page";
import ProfileRoute from "./(dashboard)/profile/page";
import UsersRoute from "./(dashboard)/users/page";
import AuthRouteLayout from "./auth/layout";
import LoginRoute from "./auth/login/page";
import RegisterRoute from "./auth/register/page";
import HomePage from "@/features/posts/pages/HomePage";
import DetailPage from "@/features/posts/pages/DetailPage";
import ProfilePage from "@/features/users/pages/ProfilePage";
import UsersPage from "@/features/users/pages/UsersPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

describe("app routes", () => {
  it("should expose metadata and render the root layout", () => {
    expect(metadata.title).toBe("Delcom Post");

    const html = renderToStaticMarkup(
      <RootLayout>
        <p>isi halaman</p>
      </RootLayout>
    );

    expect(html).toContain('lang="id"');
    expect(html).toContain("font-test");
    expect(html).toContain("isi halaman");
  });

  it("should render the not found page", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Halaman Tidak Ditemukan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke Beranda/ })).toHaveAttribute("href", "/");
  });

  it("should wrap dashboard routes with the post layout", () => {
    render(
      <DashboardLayout>
        <p>konten dashboard</p>
      </DashboardLayout>
    );

    expect(screen.getByTestId("post-layout")).toHaveTextContent("konten dashboard");
  });

  it("should wrap auth routes with the auth layout", () => {
    render(
      <AuthRouteLayout>
        <p>konten auth</p>
      </AuthRouteLayout>
    );

    expect(screen.getByTestId("auth-layout")).toHaveTextContent("konten auth");
  });

  it("should map each route to its feature page", () => {
    expect(DashboardPage).toBe(HomePage);
    expect(PostDetailPage).toBe(DetailPage);
    expect(ProfileRoute).toBe(ProfilePage);
    expect(UsersRoute).toBe(UsersPage);
    expect(LoginRoute).toBe(LoginPage);
    expect(RegisterRoute).toBe(RegisterPage);
  });
});
