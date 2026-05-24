function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="border-b-4 border-neutral-950 pb-4">
        <div className="ui-sans text-sm font-bold uppercase tracking-[0.18em] text-neutral-600">
          Hakkında
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">
          Otomatik haber vitrini
        </h1>
      </div>
      <p className="mt-6 text-lg leading-8 text-neutral-700">
        Haber Akışı, otomatik haber toplama ve yayınlama altyapısı için hazırlanan
        Next.js tabanlı bir başlangıç sitesidir. Tasarım; son dakika bandı, kategori
        navigasyonu, büyük manşet ve hızlı haber akışı üzerine kuruldu.
      </p>
    </section>
  );
}

export default AboutPage;
