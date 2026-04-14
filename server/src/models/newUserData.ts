export const itemCategories = [
  {
    name: "Fruit",
    description: "It's a fruit"
  },
  {
    name: "Vegetable",
    description: "You know what a vegetable is, right?"
  },
  {
    name: "Instrument",
    description: "A musical instrument, used to make music (duh)"
  },
  {
    name: "Car",
    description: "Four wheeled vehicle"
  },
  {
    name: "Tractor",
    description: "Four wheeled vehicle of pure traction force"
  },
  {
    name: "Firearm",
    description: "Weapon used to kill :D"
  }
]

export const items = [
  {
    name: "Massey Ferguson MF 6700",
    description: "Renowed tractor model created by the infamous Massey Ferguson trademark"
  },
  {
    name: "Valmet 600",
    description: "Although old, it still does its job as a tractor"
  },
  {
    name: "Roland XPS-10",
    description: null
  },
  {
    name: "Nordstage 4",
    description: "Considered the best musical keyboard of the modern era, it's also one of the most complex professional keyboards available"
  },
  {
    name: "Banana",
    description: null
  },
  {
    name: "Apple",
    description: null
  },
  {
    name: "Glock G17",
    description: null
  }
]

export const categoriesOfItems = [
  {
    item_name: "Massey Ferguson MF 6700",
    category_name: "Tractor"
  },
  {
    item_name: "Valmet 600",
    category_name: "Tractor"
  },
  {
    item_name: "Roland XPS-10",
    category_name: "Instrument"
  },
  {
    item_name: "Nordstage 4",
    category_name: "Instrument"
  },
  {
    item_name: "Banana",
    category_name: "Fruit"
  },
  {
    item_name: "Apple",
    category_name: "Fruit"
  },
  {
    item_name: "Glock G17",
    category_name: "Firearm"
  }
]

export const itemUnits = [
  {
    name: "unit",
    description: "One mustang = 1 unit of a certain car. Ten thousand RTX 5090 = 10.000 units of a certain GPU",
    wikipedia_url: "https://en.wikipedia.org/wiki/1"
  },
  {
    name: "m",
    description: "Meter, internationally used to measure space in one dimention",
    wikipedia_url: null
  },
  {
    name: "m2",
    description: "Square meter, internationally used to measure space in two dimentions",
    wikipedia_url: null
  },
  {
    name: "m3",
    description: "Cubic meter, internationally used to measure space in three dimentions",
    wikipedia_url: null
  },
  {
    name: "in",
    description: null,
    wikipedia_url: null
  },
  {
    name: "kg",
    description: "Kilogram, which measures wheight",
    wikipedia_url: null
  },
  {
    name: "oz",
    description: null,
    wikipedia_url: null
  },
  {
    name: "lb",
    description: null,
    wikipedia_url: null
  }
]

export const entityFranchises = [
  {
    name: "Microsoft Corporation",
    trade: "Microsoft",
    address: "1 Microsoft Way, Bldg 37, Redmond, Washington 98052, United States",
    type: "supplier"
  },
  {
    name: "Microsoft Corporation",
    trade: "Microsoft",
    address: "807, New Delhi House, Barakhamba Road, New Delhi 110001, India",
    type: "service_provider"
  },
  {
    name: "Massey Ferguson Corp.",
    trade: "Massey Ferguson",
    address: "4205 River Green Parkway Duluth, GA 30096, United States",
    type: "supplier"
  },
  {
    name: "Taurus Holdings, Inc.",
    trade: "Taurus",
    address: "16175 Northwest 49 Avenue Miami Lakes, FL 33014, United States",
    type: "supplier"
  },
  {
    name: "Taurus Holdings, Inc.",
    trade: "Taurus",
    address: "Avenida Sao Borja, 2181, Fazenda Sao Borja, Sao Leopoldo, RS, Brazil",
    type: "supplier"
  },
  {
    name: "Nord Keyboards",
    trade: "Nord",
    address: "Clavia Digital Musical Instruments AB, BOX 4214, SE-102 65 Stockholm, Sweden",
    type: "supplier"
  },
  {
    name: "Mark",
    trade: null,
    address: "Mark's house, Canada",
    type: "client"
  }
]

export const unitPriceHistory = [
  {
    item_name: "Glock G17",
    unit_name: "unit",
    price_cents: 55000,
    priced_at: "2025-09-27"
  },
  {
    item_name: "Apple",
    unit_name: "kg",
    price_cents: 75,
    priced_at: "2025-10-09"
  },
  {
    item_name: "Apple",
    unit_name: "kg",
    price_cents: 80,
    priced_at: "2025-12-06"
  },
  {
    item_name: "Nordstage 4",
    unit_name: "unit",
    price_cents: 599900,
    priced_at: "2026-01-01 12:00"
  },
  {
    item_name: "Apple",
    unit_name: "kg",
    price_cents: 90,
    priced_at: "2026-02-02 13:40"
  }
]

export const operations = [
  {
    item_name: "Nordstage 4",
    quantity: 1,
    addressee_entity_name: null,
    addressee_franchise_address: null,
    sendee_entity_name: "Nord Keyboards",
    sendee_franchise_address: "Clavia Digital Musical Instruments AB, BOX 4214, SE-102 65 Stockholm, Sweden",
    shipped_at: "2026-04-01",
    arrived_at: "2026-04-05"
  },
  {
    item_name: "Nordstage 4",
    quantity: 1,
    addressee_entity_name: null,
    addressee_franchise_address: null,
    sendee_entity_name: "Nord Keyboards",
    sendee_franchise_address: "Clavia Digital Musical Instruments AB, BOX 4214, SE-102 65 Stockholm, Sweden",
    shipped_at: "2026-04-02",
    arrived_at: "2026-04-06"
  },
  {
    item_name: "Glock G17",
    quantity: 4,
    addressee_entity_name: null,
    addressee_franchise_address: null,
    sendee_entity_name: null,
    sendee_franchise_address: null,
    shipped_at: null,
    arrived_at: "2026-02-05"
  },
  {
    item_name: "Glock G17",
    quantity: 1,
    addressee_entity_name: "Mark",
    addressee_franchise_address: "Mark's house, Canada",
    sendee_entity_name: null,
    sendee_franchise_address: null,
    shipped_at: "2026-02-10 17:00",
    arrived_at: "2026-02-11 18:00"
  }
]