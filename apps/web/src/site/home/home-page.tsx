import { cc } from "../shell/palette";
import { Navbar } from "../shell/navbar";
import { Footer } from "../shell/footer";
import { Explosion } from "./explosion";
import { IndexDirectory } from "./index-directory";
import { Moment } from "./moment";
import { Grain } from "./grain";

export function HomePage() {
  return (
    <div style={{ backgroundColor: cc.paper }}>
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
