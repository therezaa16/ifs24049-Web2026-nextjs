import { describe, it, expect, vi, beforeEach } from "vitest";
import postApi from "./postApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: unknown) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  } as Response);
}

describe("postApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postPost", () => {
    it("should create a post and return data", async () => {
      const spy = mockResponse({ status: "success", data: { post_id: 6 } });
      expect(await postApi.postPost("Halo")).toEqual({ post_id: 6 });
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/posts/");
      expect(options?.method).toBe("POST");
      expect(JSON.parse(options?.body as string)).toEqual({ description: "Halo" });
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Tidak valid" });
      await expect(postApi.postPost("")).rejects.toThrow("Tidak valid");
      mockResponse({ status: "fail" });
      await expect(postApi.postPost("")).rejects.toThrow("Gagal menambahkan postingan");
    });
  });

  describe("postPostCover", () => {
    it("should upload cover using FormData", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["x"], "c.png", { type: "image/png" });
      expect(await postApi.postPostCover(4, file)).toBe("Berhasil mengubah cover");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/posts/4/cover");
      expect((options?.body as FormData).get("cover")).toBeInstanceOf(File);
    });

    it("should fall back to default file name", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      const blob = new Blob(["x"]);
      Object.defineProperty(blob, "name", { value: "" });
      await postApi.postPostCover(4, blob as File);
      expect(((spy.mock.calls[0][1]?.body as FormData).get("cover") as File).name).toBe(
        "cover.jpg"
      );
    });

    it("should throw API message or fallback", async () => {
      const file = new File(["x"], "c.png");
      mockResponse({ status: "fail", message: "Terlalu besar" });
      await expect(postApi.postPostCover(4, file)).rejects.toThrow("Terlalu besar");
      mockResponse({ status: "fail" });
      await expect(postApi.postPostCover(4, file)).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("putPost", () => {
    it("should update description", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil" });
      expect(await postApi.putPost(3, "Baru")).toBe("Berhasil");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/posts/3");
      expect(options?.method).toBe("PUT");
      expect(JSON.parse(options?.body as string)).toEqual({ description: "Baru" });
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(postApi.putPost(3, "x")).rejects.toThrow("Ditolak");
      mockResponse({ status: "fail" });
      await expect(postApi.putPost(3, "x")).rejects.toThrow("Gagal mengubah postingan");
    });
  });

  describe("getPosts", () => {
    it("should fetch all posts", async () => {
      const spy = mockResponse({ status: "success", data: { posts: [{ id: 1 }] } });
      expect(await postApi.getPosts()).toEqual([{ id: 1 }]);
      expect(spy.mock.calls[0][0]).toMatch(/\/posts\/$/);
    });

    it("should fetch only my posts", async () => {
      const spy = mockResponse({ status: "success", data: { posts: [] } });
      await postApi.getPosts(true);
      expect(spy.mock.calls[0][0]).toMatch(/\/posts\/\?is_me=1$/);
    });

    it("should return empty array when data missing", async () => {
      mockResponse({ status: "success" });
      expect(await postApi.getPosts()).toEqual([]);
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Gagal" });
      await expect(postApi.getPosts()).rejects.toThrow("Gagal");
      mockResponse({ status: "fail" });
      await expect(postApi.getPosts()).rejects.toThrow("Gagal mengambil data postingan");
    });
  });

  describe("getPostById", () => {
    it("should return the post", async () => {
      mockResponse({ status: "success", data: { post: { id: 7 } } });
      expect(await postApi.getPostById(7)).toEqual({ id: 7 });
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Tidak ada" });
      await expect(postApi.getPostById(7)).rejects.toThrow("Tidak ada");
      mockResponse({ status: "fail" });
      await expect(postApi.getPostById(7)).rejects.toThrow("Gagal mengambil detail postingan");
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      const spy = mockResponse({ status: "success", message: "Dihapus" });
      expect(await postApi.deletePost(2)).toBe("Dihapus");
      expect(spy.mock.calls[0][1]?.method).toBe("DELETE");
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(postApi.deletePost(2)).rejects.toThrow("Ditolak");
      mockResponse({ status: "fail" });
      await expect(postApi.deletePost(2)).rejects.toThrow("Gagal menghapus postingan");
    });
  });

  describe("postPostLike", () => {
    it("should send like 1 and 0", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil" });
      await postApi.postPostLike(2, true);
      await postApi.postPostLike(2, false);
      expect(spy.mock.calls[0][0]).toContain("/posts/2/likes");
      expect(JSON.parse(spy.mock.calls[0][1]?.body as string)).toEqual({ like: 1 });
      expect(JSON.parse(spy.mock.calls[1][1]?.body as string)).toEqual({ like: 0 });
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(postApi.postPostLike(2, true)).rejects.toThrow("Ditolak");
      mockResponse({ status: "fail" });
      await expect(postApi.postPostLike(2, true)).rejects.toThrow("Gagal mengubah status suka");
    });
  });

  describe("postPostComment", () => {
    it("should add a comment", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil" });
      expect(await postApi.postPostComment(2, "Keren")).toBe("Berhasil");
      expect(spy.mock.calls[0][0]).toContain("/posts/2/comments");
      expect(JSON.parse(spy.mock.calls[0][1]?.body as string)).toEqual({ comment: "Keren" });
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(postApi.postPostComment(2, "x")).rejects.toThrow("Ditolak");
      mockResponse({ status: "fail" });
      await expect(postApi.postPostComment(2, "x")).rejects.toThrow("Gagal menambahkan komentar");
    });
  });

  describe("deletePostComment", () => {
    it("should delete my comment", async () => {
      const spy = mockResponse({ status: "success", message: "Dihapus" });
      expect(await postApi.deletePostComment(2)).toBe("Dihapus");
      expect(spy.mock.calls[0][0]).toContain("/posts/2/comments");
      expect(spy.mock.calls[0][1]?.method).toBe("DELETE");
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(postApi.deletePostComment(2)).rejects.toThrow("Ditolak");
      mockResponse({ status: "fail" });
      await expect(postApi.deletePostComment(2)).rejects.toThrow("Gagal menghapus komentar");
    });
  });

  describe("deleteAllPosts", () => {
    it("should delete all my posts", async () => {
      const spy = mockResponse({ status: "success", message: "Semua dihapus" });
      expect(await postApi.deleteAllPosts()).toBe("Semua dihapus");
      expect(spy.mock.calls[0][0]).toMatch(/\/posts\/$/);
      expect(spy.mock.calls[0][1]?.method).toBe("DELETE");
    });

    it("should throw API message or fallback", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(postApi.deleteAllPosts()).rejects.toThrow("Ditolak");
      mockResponse({ status: "fail" });
      await expect(postApi.deleteAllPosts()).rejects.toThrow("Gagal menghapus semua postingan");
    });
  });
});
