import Link from "next/link";

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8">Deriva</div>
      <nav className="flex flex-col gap-4">
        <Link href="/" className="hover:text-gray-300">Dashboard</Link>
        <Link href="/options" className="hover:text-gray-300">Options Chain</Link>
        <Link href="/portfolio" className="hover:text-gray-300">Portfolio</Link>
      </nav>
    </div>
  );
}
