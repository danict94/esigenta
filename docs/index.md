<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Esigenta — Preventivi da professionisti qualificati</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
<style>

  /* ============ TOKENS ============
     Cianotipo — la base che preferisci, con un'aggiunta: sulla tavola
     blu, qualcuno ha attaccato dei post-it. Sono i pensieri disordinati
     di chi deve ristrutturare (a mano, in Caveat) appuntati sopra la
     precisione del disegno tecnico (IBM Plex). Il contrasto tra i due
     e' la storia: il caos di chi chiede, l'ordine di chi risponde.
  */
  :root{
    --carta: #F1F4F3;
    --carta-forte: #FFFFFF;
    --cianotipo: #16385A;
    --cianotipo-chiaro: #2C7DA0;
    --inchiostro: #12181C;
    --inchiostro-60: rgba(18,24,28,.62);
    --inchiostro-40: rgba(18,24,28,.4);
    --grafite: #B7C4C8;
    --grafite-30: rgba(183,196,200,.35);
    --matita: #C8402A;
    --matita-scura: #A4321F;

    --nota-giallo: #F3E3A0;
    --nota-carta: #FBF8F0;

    --mono: 'IBM Plex Mono', ui-monospace, monospace;
    --sans: 'IBM Plex Sans', system-ui, sans-serif;
    --script: 'Caveat', cursive;

    --container: 1180px;
    --ease: cubic-bezier(.16,1,.3,1);
  }

  *{ box-sizing:border-box; }
  html{ scroll-behavior:smooth; }
  @media (prefers-reduced-motion: reduce){ html{ scroll-behavior:auto; } * { animation:none !important; transition:none !important; } }

  body{
    margin:0;
    background:var(--carta);
    background-image:
      linear-gradient(var(--grafite-30) 1px, transparent 1px),
      linear-gradient(90deg, var(--grafite-30) 1px, transparent 1px);
    background-size: 32px 32px;
    color:var(--inchiostro);
    font-family:var(--sans);
    font-size:16px;
    line-height:1.5;
    -webkit-font-smoothing:antialiased;
  }

  a{ color:inherit; }
  img,svg{ display:block; max-width:100%; }
  ul{ margin:0; padding:0; list-style:none; }
  h1,h2,h3,p{ margin:0; }

  :focus-visible{ outline:2px solid var(--cianotipo-chiaro); outline-offset:3px; }

  .wrap{ max-width:var(--container); margin:0 auto; padding:0 24px; }

  .eyebrow{
    font-family:var(--mono); font-size:12px; letter-spacing:.14em; text-transform:uppercase;
    color:var(--cianotipo-chiaro); display:flex; align-items:center; gap:10px;
  }
  .eyebrow::before{ content:""; width:22px; height:1px; background:var(--cianotipo-chiaro); display:inline-block; }

  .reveal{ opacity:0; transform:translateY(16px); transition:opacity .7s var(--ease), transform .7s var(--ease); }
  .reveal.in{ opacity:1; transform:translateY(0); }
  @media (prefers-reduced-motion: reduce){ .reveal{ opacity:1; transform:none; } }

  /* ============ FRAME MARKS ============ */
  .frame{ position:relative; border:1px solid var(--grafite); }
  .frame::before,.frame::after,
  .frame > .fm-br, .frame > .fm-bl{
    content:""; position:absolute; width:12px; height:12px;
    border-color:var(--cianotipo); border-style:solid;
    transition:border-color .25s var(--ease);
  }
  .frame::before{ top:-1px; left:-1px; border-width:2px 0 0 2px; }
  .frame::after{ top:-1px; right:-1px; border-width:2px 2px 0 0; }
  .frame .fm-bl{ bottom:-1px; left:-1px; border-width:0 0 2px 2px; }
  .frame .fm-br{ bottom:-1px; right:-1px; border-width:0 2px 2px 0; }

  /* ============ HEADER ============ */
  header{
    position:sticky; top:0; z-index:40;
    background:rgba(241,244,243,.92);
    backdrop-filter:blur(6px);
    border-bottom:1px solid var(--grafite);
  }
  .nav{ display:flex; align-items:center; justify-content:space-between; height:72px; }
  .logo{ font-family:var(--mono); font-weight:700; font-size:19px; letter-spacing:.02em; text-decoration:none; display:flex; align-items:center; gap:8px; }
  .logo .dot{ width:8px; height:8px; background:var(--matita); display:inline-block; border-radius:1px; }
  .nav-links{ display:flex; align-items:center; gap:28px; }
  .nav-links a{ font-size:14.5px; text-decoration:none; color:var(--inchiostro-60); transition:color .2s var(--ease); }
  .nav-links a:hover{ color:var(--cianotipo); }
  .btn-outline{
    font-family:var(--mono); font-size:12.5px; letter-spacing:.04em; text-transform:uppercase;
    border:1px solid var(--cianotipo); color:var(--cianotipo) !important;
    padding:9px 16px; text-decoration:none;
    transition:background .2s var(--ease), color .2s var(--ease), transform .2s var(--ease);
  }
  .btn-outline:hover{ background:var(--cianotipo); color:var(--carta-forte) !important; transform:translateY(-1px); }

  /* ============ HERO — la tavola blu con i post-it ============ */
  .hero{
    position:relative;
    background:var(--cianotipo);
    color:var(--carta-forte);
    overflow:hidden;
    padding:132px 0 88px;
    background-image:
      linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
    background-size:32px 32px;
  }
  .hero::after{
    content:"";
    position:absolute; inset:0; z-index:1;
    background:radial-gradient(ellipse at 78% 18%, rgba(44,125,160,.45), transparent 55%);
    pointer-events:none;
  }
  .hero-inner{ position:relative; max-width:720px; z-index:6; }
  .notes-layer{ position:absolute; inset:0; z-index:4; pointer-events:none; }
  .hero .eyebrow{ color:#9FD3E8; }
  .hero .eyebrow::before{ background:#9FD3E8; }
  .hero h1{
    font-family:var(--mono); font-weight:600;
    font-size:clamp(32px, 5vw, 54px); line-height:1.12; letter-spacing:-.01em;
    margin:22px 0 20px;
  }
  .hero h1 em{ font-style:normal; color:#FF8A6E; position:relative; }
  .hero-sub{ font-size:18px; color:rgba(255,255,255,.82); max-width:520px; margin-bottom:40px; }

  .search-panel{
    background:var(--carta-forte);
    padding:6px; display:flex; gap:6px; max-width:560px;
    box-shadow:0 20px 44px -18px rgba(4,16,28,.5);
    transition:box-shadow .3s var(--ease), transform .3s var(--ease);
  }
  .search-panel:focus-within{ box-shadow:0 24px 54px -14px rgba(4,16,28,.6); transform:translateY(-2px); }
  .search-panel input{ flex:1; border:none; outline:none; font-family:var(--sans); font-size:15px; padding:14px 16px; background:transparent; color:var(--inchiostro); }
  .search-panel input::placeholder{ color:var(--inchiostro-40); }
  .search-panel button{
    font-family:var(--mono); font-weight:600; font-size:13px; letter-spacing:.06em;
    background:var(--matita); color:#fff; border:none; padding:0 24px; cursor:pointer;
    display:flex; align-items:center; gap:8px;
    transition:background .2s var(--ease), transform .2s var(--ease);
  }
  .search-panel button:hover{ background:var(--matita-scura); transform:translateX(2px); }

  .hero-note{ margin-top:16px; font-size:13px; font-family:var(--mono); color:rgba(255,255,255,.6); letter-spacing:.02em; }

  .cartiglio{
    position:absolute; right:24px; bottom:0; transform:translateY(50%);
    width:220px; background:var(--carta-forte); border:1px solid var(--grafite);
    box-shadow:0 18px 40px -16px rgba(4,16,28,.4);
    font-family:var(--mono); font-size:11px; color:var(--inchiostro-60);
    z-index:5;
  }
  .cartiglio .row{ display:flex; justify-content:space-between; padding:7px 10px; border-top:1px solid var(--grafite-30); }
  .cartiglio .row:first-child{ border-top:none; background:var(--cianotipo); color:#fff; font-weight:600; letter-spacing:.05em; }
  @media (max-width:900px){ .cartiglio{ display:none; } }

  /* --- post-it appuntati sulla tavola: SEMPRE visibili, si ridimensionano invece di sparire --- */
  .note{
    position:absolute;
    width:clamp(92px, 15vw, 148px);
    padding:clamp(9px,1.6vw,14px) clamp(10px,1.8vw,15px) clamp(11px,2vw,16px);
    font-family:var(--script); font-weight:700;
    font-size:clamp(13px, 1.9vw, 17.5px); line-height:1.16;
    color:var(--inchiostro);
    box-shadow:0 14px 28px -10px rgba(4,16,28,.5);
    pointer-events:auto;
    opacity:0; transform:scale(.85) rotate(var(--rot,0deg));
    animation:pin .55s var(--ease) forwards;
    animation-delay:var(--delay,0s);
  }
  @keyframes pin{ to{ opacity:1; transform:scale(1) rotate(var(--rot,0deg)); } }
  @media (prefers-reduced-motion: reduce){ .note{ opacity:1; transform:rotate(var(--rot,0deg)); animation:none; } }
  .note::before{
    content:""; position:absolute; top:-9px; left:50%; transform:translateX(-50%) rotate(-2deg);
    width:38px; height:14px; background:rgba(255,255,255,.6);
  }
  .note.paper{ background:var(--nota-carta); }
  .note.giallo{ background:var(--nota-giallo); }
  .note .pen{ color:var(--matita); }

  /* fascia alta della hero: sempre dentro il padding superiore, mai sopra il titolo */
  .n1{ --rot:-8deg; --delay:.05s; top:4%; left:4%; }
  .n2{ --rot:5deg;  --delay:.16s; top:0%; left:29%; }
  .n3{ --rot:-6deg; --delay:.27s; top:1%; right:24%; }
  .n4{ --rot:9deg;  --delay:.38s; top:5%; right:3%; }
  .n5{ --rot:-5deg; --delay:.49s; top:36%; right:1%; }
  @media (max-width:900px){ .n5{ display:none; } }
  @media (max-width:480px){ .n2,.n3{ display:none; } }

  /* ============ QUOTA DIVIDER (rimasto disponibile, non usato di default) ============ */
  .quota{ display:flex; align-items:center; gap:14px; color:var(--grafite); margin:0; }
  .quota .line{ flex:1; height:1px; background:var(--grafite); position:relative; }
  .quota .line::before, .quota .line::after{ content:""; position:absolute; top:-5px; width:1px; height:11px; background:var(--grafite); }
  .quota .line::before{ left:0; } .quota .line::after{ right:0; }
  .quota .num{ font-family:var(--mono); font-size:12px; color:var(--inchiostro-40); letter-spacing:.08em; }

  /* ============ SECTION SCAFFOLD ============ */
  section{ padding:96px 0; }
  .section-head{ max-width:640px; margin-bottom:56px; }
  .section-head h2{ font-family:var(--mono); font-weight:600; font-size:clamp(24px,3.4vw,34px); line-height:1.22; margin-top:16px; }

  /* ============ PROCESSO (steps) — con un filo di profondita' in piu' ============ */
  .steps{ display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--grafite); border:1px solid var(--grafite); }
  .step{ background:var(--carta); padding:36px 30px 34px; position:relative; transition:background .25s var(--ease), box-shadow .25s var(--ease); }
  .step:hover{ background:var(--carta-forte); box-shadow:0 18px 34px -22px rgba(18,24,28,.35); z-index:2; }
  .step .n{ font-family:var(--mono); font-size:13px; color:var(--matita); font-weight:700; display:block; margin-bottom:18px; }
  .step h3{ font-family:var(--mono); font-size:17px; font-weight:600; margin-bottom:10px; }
  .step p{ font-size:14.5px; color:var(--inchiostro-60); line-height:1.55; }
  @media (max-width:820px){ .steps{ grid-template-columns:1fr; } }

  /* ============ SERVIZI (cards) ============ */
  .services-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .service-card{
    background:var(--carta-forte); padding:26px 24px 24px;
    text-decoration:none; color:inherit; display:flex; flex-direction:column;
    transition:transform .22s var(--ease), box-shadow .22s var(--ease), border-color .22s var(--ease);
  }
  .service-card:hover{ transform:translateY(-4px); box-shadow:0 24px 46px -22px rgba(18,24,28,.3); }
  .service-card:hover .frame::before, .service-card:hover .frame::after,
  .service-card:hover .fm-bl, .service-card:hover .fm-br{ border-color:var(--matita); }
  .service-card .icon{ width:52px; height:52px; color:var(--cianotipo); margin-bottom:22px; transition:transform .25s var(--ease); }
  .service-card:hover .icon{ transform:scale(1.06) rotate(-2deg); }
  .service-card .tag{ font-family:var(--mono); font-size:11.5px; color:var(--inchiostro-40); letter-spacing:.08em; text-transform:uppercase; margin-bottom:10px; }
  .service-card h3{ font-family:var(--mono); font-size:18px; font-weight:600; margin-bottom:10px; }
  .service-card p{ font-size:14px; color:var(--inchiostro-60); line-height:1.55; flex:1; margin-bottom:20px; }
  .service-card .go{ font-family:var(--mono); font-size:12.5px; font-weight:600; color:var(--matita); letter-spacing:.03em; display:flex; align-items:center; gap:6px; }
  .service-card .go svg{ width:13px; height:13px; transition:transform .2s var(--ease); }
  .service-card:hover .go svg{ transform:translateX(3px); }

  @media (max-width:980px){ .services-grid{ grid-template-columns:repeat(2,1fr); } }
  @media (max-width:620px){ .services-grid{ grid-template-columns:1fr; } }

  .services-footer{ margin-top:40px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; padding-top:28px; border-top:1px solid var(--grafite); }
  .services-footer p{ font-size:14.5px; color:var(--inchiostro-60); }
  .link-arrow{ font-family:var(--mono); font-size:13.5px; font-weight:600; color:var(--cianotipo); text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:gap .2s var(--ease), color .2s var(--ease); }
  .link-arrow:hover{ color:var(--matita); gap:9px; }

  /* ============ PRIMA DI INIZIARE (dark band) ============ */
  .band{ background:var(--inchiostro); color:var(--carta); }
  .band .eyebrow{ color:var(--cianotipo-chiaro); }
  .band .eyebrow::before{ background:var(--cianotipo-chiaro); }
  .band .section-head h2{ color:#fff; }
  .band-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:1px; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.14); }
  .band-item{ background:var(--inchiostro); padding:30px 32px; transition:background .25s var(--ease); }
  .band-item:hover{ background:#1A2228; }
  .band-item h3{ font-family:var(--mono); font-size:15.5px; font-weight:600; margin-bottom:10px; color:#fff; }
  .band-item p{ font-size:14.5px; color:rgba(255,255,255,.62); line-height:1.6; }
  @media (max-width:700px){ .band-grid{ grid-template-columns:1fr; } }

  .band-footer{ margin-top:36px; display:flex; flex-wrap:wrap; gap:12px 28px; align-items:center; font-size:13.5px; color:rgba(255,255,255,.55); font-family:var(--mono); }
  .band-footer a{ color:#9FD3E8; text-decoration:none; }
  .band-footer a:hover{ text-decoration:underline; }
  .band-footer .sep{ opacity:.4; }

  /* ============ FOOTER ============ */
  footer{ background:var(--carta-forte); border-top:1px solid var(--grafite); padding:64px 0 32px; }
  .footer-grid{ display:grid; grid-template-columns:1.4fr repeat(3,1fr); gap:32px; padding-bottom:44px; }
  .footer-brand .logo{ margin-bottom:14px; }
  .footer-brand p{ font-size:13.5px; color:var(--inchiostro-40); max-width:220px; line-height:1.6; }
  .footer-col h4{ font-family:var(--mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--inchiostro-40); margin-bottom:16px; font-weight:600; }
  .footer-col ul li{ margin-bottom:10px; }
  .footer-col a{ font-size:14.5px; text-decoration:none; color:var(--inchiostro-60); transition:color .2s var(--ease); }
  .footer-col a:hover{ color:var(--cianotipo); }
  .footer-bottom{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; padding-top:28px; border-top:1px solid var(--grafite-30); font-family:var(--mono); font-size:12.5px; color:var(--inchiostro-40); }
  .footer-bottom .legal{ display:flex; gap:20px; flex-wrap:wrap; }
  .footer-bottom a{ text-decoration:none; color:var(--inchiostro-40); }
  .footer-bottom a:hover{ color:var(--cianotipo); }

  @media (max-width:900px){ .footer-grid{ grid-template-columns:1fr 1fr; } }
  @media (max-width:600px){
    .footer-grid{ grid-template-columns:1fr; }
    .nav-links{ display:none; }
    section{ padding:64px 0; }
    .hero{ padding:80px 0 72px; }
  }

</style>
</head>
<body>

<header>
  <div class="wrap nav">
    <a href="/" class="logo"><span class="dot"></span>esigenta</a>
    <nav class="nav-links">
      <a href="/servizi">Servizi</a>
      <a href="/richieste/accesso">Le mie richieste</a>
      <a href="/area-impresa/accedi">Accedi</a>
      <a href="/area-impresa" class="btn-outline">Sei un professionista?</a>
    </nav>
  </div>
</header>

<section class="hero">

  <div class="notes-layer">
    <div class="note n1 giallo">chi chiamo<br>per il tetto?!</div>
    <div class="note n2 paper"><span class="pen">urgente!</span><br>perde ancora</div>
    <div class="note n3 giallo">troppi numeri<br>di telefono...</div>
    <div class="note n4 paper">e se sbaglio<br>impresa?</div>
    <div class="note n5 giallo">quanti preventivi<br>chiedo???</div>
  </div>

  <div class="wrap hero-inner">
    <div class="eyebrow">TAV. 01 — HOME</div>
    <h1>Trasformiamo il caos di casa in <em>un percorso</em> chiaro e affidabile.</h1>
    <p class="hero-sub">Descrivi il lavoro, ricevi e confronta proposte da professionisti qualificati.</p>

    <form class="search-panel" onsubmit="return false;">
      <input type="text" placeholder="Di cosa hai bisogno?" aria-label="Di cosa hai bisogno?">
      <button type="submit">CERCA <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form>
    <p class="hero-note">— Gratuita e senza impegno: decidi tu se accettare una proposta.</p>
  </div>

  <div class="cartiglio">
    <div class="row"><span>ESIGENTA</span><span>2026</span></div>
    <div class="row"><span>SCALA</span><span>1:1</span></div>
    <div class="row"><span>STATO</span><span>PREVENTIVO</span></div>
  </div>
</section>

<section aria-labelledby="proc-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Dal bisogno al lavoro</div>
      <h2 id="proc-h">Un filo chiaro, dall'idea alla scelta.</h2>
    </div>

    <div class="steps reveal">
      <div class="step">
        <span class="n">01</span>
        <h3>Descrivi il lavoro</h3>
        <p>Racconta cosa devi fare con parole semplici: bagno, tetto, impianto, energia o clima.</p>
      </div>
      <div class="step">
        <span class="n">02</span>
        <h3>Ricevi risposte adatte</h3>
        <p>Mettiamo ordine nei dettagli e inviamo la richiesta alle imprese adatte, così ricevi risposte chiare e comparabili.</p>
      </div>
      <div class="step">
        <span class="n">OK</span>
        <h3>Scegli con calma</h3>
        <p>Valuta le risposte e scegli chi ti convince, senza obblighi.</p>
      </div>
    </div>
  </div>
</section>

<section aria-labelledby="serv-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Lavori più richiesti</div>
      <h2 id="serv-h">Le richieste che partono più spesso da casa.</h2>
    </div>

    <div class="services-grid reveal">

      <a href="/interventi/ristrutturare-bagno" class="service-card frame">
        <span class="fm-bl"></span><span class="fm-br"></span>
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="20" width="32" height="14" rx="1"/><path d="M8 28h32"/><path d="M14 20v-4a4 4 0 0 1 8 0"/><circle cx="34" cy="26" r="1.4" fill="currentColor" stroke="none"/><path d="M8 34v3M40 34v3"/>
        </svg>
        <span class="tag">01 · Bagno</span>
        <h3>Ristrutturazione bagno</h3>
        <p>Dal rifacimento completo alla sostituzione di sanitari e rivestimenti: una richiesta chiara per partire con il piede giusto.</p>
        <span class="go">SCOPRI IL PERCORSO BAGNO <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a href="/interventi/rifare-tetto" class="service-card frame">
        <span class="fm-bl"></span><span class="fm-br"></span>
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 26 24 10l18 16"/><path d="M12 26v12h24V26"/><path d="M20 30h8v8h-8z"/>
        </svg>
        <span class="tag">02 · Tetto</span>
        <h3>Rifacimento tetto</h3>
        <p>Coperture, infiltrazioni, isolamento e manutenzioni importanti: raccogli i dettagli e raggiungi imprese adatte al lavoro.</p>
        <span class="go">SCOPRI IL PERCORSO TETTO <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a href="/interventi/rifare-impianto-elettrico" class="service-card frame">
        <span class="fm-bl"></span><span class="fm-br"></span>
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M25 6 12 26h9l-3 16 15-22h-9l3-14z" stroke-linejoin="round"/>
        </svg>
        <span class="tag">03 · Impianti</span>
        <h3>Impianto elettrico</h3>
        <p>Adeguamenti, rifacimenti e nuove linee domestiche: trasformi un bisogno tecnico in una richiesta comprensibile.</p>
        <span class="go">SCOPRI IL PERCORSO ELETTRICO <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a href="/interventi/installare-fotovoltaico" class="service-card frame">
        <span class="fm-bl"></span><span class="fm-br"></span>
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="12" width="32" height="20" rx="1"/><path d="M8 20h32M8 26h32M18.6 12v20M29.3 12v20"/>
        </svg>
        <span class="tag">04 · Energia</span>
        <h3>Fotovoltaico</h3>
        <p>Impianti solari, sopralluoghi e configurazioni iniziali: parti dai dati utili e confronti proposte coerenti.</p>
        <span class="go">SCOPRI IL PERCORSO ENERGIA <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

      <a href="/interventi/installare-climatizzatore" class="service-card frame">
        <span class="fm-bl"></span><span class="fm-br"></span>
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="6" y="14" width="36" height="12" rx="2"/><path d="M12 30q3 4 0 8M20 30q3 4 0 8M28 30q3 4 0 8"/>
        </svg>
        <span class="tag">05 · Clima</span>
        <h3>Climatizzazione</h3>
        <p>Installazione o sostituzione del climatizzatore: descrivi ambienti, tempi e necessità senza perdere informazioni.</p>
        <span class="go">SCOPRI IL PERCORSO CLIMA <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>

    </div>

    <div class="services-footer reveal">
      <p>Non trovi il lavoro che ti serve tra questi?</p>
      <a href="/servizi" class="link-arrow">Scopri tutti i servizi <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="band-h">
  <div class="wrap">
    <div class="section-head reveal">
      <div class="eyebrow">Prima di iniziare</div>
      <h2 id="band-h">Cosa succede quando scrivi una richiesta.</h2>
    </div>

    <div class="band-grid reveal">
      <div class="band-item">
        <h3>Chi fa il lavoro</h3>
        <p>Esigenta ti mette in contatto con le imprese; il lavoro lo esegue l'impresa che scegli tu.</p>
      </div>
      <div class="band-item">
        <h3>Non serve sapere il mestiere giusto</h3>
        <p>Descrivi il problema con parole tue: individuiamo noi la categoria di professionista adatta.</p>
      </div>
      <div class="band-item">
        <h3>Nessun costo, nessun obbligo</h3>
        <p>Scrivere una richiesta è gratuito e non ti impegna ad accettare nessuna proposta.</p>
      </div>
      <div class="band-item">
        <h3>La scelta resta tua</h3>
        <p>Confronti le risposte e decidi tu se, come e con chi procedere.</p>
      </div>
    </div>

    <div class="band-footer">
      <span>Guide ai costi già pubblicate:</span>
      <a href="/costi/ristrutturare-bagno">ristrutturare bagno</a>
      <span class="sep">·</span>
      <a href="/costi/rifare-tetto">rifare tetto</a>
      <span class="sep">|</span>
      <a href="/privacy">Come trattiamo i tuoi dati →</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo"><span class="dot"></span>esigenta</a>
        <p>Preventivi da professionisti qualificati per ogni lavoro di casa.</p>
      </div>
      <div class="footer-col">
        <h4>Servizi per la casa</h4>
        <ul>
          <li><a href="/servizi">Tutti i servizi</a></li>
          <li><a href="/servizi/idraulica">Idraulica</a></li>
          <li><a href="/servizi/pavimentazioni">Pavimentazioni</a></li>
          <li><a href="/servizi/serramenti-e-infissi">Serramenti e infissi</a></li>
          <li><a href="/servizi/finiture">Imbianchini e finiture</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Guide e costi</h4>
        <ul><li><a href="/costi">Guide ai costi</a></li></ul>
      </div>
      <div class="footer-col">
        <h4>Per le imprese</h4>
        <ul>
          <li><a href="/area-impresa">Per professionisti e imprese</a></li>
          <li><a href="/area-impresa/accedi">Accedi alla tua area</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 esigenta</span>
      <div class="legal">
        <a href="/privacy">Privacy</a>
        <a href="/cookie-policy">Cookie</a>
        <a href="/termini">Termini</a>
        <a href="#">Preferenze cookie</a>
        <a href="/area-impresa">Sei un professionista?</a>
      </div>
    </div>
  </div>
</footer>

<script>
  (function(){
    var items = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      items.forEach(function(el){ el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold:.15, rootMargin:'0px 0px -60px 0px' });
    items.forEach(function(el){ io.observe(el); });
  })();
</script>

</body>
</html>