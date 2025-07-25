import type { Metadata } from "next";
import { Trans } from "react-i18next/TransWithoutContext";
import { getTranslation } from "@/i18n/server";
import { getAllPosts } from "@/lib/api";
import { PostPreview } from "./post-preview";

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { t } = await getTranslation(params.locale, "blog");
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);
  return (
    <section className="space-y-12">
      <header className="sm:p-6">
        <h1 className="font-bold text-4xl tracking-tight">
          <Trans
            t={t}
            ns="blog"
            i18nKey="recentPosts"
            defaults="Recent Posts"
          />
        </h1>
      </header>
      <div className="mb-16 grid grid-cols-1 gap-8">
        {allPosts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getTranslation(params.locale, "blog");
  return {
    title: t("blogTitle", {
      ns: "blog",
      defaultValue: "Rallly - Blog",
    }),
    description: t("blogDescription", {
      ns: "blog",
      defaultValue: "News, updates and announcement about Rallly.",
    }),
  };
}
