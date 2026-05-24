import Link from "next/link";

const Header = () => {
  const navItems = [
    "Gündem",
    "Siyaset",
    "Dünya",
    "Ekonomi",
    "Futbol",
    "Teknoloji",
    "Kültür",
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-950 bg-white text-neutral-950">
      <div className="border-b border-neutral-200 text-xs font-semibold text-neutral-700">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-2">
          <span>Pazar, 24 Mayıs 2026</span>
          <span className="hidden sm:inline">İstanbul</span>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-5">
        <Link href="/news" className="hidden text-sm font-bold hover:underline sm:inline">
          Son Haberler
        </Link>
        <Link
          href="/"
          className="font-serif text-4xl font-black leading-none tracking-tight sm:text-5xl"
          aria-label="Haber Akışı"
        >
          Haber Akışı
        </Link>
        <div className="justify-self-end text-sm font-bold">
          <Link href="/search" className="hover:underline">
            Ara
          </Link>
        </div>
      </div>
      <nav className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-200 px-4 py-3 text-sm font-semibold">
        {navItems.map((item) => (
          <Link key={item} href="/news" className="hover:underline">
            {item}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
