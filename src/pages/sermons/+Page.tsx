import ContentPage from "../../components/ContentPage";
import SermonsContent from "../../../content/sermons.md";
import SermonPlayer from "../../components/SermonPlayer";

export default function SermonsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <ContentPage>
        <SermonsContent />
      </ContentPage>
      <SermonPlayer />
    </div>
  );
}
