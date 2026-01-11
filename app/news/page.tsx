import { Navbar } from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { fetchNews } from "@/lib/news-service";

// Enable ISR (Incremental Static Regeneration)
// Revalidate every 3 hours (3 * 60 * 60 = 10800 seconds)
export const revalidate = 10800;

export default async function NewsPage(props: { searchParams: Promise<{ page?: string }> }) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const itemsPerPage = 9;

    const allNewsItems = await fetchNews();

    // Pagination logic
    const totalItems = allNewsItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newsItems = allNewsItems.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="w-full text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center p-1.5 bg-green-50 rounded-full mb-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="ml-2 text-xs font-medium text-green-700 uppercase tracking-wider">Live Updates</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight font-[var(--font-fraunces)]">
                        Mumbai News
                    </h1>
                    <p className="text-lg text-stone-500 font-light">
                        Election's latest news!
                    </p>
                </div>

                {newsItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {newsItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                                >
                                    <div className="p-6 flex flex-col h-full justify-between">
                                        <div>
                                            <h2 className="text-2xl font-normal mb-3 leading-tight group-hover:text-stone-600 transition-colors font-[var(--font-fraunces)]">
                                                {item.title}
                                            </h2>
                                            {item.contentSnippet && (
                                                <p className="hidden md:block text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">
                                                    {item.contentSnippet}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-3">
                                            <span className="inline-flex items-center bg-stone-900 text-white text-[10px] px-3 py-1 rounded-md uppercase tracking-widest font-medium">
                                                {item.category}
                                            </span>

                                            <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">
                                                {item.source}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-4">
                                <Link
                                    href={`/news?page=${page - 1}`}
                                    className={`px-4 py-2 border border-stone-200 rounded-md text-sm font-medium transition-colors ${page <= 1
                                        ? 'bg-stone-100 text-stone-400 pointer-events-none'
                                        : 'bg-white hover:bg-stone-50 text-stone-900'
                                        }`}
                                    aria-disabled={page <= 1}
                                >
                                    Previous
                                </Link>

                                <span className="text-stone-600 text-sm">
                                    Page <span className="font-semibold text-stone-900">{page}</span> of {totalPages}
                                </span>

                                <Link
                                    href={`/news?page=${page + 1}`}
                                    className={`px-4 py-2 border border-stone-200 rounded-md text-sm font-medium transition-colors ${page >= totalPages
                                        ? 'bg-stone-100 text-stone-400 pointer-events-none'
                                        : 'bg-white hover:bg-stone-50 text-stone-900'
                                        }`}
                                    aria-disabled={page >= totalPages}
                                >
                                    Next
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                        <p className="text-stone-500">No recent relevant news found. Please check back later.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
