import { Navbar } from "../shell/navbar";
import { Footer } from "../shell/footer";
import { Explosion } from "./explosion";
import { IndexDirectory } from "./index-directory";
import { Moment } from "./moment";
import { Grain } from "./grain";

export function HomePage() {
  return (
    <div className="bg-white">
      <Grain />
      <Navbar />

      <main>
        <Explosion />
        <IndexDirectory />
        <Moment />
      </main>

      <Footer />
    </div>
  );
}
