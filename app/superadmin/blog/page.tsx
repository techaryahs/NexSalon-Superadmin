"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const BLOGS_PER_PAGE = 3;

type Blog = {
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  image?: string;
  author?: string;
  date?: string;
  excerpt?: string;
};


export default function BlogPage() {
  const params = useParams();
  const searchParams = useSearchParams();
 const locale =
  typeof params?.locale === "string"
    ? params.locale
    : "en";

  const activeCategory = searchParams.get("category");
  const currentPage = Number(searchParams.get("page")) || 1;

 const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL =
  process.env.NEXT_PUBLIC_API_BLOG ||
  "http://localhost:3001/api/blog/all";

  // ✅ Fetch Blogs from Backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
      const res = await fetch(API_URL);
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err: any) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
 }, [API_URL]);

  // ✅ Dynamic categories from backend blogs
 const categories = Array.from(
  new Set(
    blogs
      .map((blog) => blog.category)
      .filter((c): c is string => Boolean(c))
  )
);

  // ✅ Filter by category
  const filteredBlogs = activeCategory
  ? blogs.filter(
      (blog) =>
        blog.category &&
        blog.category.toLowerCase() ===
          activeCategory.toLowerCase()
    )
  : blogs;

  // ✅ Pagination
  const totalPages = Math.ceil(
    filteredBlogs.length / BLOGS_PER_PAGE
  );

  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * BLOGS_PER_PAGE,
    currentPage * BLOGS_PER_PAGE
  );

  return (
    <div className="bg-[#F4EFEA] min-h-screen">

      {/* TITLE */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-semibold text-[#2A2A2A]">
          Latest news on NexSalon
        </h1>
      </section>

      {/* CATEGORY FILTER */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="flex flex-wrap gap-4 justify-center">

          <Link
            href={`/${locale}/blog`}
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              !activeCategory
                ? "bg-[#3E2C2C] text-white"
                : "bg-[#EDE6DD] text-[#3E2C2C]"
            }`}
          >
            All Topics
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/${locale}/blog?category=${encodeURIComponent(cat)}`}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                activeCategory === cat
                  ? "bg-[#3E2C2C] text-white"
                  : "bg-[#EDE6DD] text-[#3E2C2C]"
              }`}
            >
              {cat}
            </Link>
          ))}

        </div>
      </section>

      {/* BLOG GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-24">

        {loading ? (
          <p className="text-center">Loading blogs...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-10">

              {paginatedBlogs.map((blog) => (
                <Link
                  key={blog.id || blog.slug}
                  href={`/${locale}/blog/${blog.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition"
                >
                  <img
                    src={blog.image || "/placeholder.png"}
                    alt={blog.title || "blog"}
                    className="h-60 w-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="p-6">
                    <p className="text-sm text-[#C6A75E] mb-2">
                      {blog.category}
                    </p>
                    <h3 className="text-lg font-semibold mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      By {blog.author} on {blog.date}
                    </p>
                    <p className="text-sm text-gray-600">
                      {blog.excerpt}
                    </p>
                  </div>
                </Link>
              ))}

            </div>

            {/* PAGINATION */}
            {!activeCategory && totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-16">

                {[...Array(totalPages)].map((_, i) => (
                  <Link
                    key={i}
                    href={`/${locale}/blog?page=${i + 1}`}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                      currentPage === i + 1
                        ? "bg-black text-white"
                        : "bg-white border"
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link
                    href={`/${locale}/blog?page=${currentPage + 1}`}
                    className="w-10 h-10 flex items-center justify-center rounded bg-white border"
                  >
                    →
                  </Link>
                )}

              </div>
            )}

          </>
        )}

      </section>
    </div>
  );
}