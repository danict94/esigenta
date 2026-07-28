// Segni di registrazione agli angoli di una foto (docs/esigenta-brand
// ServiceCard): una "prova fotografica" allegata alla tavola tecnica, non
// un'immagine lifestyle. Riusato ovunque una foto reale sta dentro il
// linguaggio blueprint — non duplicare i 4 span altrove.
const FRAME_MARK_BASE_CLASSNAME =
  "absolute size-3 border-solid border-eg-brand-strong transition-colors duration-250 ease-(--eg-ease-brand) group-hover:border-eg-accent";

export function FrameMarks() {
  return (
    <>
      <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -top-px -left-px border-t-2 border-l-2`} />
      <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -top-px -right-px border-t-2 border-r-2`} />
      <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${FRAME_MARK_BASE_CLASSNAME} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  );
}
