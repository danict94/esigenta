import { BusinessAccessTab } from "../shell/business-access-tab";
import { Footer } from "../shell/footer";
import { Navbar } from "../shell/navbar";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { Grain } from "./grain";
import { HomeExperience } from "./home-experience";

// Unico punto che possiede l'id del confine hero: lo dichiara e lo passa
// esplicitamente sia a chi renderizza il sentinel sia a chi lo osserva.
const HERO_BOUNDARY_ID = "hero-boundary";

const websiteJsonLd = buildWebsiteJsonLd();
const organizationJsonLd = buildOrganizationJsonLd();

export function HomePage() {
  return (
    <div className="eg-page-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <Grain />
      <Navbar />
      <HomeExperience heroBoundaryId={HERO_BOUNDARY_ID} />
      <Footer />
      <BusinessAccessTab heroBoundaryId={HERO_BOUNDARY_ID} />
    </div>
  );
}
