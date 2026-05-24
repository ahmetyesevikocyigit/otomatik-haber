function SearchPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="border-b-4 border-neutral-950 pb-4">
        <div className="ui-sans text-sm font-bold uppercase tracking-[0.18em] text-neutral-600">
          Arama
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">
          Haber ara
        </h1>
      </div>
      <div className="mt-8 flex border border-neutral-300">
        <input
          className="ui-sans min-w-0 flex-1 px-4 py-3 text-base outline-none"
          placeholder="Baslik, kategori veya anahtar kelime"
        />
        <button className="ui-sans bg-neutral-950 px-5 py-3 text-sm font-bold uppercase text-white">
          Ara
        </button>
      </div>
      <p className="ui-sans mt-4 text-sm text-neutral-500">
        Arama arayüzü hazır. Backend bağlandığında haber indeksinden sonuç getirecek.
      </p>
    </section>
  );
}

export default SearchPage;
