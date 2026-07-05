import { Footer } from "../shell/footer";
import { Navbar } from "../shell/navbar";
import { Grain } from "./grain";
import { HomeExperience } from "./home-experience";

export function HomePage() {
  return (
    <div className="eg-page-bg">
      <Grain />
      <Navbar />
      <HomeExperience />
      <Footer />
    </div>
  );
}
