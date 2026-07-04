import type { FrozenProjectGroup } from "../types/project-group"

export const ristrutturazioni: FrozenProjectGroup = {
  id: "ristrutturazioni",
  slug: "ristrutturazioni",
  name: "Ristrutturazioni",
  interventions: [
    {
      id: "ristrutturare-bagno",
      slug: "ristrutturare-bagno",
      name: "Ristrutturare bagno",
      // Ristrutturazione bagno completa/parziale (progetto edile), distinta da
      // idraulica (rifare-impianto-idraulico-bagno / sostituire-box-doccia).
      aliases: [
        "rifare il bagno",
        "ristrutturare il bagno",
        "ristrutturazione bagno",
        "rifacimento bagno",
        "rifare bagno",
        "ristrutturare bagno completo",
        "rifare bagno completo",
      ],
    },
    {
      id: "ristrutturare-cucina",
      slug: "ristrutturare-cucina",
      name: "Ristrutturare cucina",
      aliases: [
        "rifare la cucina",
        "ristrutturazione cucina",
        "rifacimento cucina",
        "rifare cucina",
        "ristrutturare cucina completa",
        "rifare cucina completa",
      ],
    },
    {
      id: "ristrutturare-casa",
      slug: "ristrutturare-casa",
      name: "Ristrutturare casa",
      // Casa indipendente/villa/villetta + "casa intera" (spostato qui da
      // appartamento: "casa intera" = tutta la casa, non il condominio).
      aliases: [
        "ristrutturazione casa",
        "ristrutturare casa intera",
        "ristrutturazione completa casa",
        "ristrutturare casa indipendente",
        "ristrutturazione casa indipendente",
        "ristrutturare villa",
        "ristrutturazione villa",
        "ristrutturare villetta",
        "ristrutturazione villetta",
      ],
    },
    {
      id: "ristrutturare-appartamento",
      slug: "ristrutturare-appartamento",
      name: "Ristrutturare appartamento",
      // Appartamento in condominio. "ristrutturare casa intera" NON sta qui
      // (rimandato a ristrutturare-casa).
      aliases: [
        "ristrutturazione appartamento",
        "ristrutturare appartamento completo",
        "ristrutturazione completa appartamento",
        "rifare appartamento",
        "ristrutturare casa in condominio",
      ],
    },
  ],
}
