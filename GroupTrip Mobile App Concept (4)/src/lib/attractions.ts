export const attractions = [
  {
    id: 1,
    name: "Termy Bukowina",
    location: "Bukowina Tatrzańska",
    image: "https://images.unsplash.com/photo-1599875083042-33b9ee13eec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVybWFsJTIwc3BhJTIwcG9vbHxlbnwxfHx8fDE3NjIyMDEzMTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    regularPrice: 89,
    groupPrice: 69,
    minPeople: 15,
    category: "Termy",
    ticketType: "Bilet całodniowy",
    description: "14 basenów termalnych, zjeżdżalnie wodne i sauny z widokiem na Tatry. Temperatura wody 32-36°C."
  },
  {
    id: 2,
    name: "Termy Białka",
    location: "Białka Tatrzańska",
    image: "https://images.unsplash.com/photo-1492485215466-dae7198c66c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBzcHJpbmdzJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjIyMDEzMTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    regularPrice: 79,
    groupPrice: 59,
    minPeople: 15,
    category: "Termy",
    ticketType: "Bilet całodniowy",
    description: "Baseny termalne z atrakcjami wodnymi, groty solne i strefa SPA. Idealne miejsce na relaks."
  },
  {
    id: 3,
    name: "Termy Chochołowskie",
    location: "Chochołów",
    image: "https://images.unsplash.com/photo-1736075506203-1affa08f8f1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBzcHJpbmdzJTIwdGhlcm1hbCUyMHNwYXxlbnwxfHx8fDE3NjE5OTQxNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    regularPrice: 89,
    groupPrice: 69,
    minPeople: 15,
    category: "Termy",
    ticketType: "Bilet całodniowy",
    description: "Największy kompleks w Polsce - 30 basenów, 8 zjeżdżalni i strefa wellness. Ponad 3000 m² powierzchni."
  },
  {
    id: 4,
    name: "Wyciąg Polana Szymoszkowa",
    location: "Zakopane",
    image: "https://images.unsplash.com/photo-1745817238888-f26bbfccd6ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2klMjBsaWZ0JTIwbW91bnRhaW58ZW58MXx8fHwxNzYyMjAxMzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    regularPrice: 120,
    groupPrice: 95,
    minPeople: 15,
    category: "Wyciąg narciarski",
    ticketType: "Karnet całodniowy",
    description: "Stok narciarski w centrum Zakopanego, 5 tras o różnym stopniu trudności. Ośnieżanie i oświetlenie."
  },
  {
    id: 5,
    name: "Wyciąg Bukowina",
    location: "Bukowina Tatrzańska",
    image: "https://images.unsplash.com/photo-1641799540196-fe49811e048e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lpbmclMjBzbG9wZSUyMHdpbnRlcnxlbnwxfHx8fDE3NjIyMDEzMjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    regularPrice: 110,
    groupPrice: 85,
    minPeople: 15,
    category: "Wyciąg narciarski",
    ticketType: "Karnet całodniowy",
    description: "Nowoczesny ośrodek narciarski z 6 wyciągami, sztuczny śnieg i szkoła narciarska. Trasy dla każdego."
  },
  {
    id: 6,
    name: "Wyciąg Białka",
    location: "Białka Tatrzańska",
    image: "https://images.unsplash.com/photo-1610376499511-ad1f5d82fd28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2klMjByZXNvcnQlMjBjaGFpcmxpZnR8ZW58MXx8fHwxNzYyMjAxMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    regularPrice: 100,
    groupPrice: 80,
    minPeople: 15,
    category: "Wyciąg narciarski",
    ticketType: "Karnet całodniowy",
    description: "Rodzinny stok z łagodnymi trasami, snow park dla dzieci i wypożyczalnia sprzętu. Parking przy wyciągu."
  }
];

export type Attraction = typeof attractions[0];

export interface AttractionWithTicketType extends Attraction {
  ticketType: string;
}
