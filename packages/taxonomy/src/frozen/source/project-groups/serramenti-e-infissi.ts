import type { FrozenProjectGroup } from "../types/project-group"

// Serramenti e infissi (categoria `serramentista`). Finestre/infissi, porte
// interne, porta blindata (come serramento), tapparelle, zanzariere, persiane.
// Confini (NON aggiungere qui): lucernario/finestra da tetto/velux → `tetti`;
// serrature/fabbro/serrande metalliche/inferriate/ringhiere/cancelli → futuro
// `Fabbro, serrande e cancelli`; automazione cancello → citofoni-sicurezza-e-
// smart-home; tende da sole/esterni → fuori scope.
export const serramentiEInfissi: FrozenProjectGroup = {
  id: "serramenti-e-infissi",
  slug: "serramenti-e-infissi",
  name: "Serramenti e infissi",
  interventions: [
    {
      id: "installare-o-sostituire-finestre-infissi",
      slug: "installare-o-sostituire-finestre-infissi",
      name: "Installare o sostituire finestre e infissi",
      // Lucernario / finestra da tetto / velux NON stanno qui: restano in `tetti`.
      aliases: [
        "installare infissi",
        "sostituire infissi",
        "cambiare infissi",
        "nuovi infissi",
        "installare finestre",
        "sostituire finestre",
        "cambiare finestre",
        "infissi pvc",
        "infissi alluminio",
        "infissi legno",
        "finestre pvc",
        "serramenti",
        "serramenti pvc",
        "serramenti alluminio",
        "sostituzione serramenti",
      ],
    },
    {
      id: "installare-porte-interne",
      slug: "installare-porte-interne",
      name: "Installare porte interne",
      // "installare porte interne" NON è alias: normalizzato == slug/name.
      aliases: [
        "porte interne",
        "sostituire porte interne",
        "cambiare porte interne",
        "montare porte interne",
        "porta interna",
        "porte scorrevoli interne",
        "porta scorrevole interno muro",
        "porte a scomparsa",
        "porta a libro",
        "porte filo muro",
      ],
    },
    {
      id: "installare-porta-blindata",
      slug: "installare-porta-blindata",
      name: "Installare porta blindata",
      // La blindata sta qui come prodotto/serramento. Serratura/cilindro/apertura
      // porta bloccata → futuro `Fabbro, serrande e cancelli`.
      // "installare porta blindata" NON è alias: normalizzato == slug/name.
      aliases: [
        "porta blindata",
        "sostituire porta blindata",
        "cambiare porta blindata",
        "montare porta blindata",
        "porta blindata casa",
        "porta blindata appartamento",
        "porta ingresso blindata",
        "portoncino blindato",
        "porta blindata antieffrazione",
      ],
    },
    {
      id: "riparare-o-sostituire-tapparelle",
      slug: "riparare-o-sostituire-tapparelle",
      name: "Riparare o sostituire tapparelle",
      // Tapparelle/avvolgibili domestici. Serrande commerciali/garage/metalliche
      // → futuro `Fabbro, serrande e cancelli`.
      aliases: [
        "riparare tapparelle",
        "sostituire tapparelle",
        "cambiare tapparelle",
        "tapparelle rotte",
        "tapparella bloccata",
        "tapparella rotta",
        "avvolgibili",
        "riparare avvolgibili",
        "sostituire avvolgibili",
        "motorizzare tapparelle",
        "tapparelle elettriche",
        "installare tapparelle",
        "cinghia tapparella",
        "sostituire cinghia tapparella",
      ],
    },
    {
      id: "installare-zanzariere",
      slug: "installare-zanzariere",
      name: "Installare zanzariere",
      // "installare zanzariere" NON è alias: normalizzato == slug/name.
      aliases: [
        "zanzariere",
        "montare zanzariere",
        "sostituire zanzariere",
        "zanzariere su misura",
        "zanzariera finestra",
        "zanzariera porta finestra",
        "zanzariere plissettate",
        "zanzariere scorrevoli",
        "riparare zanzariera",
        "cambiare rete zanzariera",
      ],
    },
    {
      id: "installare-persiane-o-scuri",
      slug: "installare-persiane-o-scuri",
      name: "Installare persiane o scuri",
      aliases: [
        "installare persiane",
        "sostituire persiane",
        "cambiare persiane",
        "persiane",
        "persiane in alluminio",
        "persiane in legno",
        "scuri",
        "installare scuri",
        "sostituire scuri",
        "oscuranti finestre",
        "ante oscuranti",
        "riparare persiane",
      ],
    },
  ],
}
