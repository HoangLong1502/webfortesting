import { FEATURE_BOOKMARKS_ENABLED } from '@/config/constants';
import { Suspense } from "react";
import { BookmarksManager } from "./_components/bookmarks-manager";

export default async function bookmark() {
  if (!FEATURE_BOOKMARKS_ENABLED) {
    return (
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Bookmarks</h1>
        <p className="text-muted-foreground">Tính năng tạm thời đóng để tối ưu hệ thống.</p>
      </section>
    );
  }
  return (
    <section className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My Bookmarks</h1>
      <Suspense fallback={<div className="text-sm text-muted-foreground" role="status" aria-live="polite">Loading…</div>}>
        <BookmarksManager />
      </Suspense>
    </section>
  )
}