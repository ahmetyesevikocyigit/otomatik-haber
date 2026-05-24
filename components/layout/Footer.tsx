const Footer = () => {
  return (
    <footer className="border-t border-neutral-300 bg-neutral-50 px-4 py-10 text-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-bold">Haber Akışı</div>
          <p className="ui-sans mt-2 max-w-xl text-sm text-neutral-600">
            Otomatik haber toplama, özetleme ve yayınlama altyapısı için hazırlanan Next.js haber vitrini.
          </p>
        </div>
        <div className="ui-sans text-sm font-semibold uppercase tracking-[0.16em] text-neutral-600">
          © 2026 Haber Akışı
        </div>
      </div>
    </footer>
  );
};

export default Footer;
