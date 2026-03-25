import ContentPage from "../../components/ContentPage";
import CatechesisContent from "../../../content/catechesis.md";
import PDFList from "../../components/PDFList";

export default function CatechesisPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <ContentPage>
        <CatechesisContent />
      </ContentPage>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4 mt-8">
          Archive
        </h2>
        <PDFList category="catechesis" />
      </div>
    </div>
  );
}
