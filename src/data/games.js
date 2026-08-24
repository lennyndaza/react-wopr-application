export const GAME_LIST = [
  "FALKEN'S MAZE",
  'BLACK JACK',
  'GIN RUMMY',
  'HEARTS',
  'BRIDGE',
  'CHECKERS',
  'CHESS',
  'POKER',
  'FIGHTER COMBAT',
  'GUERRILLA ENGAGEMENT',
  'DESERT WARFARE',
  'AIR-TO-GROUND ACTIONS',
  'THEATERWIDE TACTICAL WARFARE',
  'THEATERWIDE BIOTOXIC AND CHEMICAL WARFARE',
  'TIC-TAC-TOE',
  'GLOBAL THERMONUCLEAR WAR',
]

// Coordinates are percentages (0-100 on both axes), projected from each
// city's real lon/lat through the same equirectangular fit used to build
// USA_OUTLINE / USSR_OUTLINE in mapOutlines.js, so every dot lands on the
// actual landmass rather than floating in empty space.
export const US_TARGETS = [
  { name: 'SEATTLE', x: 4.1, y: 7.3 },
  { name: 'SAN FRANCISCO', x: 3.9, y: 47.8 },
  { name: 'LOS ANGELES', x: 11.2, y: 63.1 },
  { name: 'LAS VEGAS', x: 16.5, y: 54.4 },
  { name: 'DENVER', x: 34.1, y: 39.7 },
  { name: 'CHICAGO', x: 64.2, y: 30.9 },
  { name: 'DETROIT', x: 72.1, y: 29 },
  { name: 'NEW YORK', x: 87.8, y: 35.7 },
  { name: 'WASHINGTON DC', x: 82.5, y: 43.1 },
  { name: 'ATLANTA', x: 69.8, y: 64.3 },
  { name: 'DALLAS', x: 48.3, y: 68.3 },
  { name: 'HOUSTON', x: 50.8, y: 80.7 },
  { name: 'OMAHA', x: 49.8, y: 33.4 },
  { name: 'CHEYENNE', x: 34.4, y: 33.9 },
]

// USSR is represented by Russia's real borders (see mapOutlines.js); MINSK
// and ODESSA (Belarus/Ukraine) sit outside that outline so they're swapped
// for SMOLENSK and KAZAN, both real Russian cities that land on it.
export const USSR_TARGETS = [
  { name: 'MOSCOW', x: 6.8, y: 60.1 },
  { name: 'LENINGRAD', x: 2, y: 48.6 },
  { name: 'SMOLENSK', x: 3.1, y: 62.7 },
  { name: 'VOLGOGRAD', x: 11.3, y: 79.3 },
  { name: 'SVERDLOVSK', x: 21.8, y: 57.1 },
  { name: 'NOVOSIBIRSK', x: 36.4, y: 62 },
  { name: 'VLADIVOSTOK', x: 68.5, y: 94.6 },
  { name: 'MURMANSK', x: 3.8, y: 23.9 },
  { name: 'ROSTOV', x: 8.1, y: 83.3 },
  { name: 'OMSK', x: 30.2, y: 62.1 },
  { name: 'IRKUTSK', x: 50.4, y: 69.5 },
  { name: 'KAZAN', x: 14.3, y: 59.9 },
]
