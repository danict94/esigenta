import { homeProof } from "./home-content";

export function HomeProofSection() {
  return (
    <section className="border-y border-eg-hairline bg-eg-calce" aria-label="Statistiche Esigenta">
      <div className="eg-container grid grid-cols-2 md:grid-cols-4">
        {homeProof.map((item) => (
          <div
            key={item.label}
            className="border-r border-eg-hairline px-7 py-8 even:border-r-0 md:even:border-r md:last:border-r-0"
          >
            <p className="font-mono text-[26px] tracking-[0.02em] text-eg-cotto-dark">{item.number}</p>
            <p className="mt-2 text-sm leading-[1.45] text-eg-ardesia">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
