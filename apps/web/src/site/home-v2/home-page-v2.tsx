import { cc } from "./palette";
import { Mark } from "./mark";
import { Explosion } from "./explosion";
import { ModuleStack } from "./module-stack";
import { Moment } from "./moment";
import { IndexDirectory } from "./index-directory";
import { Close } from "./close";
import { Grain } from "./grain";

export function HomePageV2() {
  return (
    <div style={{ backgroundColor: cc.paper }}>
      <Grain />
      <Mark />

      <main>
        <Explosion />
        <ModuleStack />
        <Moment />
        <IndexDirectory />
      </main>

      <Close />
    </div>
  );
}
