import Link from "next/link";

export function ProHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 bg-gradient-to-b from-eg-calce from-60% to-transparent px-12 py-6 max-[860px]:px-[22px] max-[860px]:py-[18px]">
      <Link href="/" className="flex items-center gap-[13px] text-eg-terra no-underline" aria-label="Esigenta home" prefetch={false}>
        <img src="/logo%20esigenta.svg" alt="" className="block h-[22px] w-auto" />
        <span className="text-lg font-semibold tracking-[-0.01em]">
          esigenta <small className="font-medium text-eg-cotto-dark">/ pro</small>
        </span>
      </Link>

      <Link
        href="/area-impresa/accedi"
        prefetch={false}
        className="eg-button-ghost min-h-0 px-4 py-2.5 text-[11px] tracking-[0.05em] max-[420px]:px-3 max-[420px]:text-[10px]"
      >
        Ho gia un account
      </Link>
    </header>
  );
}
