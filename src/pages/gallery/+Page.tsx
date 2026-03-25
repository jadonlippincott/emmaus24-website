import Gallery from "../../components/Gallery";

const images = [
  { src: "/images/exterior.jpg", alt: "Emmaus Lutheran Church exterior" },
  { src: "/images/altar.jpg", alt: "The altar at Emmaus" },
  { src: "/images/nave.jpg", alt: "The nave of the church" },
  { src: "/images/procession.jpg", alt: "Liturgical procession" },
  { src: "/images/sanctuary.jpg", alt: "The sanctuary" },
  { src: "/images/pastor.jpg", alt: "Pastor at the pulpit" },
];

export default function GalleryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
        Photo Gallery
      </h1>
      <p className="text-[var(--color-warm-gray)] mb-8">
        A glimpse of life and worship at Emmaus Evangelical Lutheran Church.
      </p>
      <Gallery images={images} />
    </div>
  );
}
