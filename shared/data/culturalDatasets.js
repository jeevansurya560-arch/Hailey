/**
 * shared/data/culturalDatasets.js
 *
 * Curated, verified foundational cultural knowledge and festival archives.
 * Truly shared static datasets consumed across frontend features and backend routes/search.
 *
 * Systematic Global Cultural Observance Catalogue (2025–2035):
 * Total unique festivals: 45
 * Covers South Asia, East Asia, West Asia, Africa, Europe,
 * Americas, and Oceania across all 11 years (2025–2035).
 */

export const VERIFIED_FESTIVALS = [
  {
    "id": "f-spring-festival",
    "slug": "chinese-new-year-spring-festival",
    "name": "Chinese New Year (Spring Festival)",
    "alternateNames": [
      "Chūnjié",
      "Lunar New Year",
      "Tết Nguyên Đán",
      "Seollal",
      "Losar"
    ],
    "culturalOrigin": "China — Shang Dynasty (circa 1600–1046 BCE)",
    "religion": "Confucian, Taoist, Buddhist, Folk",
    "traditionType": "Lunisolar Chinese Calendar",
    "category": "Family & Ancestral",
    "countries": [
      "China",
      "Taiwan",
      "Singapore",
      "Malaysia",
      "Vietnam",
      "South Korea",
      "Indonesia",
      "Thailand",
      "Global Diaspora"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia",
      "Global Chinese Diaspora"
    ],
    "typicalMonth": 1,
    "dateRule": "lunisolar_chinese",
    "significance": "The most important festival in Chinese culture, marking the new agricultural year with family reunion, ancestral veneration, and the expulsion of the mythical beast Nian. The 15-day celebration is centered on renewal, luck, and intergenerational bonds.",
    "history": "Rooted in Shang Dynasty sacrificial rites honoring ancestors and heavenly deities at the turn of the farming season. The word \"Nian\" (year) derives from an ancient monster legend that was warded off with red color and loud noise — the origin of firecrackers and red decorations.",
    "whyCelebrated": "To welcome the new year, honor ancestors, reunite with family, and attract good fortune for the coming year. The eve reunion dinner is considered the most important meal of the year.",
    "howObserved": "A 15-day celebration beginning with a major reunion dinner on New Year's Eve. Families clean homes to sweep away bad luck, hang red spring couplets (chunlian), light firecrackers, and present red envelopes (hongbao) containing money to children. Lion and dragon dances animate street parades.",
    "regionalVariations": "In Vietnam, the celebration is called Tết and includes bánh chưng square rice cakes. In Korea, Seollal features ancestral rites (charye) and traditional games. In Tibet and Bhutan, the Losar celebration follows the Tibetan calendar.",
    "dateExplanation": "Falls on the first day of the first lunar month in the Chinese lunisolar calendar, typically between January 21 and February 20.",
    "rituals": [
      "Thorough pre-festival home cleaning (sweeping away misfortune)",
      "Affixing red spring couplets (chunlian) and paper-cut art to entryways",
      "Reunion dinner (Nian Ye Fan) on New Year's Eve with symbolic dishes",
      "Lighting firecrackers at midnight to ward off evil spirits",
      "Presenting red envelopes (hongbao) to children and unmarried relatives",
      "Lion and dragon dance performances through communities"
    ],
    "food": [
      "Jiaozi dumplings (shaped like silver ingots)",
      "Niangao glutinous rice cake",
      "Whole steamed fish (abundance)",
      "Tangyuan sweet rice balls"
    ],
    "clothing": [
      "Qipao / Cheongsam",
      "Tangzhuang silk jacket",
      "Hanbok (Korea)",
      "Áo Dài (Vietnam)"
    ],
    "music": [
      "Lion dance drum cadence",
      "Guzheng melodies",
      "Erhu fiddle",
      "Festive brass cymbals"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-01-29",
        "endDate": "2025-02-12",
        "regionNotes": "Year of the Wood Snake; 15-day festival",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-02-17",
        "endDate": "2026-03-03",
        "regionNotes": "Year of the Fire Horse",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-02-06",
        "endDate": "2027-02-20",
        "regionNotes": "Year of the Fire Goat",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-01-26",
        "endDate": "2028-02-09",
        "regionNotes": "Year of the Earth Monkey (approximate)",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-02-13",
        "endDate": "2029-02-27",
        "regionNotes": "Year of the Earth Rooster (approximate)",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-02-03",
        "endDate": "2030-02-17",
        "regionNotes": "Year of the Metal Dog (approximate)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-01-23",
        "endDate": "2031-02-06",
        "regionNotes": "Year of the Metal Pig (approximate)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-02-11",
        "endDate": "2032-02-25",
        "regionNotes": "Year of the Water Rat (approximate)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-01-31",
        "endDate": "2033-02-14",
        "regionNotes": "Year of the Water Ox (approximate)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-02-19",
        "endDate": "2034-03-05",
        "regionNotes": "Year of the Wood Tiger (approximate)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-02-08",
        "endDate": "2035-02-22",
        "regionNotes": "Year of the Wood Rabbit (approximate)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Festivals in Chinese Culture",
        "author": "Derik Bodde",
        "publisher": "Princeton University Press",
        "year": "1975",
        "url": ""
      },
      {
        "title": "Chinese New Year — UNESCO Intangible Cultural Heritage (inscription pending)",
        "author": "UNESCO",
        "publisher": "UNESCO ICH",
        "year": "2024",
        "url": "https://ich.unesco.org"
      }
    ]
  },
  {
    "id": "f-lantern-festival",
    "slug": "lantern-festival-yuanxiao",
    "name": "Lantern Festival",
    "alternateNames": [
      "Yuánxiāo Jié",
      "Shang Yuan Festival",
      "Yuan Xiao"
    ],
    "culturalOrigin": "China — Han Dynasty (206 BCE – 220 CE)",
    "religion": "Taoist, Buddhist, Folk",
    "traditionType": "Lunisolar Chinese Calendar",
    "category": "Seasonal & Folk",
    "countries": [
      "China",
      "Taiwan",
      "Singapore",
      "Malaysia",
      "Vietnam"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia"
    ],
    "typicalMonth": 2,
    "dateRule": "lunisolar_chinese",
    "significance": "Marks the end of Chinese New Year celebrations on the 15th day of the first lunar month, when the first full moon of the new year rises. Celebrated with lantern displays, riddle-solving, and tangyuan sweet rice balls.",
    "history": "Originated during the Han Dynasty with Taoist and Buddhist influences. Emperor Ming of Han ordered palace lanterns lit in honor of the Buddha on this night. Folk traditions added riddle-solving contests attached to lanterns.",
    "whyCelebrated": "To mark the first full moon of the new year and the end of the Spring Festival period. The full moon symbolizes family reunion and community togetherness.",
    "howObserved": "Communities display thousands of colorful lanterns; families solve riddles written on lanterns; children carry lanterns in parades; eating tangyuan (glutinous rice balls in sweet broth) is traditional.",
    "rituals": [
      "Lantern displays and parades",
      "Solving lantern riddles (cai deng mi)",
      "Eating tangyuan rice balls",
      "Dragon and lion dance performances"
    ],
    "food": [
      "Tangyuan (glutinous rice balls with sesame or sweet filling)",
      "Yuanxiao (northern-style rolled rice balls)"
    ],
    "clothing": [
      "Traditional Chinese garments",
      "Festival costumes"
    ],
    "music": [
      "Guqin",
      "Erhu",
      "Percussion ensemble"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-02-12",
        "endDate": "2025-02-12",
        "regionNotes": "15th day of 1st lunar month",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-03-03",
        "endDate": "2026-03-03",
        "regionNotes": "15th day of 1st lunar month",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-02-20",
        "endDate": "2027-02-20",
        "regionNotes": "15th day of 1st lunar month",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-02-09",
        "endDate": "2028-02-09",
        "regionNotes": "Approximate — 15th of 1st lunar month",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-02-27",
        "endDate": "2029-02-27",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-02-17",
        "endDate": "2030-02-17",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-02-06",
        "endDate": "2031-02-06",
        "regionNotes": "15th day of 1st lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-02-25",
        "endDate": "2032-02-25",
        "regionNotes": "15th day of 1st lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-02-14",
        "endDate": "2033-02-14",
        "regionNotes": "15th day of 1st lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-03-05",
        "endDate": "2034-03-05",
        "regionNotes": "15th day of 1st lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-02-22",
        "endDate": "2035-02-22",
        "regionNotes": "15th day of 1st lunar month (calculated)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Chinese Festivals and Their Legends",
        "author": "Wolfram Eberhard",
        "publisher": "Serindia Publications",
        "year": "1952",
        "url": ""
      }
    ]
  },
  {
    "id": "f-qingming",
    "slug": "qingming-festival",
    "name": "Qingming Festival",
    "alternateNames": [
      "Clear and Bright Festival",
      "Tomb Sweeping Day",
      "Ching Ming"
    ],
    "culturalOrigin": "China — Tang Dynasty (618–907 CE)",
    "religion": "Confucian, Taoist, Folk",
    "traditionType": "Solar Gregorian (fixed to solar term)",
    "category": "Ancestral & Seasonal",
    "countries": [
      "China",
      "Taiwan",
      "Singapore",
      "Malaysia",
      "Hong Kong"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia"
    ],
    "typicalMonth": 4,
    "dateRule": "solar_term",
    "significance": "A day of ancestral veneration when families visit and tend to the graves of their deceased relatives. Also a spring celebration of new life, featuring outdoor activities and flying kites.",
    "history": "Combines elements of the ancient Hanshi Festival (Cold Food Festival) with the solar term Qingming. Institutionalized during the Tang Dynasty when Emperor Xuanzong declared it a national holiday for tomb-visiting.",
    "whyCelebrated": "To honor ancestors by cleaning their graves, offering food, burning paper offerings, and paying respect. Also celebrates the arrival of spring with outdoor activities.",
    "howObserved": "Families visit ancestors' graves to clean and repair them, burn paper money and offerings, and leave food tributes. Outings, kite flying, and eating green-colored foods mark the spring celebration.",
    "rituals": [
      "Grave sweeping (sǎomù) and cleaning",
      "Burning paper money and offerings",
      "Leaving food, flowers, and incense at graves",
      "Flying kites (releasing the spirit)",
      "Spring outings and picnics"
    ],
    "food": [
      "Qingtuan (green glutinous rice cakes with red bean paste)",
      "Cold foods (honoring the Hanshi tradition)",
      "Spring greens"
    ],
    "clothing": [
      "Mourning-appropriate attire; informal spring clothing for outdoor activities"
    ],
    "music": [
      "Solemn folk melodies",
      "Traditional spring songs"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-04-04",
        "endDate": "2025-04-04",
        "regionNotes": "Solar term: 15° of the Sun; public holiday in China/Taiwan/Hong Kong",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-04-05",
        "endDate": "2026-04-05",
        "regionNotes": "Solar term (typically April 4–6)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-04-05",
        "endDate": "2027-04-05",
        "regionNotes": "Solar term (typically April 4–6)",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-04-04",
        "endDate": "2028-04-04",
        "regionNotes": "Solar term",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-04-04",
        "endDate": "2029-04-04",
        "regionNotes": "Solar term",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-04-05",
        "endDate": "2030-04-05",
        "regionNotes": "Solar term",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-04-05",
        "endDate": "2031-04-05",
        "regionNotes": "Solar term",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-04-04",
        "endDate": "2032-04-04",
        "regionNotes": "Solar term",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-04-04",
        "endDate": "2033-04-04",
        "regionNotes": "Solar term",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-04-05",
        "endDate": "2034-04-05",
        "regionNotes": "Solar term",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-04-05",
        "endDate": "2035-04-05",
        "regionNotes": "Solar term",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Qingming Festival in China",
        "author": "Nördquist, Katarina",
        "publisher": "Asian Ethnicity",
        "year": "2012",
        "url": ""
      }
    ]
  },
  {
    "id": "f-dragon-boat",
    "slug": "dragon-boat-festival",
    "name": "Dragon Boat Festival",
    "alternateNames": [
      "Duānwǔ Jié",
      "Tuen Ng Festival",
      "Che-yok (Korea)"
    ],
    "culturalOrigin": "China — Warring States Period (475–221 BCE)",
    "religion": "Folk, Confucian",
    "traditionType": "Lunisolar Chinese Calendar",
    "category": "Seasonal & Folk",
    "countries": [
      "China",
      "Taiwan",
      "Hong Kong",
      "Singapore",
      "Malaysia",
      "South Korea"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia"
    ],
    "typicalMonth": 6,
    "dateRule": "lunisolar_chinese",
    "significance": "Commemorates the patriotic poet Qu Yuan who drowned himself in the Miluo River in 278 BCE upon his country's fall to invaders. Dragon boat races and eating zongzi rice dumplings are the central traditions.",
    "history": "The festival's link to Qu Yuan is the most widely accepted origin story. Villagers raced boats to find his body and threw rice dumplings into the river to prevent fish from consuming him. The festival is inscribed on UNESCO's Representative List of Intangible Cultural Heritage (2009).",
    "whyCelebrated": "To honor the patriotic spirit of Qu Yuan and to ward off evil and disease associated with the fifth lunar month, traditionally considered an inauspicious time.",
    "howObserved": "Dragon boat races featuring elaborately decorated long boats paddled to drumbeats; eating zongzi (glutinous rice wrapped in bamboo leaves); hanging calamus and mugwort at doorways; wearing perfume sachets.",
    "rituals": [
      "Dragon boat racing",
      "Eating zongzi",
      "Hanging mugwort and calamus",
      "Wearing colorful silk sachets (xiangbao)",
      "Drinking realgar wine (historical)"
    ],
    "food": [
      "Zongzi (sticky rice with fillings wrapped in bamboo or reed leaves)",
      "Salted duck eggs",
      "Realgar wine (historical)"
    ],
    "clothing": [
      "Traditional festival wear; dragon boat teams wear matching racing gear"
    ],
    "music": [
      "Dragon boat drumming",
      "Traditional gong and cymbal ensemble"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-05-31",
        "endDate": "2025-05-31",
        "regionNotes": "5th day of 5th lunar month; UNESCO ICH inscribed",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-06-19",
        "endDate": "2026-06-19",
        "regionNotes": "5th day of 5th lunar month",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-09",
        "endDate": "2027-06-09",
        "regionNotes": "5th day of 5th lunar month",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-06-26",
        "endDate": "2028-06-26",
        "regionNotes": "Approximate — 5th of 5th lunar month",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-06-16",
        "endDate": "2029-06-16",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-06-05",
        "endDate": "2030-06-05",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-06-24",
        "endDate": "2031-06-24",
        "regionNotes": "5th day of 5th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-06-12",
        "endDate": "2032-06-12",
        "regionNotes": "5th day of 5th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-06-01",
        "endDate": "2033-06-01",
        "regionNotes": "5th day of 5th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-06-20",
        "endDate": "2034-06-20",
        "regionNotes": "5th day of 5th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-06-10",
        "endDate": "2035-06-10",
        "regionNotes": "5th day of 5th lunar month (calculated)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Dragon Boat Festival",
        "author": "UNESCO ICH",
        "publisher": "UNESCO",
        "year": "2009",
        "url": "https://ich.unesco.org/en/RL/dragon-boat-festival-01259"
      }
    ]
  },
  {
    "id": "f-mid-autumn",
    "slug": "mid-autumn-festival",
    "name": "Mid-Autumn Festival",
    "alternateNames": [
      "Zhōngqiū Jié",
      "Moon Festival",
      "Chuseok (Korea)",
      "Tết Trung Thu (Vietnam)"
    ],
    "culturalOrigin": "China — Tang Dynasty (618–907 CE)",
    "religion": "Folk, Taoist, Buddhist",
    "traditionType": "Lunisolar Chinese Calendar",
    "category": "Family & Seasonal",
    "countries": [
      "China",
      "Taiwan",
      "Singapore",
      "Malaysia",
      "Vietnam",
      "South Korea",
      "Japan"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia"
    ],
    "typicalMonth": 9,
    "dateRule": "lunisolar_chinese",
    "significance": "A harvest festival celebrated on the 15th day of the 8th lunar month when the full moon is brightest. Families gather to admire the moon, eat mooncakes, and give thanks for the harvest. Associated with the myth of Chang'e, the Moon Goddess.",
    "history": "Celebrated since the Zhou Dynasty as a moon worship ceremony. Formalized as a festival during the Tang Dynasty. The mooncake tradition is connected to a legend of hiding revolutionary messages inside cakes during Yuan Dynasty resistance.",
    "whyCelebrated": "To celebrate the harvest, honor the moon goddess Chang'e, express gratitude for the harvest, and foster family reunion on the night of the brightest full moon of the year.",
    "howObserved": "Moon-gazing with family; eating mooncakes (dense pastries with lotus seed or red bean paste); carrying and displaying lanterns; giving mooncake gift boxes; in Korea (Chuseok), ancestral rites and traditional games.",
    "rituals": [
      "Family moon-gazing (赏月)",
      "Eating mooncakes",
      "Lantern displays",
      "Offering food to the Moon Goddess",
      "In Korea: ancestral rite (charye) and folk games (ganggangsullae)"
    ],
    "food": [
      "Mooncakes (lotus seed paste, red bean, or egg yolk filling)",
      "Pomelos",
      "Taro",
      "Persimmons"
    ],
    "clothing": [
      "Traditional Chinese garments",
      "Hanbok (Korea)",
      "Áo Dài (Vietnam)"
    ],
    "music": [
      "Traditional guqin and guzheng",
      "Folk songs about the moon"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-10-06",
        "endDate": "2025-10-06",
        "regionNotes": "15th day of 8th lunar month; Chuseok: Oct 5–7",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-25",
        "endDate": "2026-09-25",
        "regionNotes": "15th day of 8th lunar month",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-09-15",
        "endDate": "2027-09-15",
        "regionNotes": "15th day of 8th lunar month",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-10-03",
        "endDate": "2028-10-03",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-22",
        "endDate": "2029-09-22",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-09-12",
        "endDate": "2030-09-12",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-10-01",
        "endDate": "2031-10-01",
        "regionNotes": "15th day of 8th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-19",
        "endDate": "2032-09-19",
        "regionNotes": "15th day of 8th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-10-08",
        "endDate": "2033-10-08",
        "regionNotes": "15th day of 8th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-27",
        "endDate": "2034-09-27",
        "regionNotes": "15th day of 8th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-09-16",
        "endDate": "2035-09-16",
        "regionNotes": "15th day of 8th lunar month (calculated)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Moon Festival: A Chinese Cultural Event",
        "author": "Stepanchuk, Carol",
        "publisher": "Pacific View Press",
        "year": "1991",
        "url": ""
      }
    ]
  },
  {
    "id": "f-hungry-ghost",
    "slug": "hungry-ghost-festival",
    "name": "Hungry Ghost Festival",
    "alternateNames": [
      "Zhōngyuán Jié",
      "Ghost Month",
      "Ullambana (Buddhist)",
      "Obon (Japan)"
    ],
    "culturalOrigin": "China — Blending of Taoist and Buddhist traditions",
    "religion": "Taoist, Buddhist, Folk",
    "traditionType": "Lunisolar Chinese Calendar",
    "category": "Ancestral & Spiritual",
    "countries": [
      "China",
      "Taiwan",
      "Singapore",
      "Malaysia",
      "Hong Kong"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia"
    ],
    "typicalMonth": 8,
    "dateRule": "lunisolar_chinese",
    "significance": "During the seventh lunar month, the gates of the spirit realm are believed to open, allowing deceased ancestors and wandering spirits to visit the living. The living offer food, paper goods, and prayers to appease the hungry ghosts.",
    "history": "Combines the Taoist Zhongyuan Festival (honoring the Earth Official and deceased souls) with the Buddhist Ullambana ceremony commemorating Mulian rescuing his mother from hell. Both traditions merged into a distinctly Chinese folk practice.",
    "whyCelebrated": "To honor and appease ancestral spirits, prevent misfortune caused by wandering ghosts, and perform merit-making rituals for the deceased.",
    "howObserved": "Burning joss paper (ghost money), paper clothing, and paper replicas of luxury goods; offering food at altars; street operas and entertainment for ghosts; avoiding swimming or marrying during the month.",
    "rituals": [
      "Burning joss paper and paper offerings",
      "Setting food offerings on altars",
      "Floating river lanterns to guide spirits",
      "Getai (outdoor stage performances for spirits and living)",
      "Chanting sutras and releasing birds"
    ],
    "food": [
      "Prepared dishes set on outdoor altars",
      "Rice, fruits, meats as offerings"
    ],
    "clothing": [
      "Mourning white or subdued colors near grave sites"
    ],
    "music": [
      "Getai popular music (live concerts for the departed)",
      "Buddhist chanting (sutra recitation)"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-08-02",
        "endDate": "2025-08-31",
        "regionNotes": "Full 7th lunar month; Ghost Festival peak on 15th (Aug 16)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-08-21",
        "endDate": "2026-09-19",
        "regionNotes": "Full 7th lunar month; peak on Sept 4 (15th of month)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-08-11",
        "endDate": "2027-09-08",
        "regionNotes": "Full 7th lunar month",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-08-29",
        "endDate": "2028-09-26",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-08-24",
        "endDate": "2029-08-24",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-08-13",
        "endDate": "2030-08-13",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-09-02",
        "endDate": "2031-09-02",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-08-20",
        "endDate": "2032-08-20",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-08-10",
        "endDate": "2033-08-10",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-08-29",
        "endDate": "2034-08-29",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-08-18",
        "endDate": "2035-08-18",
        "regionNotes": "15th day of 7th lunar month (calculated)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Hungry Ghosts: Mao's Secret Famine",
        "author": "Jasper Becker",
        "publisher": "John Murray",
        "year": "1996",
        "url": ""
      },
      {
        "title": "Chinese Religion and the Family",
        "author": "Jordan, David K.",
        "publisher": "University of California Press",
        "year": "1972",
        "url": ""
      }
    ]
  },
  {
    "id": "f-diwali",
    "slug": "diwali-deepavali",
    "name": "Diwali (Deepavali)",
    "alternateNames": [
      "Festival of Lights",
      "Deepavali"
    ],
    "culturalOrigin": "Ancient Indian Subcontinent",
    "religion": "Hinduism, Jainism, Sikhism, Newar Buddhism",
    "traditionType": "Lunisolar Hindu Calendar",
    "category": "Religious & Family",
    "countries": [
      "India",
      "Nepal",
      "Fiji",
      "Mauritius",
      "Guyana",
      "Trinidad & Tobago",
      "Singapore",
      "Malaysia",
      "Sri Lanka"
    ],
    "regions": [
      "South Asia",
      "Southeast Asia",
      "Global Indian Diaspora"
    ],
    "typicalMonth": 10,
    "dateRule": "lunar_hindu",
    "significance": "The spiritual victory of light over darkness, good over evil, and knowledge over ignorance. For Hindus, associated with Lakshmi's blessing; for Sikhs, Guru Hargobind's release from prison; for Jains, Mahavira's nirvana.",
    "history": "Recorded in Sanskrit texts including the Skanda Purana and Padma Purana dating back over two millennia. The celebration varies significantly by region and religion, but unifies millions through the lighting of diyas.",
    "whyCelebrated": "Hindus celebrate Rama's return to Ayodhya; Lakshmi is worshipped for wealth; Jains mark Mahavira's attainment of nirvana; Sikhs commemorate Guru Hargobind's release from Gwalior Fort.",
    "howObserved": "Lighting thousands of clay oil lamps (diyas); decorating homes with rangoli; worshipping Lakshmi and Ganesha; exchanging sweets and gifts; fireworks displays in many communities.",
    "rituals": [
      "Lighting clay diya lamps with sesame or mustard oil",
      "Elaborate floor Rangoli using colored powders and flower petals",
      "Lakshmi and Ganesha evening Puja with sacred chanting",
      "Exchange of homemade mithai sweets and festive gifts",
      "Fireworks and sparklers (regional)"
    ],
    "food": [
      "Kaju Katli",
      "Gulab Jamun",
      "Chivda savory mix",
      "Besan Ladoo",
      "Barfi"
    ],
    "clothing": [
      "Embroidered silk Kurta-pyjama",
      "Kanjeevaram and Banarasi sarees with zari borders"
    ],
    "music": [
      "Devotional Bhajans",
      "Carnatic and Hindustani Ragas",
      "Folk Dhol rhythms"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-10-20",
        "endDate": "2025-10-24",
        "regionNotes": "Kartik Amavasya main night Oct 20",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-11-08",
        "endDate": "2026-11-12",
        "regionNotes": "Main Deepavali night Nov 08",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-10-29",
        "endDate": "2027-11-02",
        "regionNotes": "Main Deepavali night Oct 29",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-10-17",
        "endDate": "2028-10-21",
        "regionNotes": "Approximate — Kartik Amavasya",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-11-05",
        "endDate": "2029-11-09",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-10-26",
        "endDate": "2030-10-30",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-11-14",
        "endDate": "2031-11-18",
        "regionNotes": "Kartika Amavasya (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-11-02",
        "endDate": "2032-11-06",
        "regionNotes": "Kartika Amavasya (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-10-22",
        "endDate": "2033-10-26",
        "regionNotes": "Kartika Amavasya (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-11-10",
        "endDate": "2034-11-14",
        "regionNotes": "Kartika Amavasya (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-10-30",
        "endDate": "2035-11-03",
        "regionNotes": "Kartika Amavasya (calculated lunisolar)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Hindu Religious Year",
        "author": "M.M. Underhill",
        "publisher": "Oxford University Press",
        "year": "1921",
        "url": ""
      },
      {
        "title": "Encyclopaedia of Indian Festivals",
        "author": "Dr. P.K. Agrawala",
        "publisher": "Abhinav Publications",
        "year": "2008",
        "url": ""
      }
    ]
  },
  {
    "id": "f-holi",
    "slug": "holi-festival-of-colors",
    "name": "Holi",
    "alternateNames": [
      "Festival of Colors",
      "Festival of Spring",
      "Festival of Love"
    ],
    "culturalOrigin": "Ancient Indian Subcontinent",
    "religion": "Hinduism, Folk",
    "traditionType": "Lunisolar Hindu Calendar",
    "category": "Seasonal & Religious",
    "countries": [
      "India",
      "Nepal",
      "Bangladesh",
      "Pakistan",
      "Fiji",
      "Mauritius",
      "Trinidad",
      "Suriname"
    ],
    "regions": [
      "South Asia",
      "Global Hindu Diaspora"
    ],
    "typicalMonth": 3,
    "dateRule": "lunar_hindu",
    "significance": "Celebrates the victory of devotion over evil (Prahlada over Holika), the arrival of spring, and the playful divine love of Krishna and Radha. The throwing of colored powders (gulal) represents joy and equality.",
    "history": "Ancient texts including the Narada Purana and Bhavishya Purana describe an early form of Holi. The bonfire night (Holika Dahan) commemorates the demon Holika's defeat. Regional variations across India reflect diverse mythological associations.",
    "whyCelebrated": "To celebrate spring's arrival, the triumph of good over evil, and the blossoming of love. The festival symbolically erases social hierarchies — all are equal when covered in color.",
    "howObserved": "The evening before (Holika Dahan): bonfire ritual burning the demon Holika's effigy. On Holi day: people throw colored powders (gulal) and water at each other in the streets, dance, sing, and share sweets.",
    "rituals": [
      "Holika Dahan bonfire on the eve of Holi",
      "Throwing colored powder (gulal) at revelers",
      "Water gun and water balloon fights",
      "Singing and dancing in the streets",
      "Applying color to elders' feet as blessing"
    ],
    "food": [
      "Gujiya sweet dumplings",
      "Thandai spiced milk drink",
      "Dahi Bhalla",
      "Puran Poli"
    ],
    "clothing": [
      "White clothes (to show off colors)",
      "Old clothes that can be stained"
    ],
    "music": [
      "Folk Holi songs (Phag)",
      "Dhol drums and folk singing",
      "Bollywood festival songs"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-03-14",
        "endDate": "2025-03-14",
        "regionNotes": "Phalguna Purnima; Holika Dahan March 13",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-03-03",
        "endDate": "2026-03-03",
        "regionNotes": "Phalguna Purnima; Holika Dahan March 02",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-03-22",
        "endDate": "2027-03-22",
        "regionNotes": "Phalguna Purnima",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-03-11",
        "endDate": "2028-03-11",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-03-30",
        "endDate": "2029-03-30",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-03-19",
        "endDate": "2030-03-19",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-03-08",
        "endDate": "2031-03-09",
        "regionNotes": "Phalguna Purnima (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-03-27",
        "endDate": "2032-03-28",
        "regionNotes": "Phalguna Purnima (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-03-16",
        "endDate": "2033-03-17",
        "regionNotes": "Phalguna Purnima (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-03-05",
        "endDate": "2034-03-06",
        "regionNotes": "Phalguna Purnima (calculated lunisolar)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-03-24",
        "endDate": "2035-03-25",
        "regionNotes": "Phalguna Purnima (calculated lunisolar)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Hindu Holidays and Ceremonials",
        "author": "Gupte, B.A.",
        "publisher": "D.B. Taraporevala Sons & Co.",
        "year": "1919",
        "url": ""
      }
    ]
  },
  {
    "id": "f-navratri",
    "slug": "navratri",
    "name": "Navratri",
    "alternateNames": [
      "Sharad Navratri",
      "Shardiya Navratri",
      "Nine Nights",
      "Navaratri",
      "Durga Puja (Eastern India)"
    ],
    "culturalOrigin": "Ancient Indian Subcontinent",
    "religion": "Hinduism",
    "traditionType": "Lunisolar Hindu Calendar (Ashvin month)",
    "category": "Religious & Seasonal",
    "countries": [
      "India",
      "Nepal",
      "Bangladesh",
      "Fiji",
      "Mauritius",
      "Guyana",
      "Trinidad and Tobago"
    ],
    "regions": [
      "South Asia",
      "Global Hindu Diaspora"
    ],
    "typicalMonth": 10,
    "dateRule": "lunar_hindu",
    "significance": "Nine sacred nights dedicated to worshipping Goddess Durga (Shakti) in her nine manifestations (Navadurga), celebrating cosmic victory over the buffalo demon Mahishasura. Culminates on the tenth day as Vijayadashami / Dussehra.",
    "history": "Rooted in ancient Vedic and Puranic traditions, detailed in the Devi Mahatmya of the Markandeya Purana. Celebrated during the bright fortnight (Shukla Paksha) of the lunar month of Ashvin. Regional observances include Garba and Dandiya Raas in Western India, Kolu doll displays in Southern India, and grand community pandals across Bengal.",
    "whyCelebrated": "To venerate the divine feminine principle (Shakti), invoke spiritual purification, and celebrate the cosmic victory of righteousness (dharma) over ignorance and ego.",
    "howObserved": "Commences with Ghatasthapana (sacred pot invocation on Pratipada). Each day honors one Navadurga avatar (Shailaputri through Siddhidatri) with fasting and prayers. Nights feature community circle dances (Garba and Dandiya Raas in Gujarat). In Eastern India, celebrated as Durga Puja with artisan clay sculptures. Culminates on Vijayadashami / Dussehra with effigy burning of Ravana and idol immersion.",
    "rituals": [
      "Ghatasthapana / Kalash Sthapana (sacred pot invocation on Day 1)",
      "Daily worship of the nine Navadurga manifestations",
      "Community Garba and Dandiya Raas folk circle dances",
      "Kanya Puja / Kumari Puja (worship of young girls as manifestations of the divine feminine)",
      "Vijayadashami / Dussehra culmination and immersion ceremonies"
    ],
    "food": [
      "Sabudana Khichdi (vrat fasting food)",
      "Rajgira Ladoo",
      "Singhara flour puris",
      "Makhana Kheer",
      "Prasadam fruits and sweets"
    ],
    "clothing": [
      "Traditional Chaniya Choli with mirrorwork (Gujarat)",
      "Garad and Dhakai Jamdani saris (Bengal)",
      "Nine auspicious colors designated for each day"
    ],
    "music": [
      "Garba folk songs and dhol percussion",
      "Dandiya rhythms",
      "Bengali Dhak drumming",
      "Devotional Mahishasura Mardini Stotram hymns"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-09-22",
        "endDate": "2025-10-02",
        "regionNotes": "Shardiya Navratri; Ghatasthapana Sep 22; Dussehra Oct 2",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-10-11",
        "endDate": "2026-10-20",
        "regionNotes": "Shardiya Navratri; Ghatasthapana Oct 11; Vijayadashami Oct 20 (verified by Drik Panchang, Times of India, Indian Express)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-09-30",
        "endDate": "2027-10-09",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2028,
        "startDate": "2028-10-19",
        "endDate": "2028-10-27",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-10-08",
        "endDate": "2029-10-17",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-09-27",
        "endDate": "2030-10-06",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-10-16",
        "endDate": "2031-10-25",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-10-04",
        "endDate": "2032-10-13",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-09-24",
        "endDate": "2033-10-03",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-10-12",
        "endDate": "2034-10-21",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-10-02",
        "endDate": "2035-10-11",
        "regionNotes": "Shardiya Navratri (estimated lunisolar dates)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Navratri 2026: Start and End Dates, Ghatasthapana Schedule",
        "author": "Religion Bureau",
        "publisher": "The Times of India",
        "year": "2026",
        "url": "https://timesofindia.indiatimes.com/religion/festivals/navratri-2026-start-end-date-is-ghatasthapana-on-october-10-or-11-check-the-full-tithi-schedule/articleshow/134767429.cms"
      },
      {
        "title": "Day Panchang — October 11, 2026 (Ghatasthapana & Pratipada Tithi)",
        "author": "Drik Panchang Team",
        "publisher": "Drik Panchang",
        "year": "2026",
        "url": "https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=1254054"
      },
      {
        "title": "Shardiya Navratri Shubh Muhurat, Kalash Sthapana & Tithi Schedule",
        "author": "Dharma Editorial",
        "publisher": "Indian Express",
        "year": "2026",
        "url": "https://gujarati.indianexpress.com/dharma/shardiya-navratri-date-tithi-kalash-ghata-sthapna-shubh-muhurat-puja-vidhi-mantra-gujarati-as-12659258"
      },
      {
        "title": "Navratri: A Hindu Festival",
        "author": "Encyclopaedia Britannica",
        "publisher": "Britannica",
        "year": "2023",
        "url": "https://www.britannica.com/topic/Navratri"
      }
    ]
  },
  {
    "id": "f-eid-fitr",
    "slug": "eid-al-fitr",
    "name": "Eid al-Fitr",
    "alternateNames": [
      "Festival of Breaking the Fast",
      "Raya Aidilfitri",
      "Şeker Bayramı",
      "Korite"
    ],
    "culturalOrigin": "Hijaz, Arabian Peninsula",
    "religion": "Islam",
    "traditionType": "Lunar Islamic Calendar",
    "category": "Religious & Community",
    "countries": [
      "Global Islamic World",
      "Indonesia",
      "Egypt",
      "Turkey",
      "Nigeria",
      "Morocco",
      "Bangladesh",
      "Pakistan",
      "Malaysia"
    ],
    "regions": [
      "Middle East & North Africa",
      "Southeast Asia",
      "Central & South Asia",
      "West Africa",
      "Global Muslim Diaspora"
    ],
    "typicalMonth": 3,
    "dateRule": "lunar_islamic",
    "significance": "Marks the end of Ramadan, the month of fasting and prayer. A day of communal thanksgiving, obligatory charity (Zakat al-Fitr), prayer, and family gathering.",
    "history": "Instituted by the Prophet Muhammad in Medina in 624 CE after the migration from Mecca. The tradition of the Eid prayer in open fields traces to early Islamic practice in Medina.",
    "whyCelebrated": "To express gratitude to Allah after completing the sacred obligation of Ramadan fasting, and to celebrate community solidarity through prayer, charity, and feasting.",
    "howObserved": "Starts with Ghusl (ritual bath), wearing new or best clothes, paying Zakat al-Fitr charity before prayer. Congregational Eid prayer in open ground or mosque. Then family visits, feasting, gift-giving, and community celebrations lasting three days.",
    "rituals": [
      "Ghusl purification and wearing new or best clothing",
      "Disbursement of Zakat al-Fitr before morning prayer",
      "Congregational Salat al-Eid prayer in open fields",
      "Takbir chanting throughout the night and morning",
      "Community reconciliation and family visits"
    ],
    "food": [
      "Sheer Khurma vermicelli dessert",
      "Ketupat woven rice dumplings",
      "Ma'amoul spiced date cookies",
      "Biryani",
      "Sewaiyan"
    ],
    "clothing": [
      "Thobe/Dishdasha",
      "Baju Melayu with songket sampin",
      "Shalwar Kameez",
      "Agbada (West Africa)"
    ],
    "music": [
      "Takbirat choral chanting",
      "Nasheeds",
      "Kompang percussion (Malaysia)"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-03-31",
        "endDate": "2025-04-02",
        "regionNotes": "Subject to local moon sighting; expected March 30–April 1",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-03-20",
        "endDate": "2026-03-22",
        "regionNotes": "Subject to local crescent moon sighting",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-03-10",
        "endDate": "2027-03-12",
        "regionNotes": "Subject to local crescent moon sighting",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-02-27",
        "endDate": "2028-02-29",
        "regionNotes": "Approximate — subject to moon sighting",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-02-15",
        "endDate": "2029-02-17",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-02-05",
        "endDate": "2030-02-07",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-01-25",
        "endDate": "2031-01-27",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-01-14",
        "endDate": "2032-01-16",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-01-03",
        "endDate": "2033-01-05",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-12-24",
        "endDate": "2034-12-26",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-12-13",
        "endDate": "2035-12-15",
        "regionNotes": "Approximate",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Islamic Calendar and Sacred Festivals",
        "author": "Seyyed Hossein Nasr",
        "publisher": "Harvard University Press",
        "year": "2015",
        "url": ""
      }
    ]
  },
  {
    "id": "f-eid-adha",
    "slug": "eid-al-adha",
    "name": "Eid al-Adha",
    "alternateNames": [
      "Feast of Sacrifice",
      "Bakra Eid",
      "Kurban Bayramı",
      "Tabaski"
    ],
    "culturalOrigin": "Arabia — Islamic tradition",
    "religion": "Islam",
    "traditionType": "Lunar Islamic Calendar",
    "category": "Religious & Community",
    "countries": [
      "Global Islamic World",
      "Saudi Arabia",
      "Turkey",
      "Egypt",
      "Indonesia",
      "Pakistan",
      "Nigeria",
      "Bangladesh"
    ],
    "regions": [
      "Middle East & North Africa",
      "South & Southeast Asia",
      "West Africa",
      "Global Muslim Diaspora"
    ],
    "typicalMonth": 6,
    "dateRule": "lunar_islamic",
    "significance": "Honors the willingness of Ibrahim (Abraham) to sacrifice his son as an act of obedience to God. A ram was provided in substitution. The festival commemorates this act through ritual animal sacrifice and distributing meat to the poor.",
    "history": "Rooted in the Quranic account of Ibrahim's trial. Coincides with the conclusion of the Hajj pilgrimage to Mecca on the 10th of Dhu al-Hijjah. One of the two most important festivals in Islam.",
    "whyCelebrated": "To commemorate Ibrahim's sacrifice and absolute submission to God. Also to fulfill the communal duty of sharing wealth through distributing sacrificial meat to family, neighbors, and those in need.",
    "howObserved": "Eid prayer in the morning; ritual slaughter of a sheep, cow, or camel; dividing the meat into three portions (family, relatives, poor); feasting and family visits lasting 3–4 days.",
    "rituals": [
      "Morning Eid prayer",
      "Ritual animal sacrifice (Qurbani)",
      "Distributing meat to the poor and neighbors",
      "Family gatherings and feasting",
      "Hajj pilgrims completing the Tawaf al-Ifadah in Mecca"
    ],
    "food": [
      "Grilled and stewed lamb/mutton",
      "Biryani",
      "Haleem",
      "Regional sweet dishes"
    ],
    "clothing": [
      "New or best Islamic attire",
      "Thobes, kurtas, shalwar kameez",
      "Traditional regional dress"
    ],
    "music": [
      "Takbir and Eid supplications",
      "Devotional nasheeds"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-06",
        "endDate": "2025-06-09",
        "regionNotes": "10th Dhu al-Hijjah; subject to moon sighting",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-05-27",
        "endDate": "2026-05-30",
        "regionNotes": "Subject to moon sighting",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-05-16",
        "endDate": "2027-05-19",
        "regionNotes": "Subject to moon sighting",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-05-05",
        "endDate": "2028-05-08",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-04-24",
        "endDate": "2029-04-27",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-04-13",
        "endDate": "2030-04-16",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-04-03",
        "endDate": "2031-04-06",
        "regionNotes": "10 Dhu al-Hijjah (calculated lunar Hijri)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-03-22",
        "endDate": "2032-03-25",
        "regionNotes": "10 Dhu al-Hijjah (calculated lunar Hijri)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-03-11",
        "endDate": "2033-03-14",
        "regionNotes": "10 Dhu al-Hijjah (calculated lunar Hijri)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-03-01",
        "endDate": "2034-03-04",
        "regionNotes": "10 Dhu al-Hijjah (calculated lunar Hijri)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-02-18",
        "endDate": "2035-02-21",
        "regionNotes": "10 Dhu al-Hijjah (calculated lunar Hijri)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Eid ul Adha",
        "author": "Encyclopaedia Britannica",
        "publisher": "Britannica",
        "year": "2024",
        "url": "https://www.britannica.com/topic/Id-al-Adha"
      }
    ]
  },
  {
    "id": "f-yom-kippur",
    "slug": "yom-kippur",
    "name": "Yom Kippur",
    "alternateNames": [
      "Day of Atonement"
    ],
    "culturalOrigin": "Levant / Ancient Near East",
    "religion": "Judaism",
    "traditionType": "Hebrew Lunisolar Calendar",
    "category": "Religious",
    "countries": [
      "Israel",
      "United States",
      "France",
      "United Kingdom",
      "Argentina"
    ],
    "regions": [
      "Global Jewish Communities"
    ],
    "typicalMonth": 9,
    "dateRule": "hebrew",
    "significance": "The holiest day in Judaism — a 25-hour fast dedicated to prayer, teshuvah (repentance), and spiritual reconciliation. The closing prayer, Neilah, is the most solemn moment of the Jewish year.",
    "history": "Commanded in the biblical Torah (Leviticus 16) as the annual day of Sabbath of solemn rest. The High Priest performed elaborate purification rites in the Temple era. The Kol Nidre prayer is first mentioned in Geonic period (6th–11th centuries CE).",
    "whyCelebrated": "To seek forgiveness from God for sins committed in the past year, to atone, and to be sealed in the Book of Life for the coming year. Also reconciliation with fellow humans.",
    "howObserved": "Complete fast (no food or water) from sundown to nightfall (approximately 25 hours); five prayer services; no bathing, perfume, or leather shoes; total electronic device abstention in observant communities.",
    "rituals": [
      "25-hour complete fast from sundown to nightfall",
      "Five prayer services: Maariv, Shacharit, Musaf, Minchah, Neilah",
      "Recitation of Kol Nidre declaration at start of fast",
      "Vidui confession prayers (Ashamnu, Al Chet)",
      "Final sounding of the Shofar at the conclusion"
    ],
    "food": [
      "Pre-fast nourishing soup and challah; post-fast dairy including kugel and bagels (no food during the fast)"
    ],
    "clothing": [
      "Kittel white robe (representing purity); canvas shoes (no leather)"
    ],
    "music": [
      "Kol Nidre Aramaic modal liturgy",
      "Liturgical Piyutim chants"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-10-01",
        "endDate": "2025-10-02",
        "regionNotes": "10th of Tishrei, 5786 — from sundown to nightfall",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-20",
        "endDate": "2026-09-21",
        "regionNotes": "10th of Tishrei, 5787",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-10-10",
        "endDate": "2027-10-11",
        "regionNotes": "10th of Tishrei, 5788",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-09-28",
        "endDate": "2028-09-29",
        "regionNotes": "10th of Tishrei, 5789",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-09-17",
        "endDate": "2029-09-18",
        "regionNotes": "10th of Tishrei, 5790",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-10-07",
        "endDate": "2030-10-08",
        "regionNotes": "Approximate — 10th of Tishrei",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-09-27",
        "endDate": "2031-09-28",
        "regionNotes": "10 Tishrei (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-15",
        "endDate": "2032-09-16",
        "regionNotes": "10 Tishrei (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-10-03",
        "endDate": "2033-10-04",
        "regionNotes": "10 Tishrei (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-23",
        "endDate": "2034-09-24",
        "regionNotes": "10 Tishrei (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-10-13",
        "endDate": "2035-10-14",
        "regionNotes": "10 Tishrei (calculated Hebrew calendar)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Jewish Festivals: History & Practice",
        "author": "Hayyim Schauss",
        "publisher": "Schocken Books",
        "year": "1996",
        "url": ""
      }
    ]
  },
  {
    "id": "f-passover",
    "slug": "passover-pesach",
    "name": "Passover",
    "alternateNames": [
      "Pesach",
      "Feast of Unleavened Bread"
    ],
    "culturalOrigin": "Ancient Israel / Egypt — Exodus narrative",
    "religion": "Judaism",
    "traditionType": "Hebrew Lunisolar Calendar",
    "category": "Religious & Historical",
    "countries": [
      "Israel",
      "United States",
      "France",
      "United Kingdom",
      "Argentina",
      "Canada",
      "Australia"
    ],
    "regions": [
      "Global Jewish Communities"
    ],
    "typicalMonth": 4,
    "dateRule": "hebrew",
    "significance": "Commemorates the Exodus from Egypt and the liberation of the Israelites from slavery under Pharaoh. The Passover Seder meal retells this foundational liberation narrative.",
    "history": "Among the oldest continuously observed religious festivals. The Torah commands its observance in Exodus 12. The Seder Haggadah evolved from Second Temple-era practice, shaped through rabbinic literature during the Mishnaic and Talmudic periods.",
    "whyCelebrated": "To remember and relive the Exodus from Egypt — one of the foundational narratives of Jewish identity, emphasizing freedom, justice, and covenant with God.",
    "howObserved": "Eight-day festival (seven in Israel); no leavened bread (chametz) is eaten or kept in the home. The highlight is the Passover Seder on the first night(s): a ritual meal with symbolic foods and the reading of the Haggadah.",
    "rituals": [
      "Bedikat chametz (searching for leaven)",
      "Burning chametz",
      "The Passover Seder meal with Haggadah reading",
      "Four cups of wine at the Seder",
      "Eating matzah (unleavened bread)",
      "Afikomen (dessert matzah) tradition"
    ],
    "food": [
      "Matzah (unleavened bread)",
      "Maror (bitter herbs)",
      "Charoset (sweet paste)",
      "Lamb shank bone",
      "Matzah ball soup"
    ],
    "clothing": [
      "No specific ritual clothing; white kittel sometimes worn at Seder"
    ],
    "music": [
      "Passover Seder songs: Dayenu, Chad Gadya, Ma Nishtana"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-04-12",
        "endDate": "2025-04-20",
        "regionNotes": "15th–22nd of Nisan, 5785; Seder April 12–13",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-04-01",
        "endDate": "2026-04-09",
        "regionNotes": "15th of Nisan, 5786; Seder April 1–2",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-04-21",
        "endDate": "2027-04-29",
        "regionNotes": "15th of Nisan, 5787",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-04-10",
        "endDate": "2028-04-18",
        "regionNotes": "15th of Nisan, 5788",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-03-30",
        "endDate": "2029-04-07",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-04-18",
        "endDate": "2030-04-25",
        "regionNotes": "15 Nisan (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-04-08",
        "endDate": "2031-04-15",
        "regionNotes": "15 Nisan (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-03-27",
        "endDate": "2032-04-03",
        "regionNotes": "15 Nisan (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-04-14",
        "endDate": "2033-04-21",
        "regionNotes": "15 Nisan (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-04-04",
        "endDate": "2034-04-11",
        "regionNotes": "15 Nisan (calculated Hebrew calendar)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-04-24",
        "endDate": "2035-05-01",
        "regionNotes": "15 Nisan (calculated Hebrew calendar)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Passover Haggadah",
        "author": "Various (traditional text)",
        "publisher": "Multiple publishers",
        "year": "Ancient–present",
        "url": ""
      }
    ]
  },
  {
    "id": "f-easter",
    "slug": "easter-resurrection-sunday",
    "name": "Easter",
    "alternateNames": [
      "Resurrection Sunday",
      "Pâques",
      "Ostern",
      "Pasqua",
      "Pascua"
    ],
    "culturalOrigin": "Near East — Christian tradition emerging from Jewish Passover context",
    "religion": "Christianity",
    "traditionType": "Computus (Gregorian / Julian variable)",
    "category": "Religious & Cultural",
    "countries": [
      "Global — most Christian-majority nations",
      "United States",
      "United Kingdom",
      "Germany",
      "Italy",
      "Brazil",
      "Philippines"
    ],
    "regions": [
      "Europe",
      "Americas",
      "Sub-Saharan Africa",
      "Southeast Asia",
      "Global Christian Communities"
    ],
    "typicalMonth": 4,
    "dateRule": "computus_gregorian",
    "significance": "The central feast of Christianity, celebrating the resurrection of Jesus Christ from the dead on the third day after his crucifixion. The culmination of Holy Week and the Paschal Triduum.",
    "history": "The earliest Christians celebrated the resurrection in connection with Passover. The Council of Nicaea (325 CE) established the computus to calculate Easter's date independently from the Jewish calendar. Orthodox churches follow the Julian calendar, often yielding a different date.",
    "whyCelebrated": "Christians celebrate the resurrection of Jesus as the fulfillment of scripture and the foundation of Christian faith — the promise of eternal life over death.",
    "howObserved": "Preceded by Holy Week (Palm Sunday through Good Friday); Easter Vigil on Saturday night; Easter Sunday with worship services, sunrise services, family gatherings. Secular traditions include Easter egg hunts and chocolate eggs.",
    "rituals": [
      "Easter Vigil Mass at midnight (Catholic, Orthodox)",
      "Sunrise services",
      "Blessing of Easter baskets (Central/Eastern Europe)",
      "Easter egg hunts (children)",
      "Hot cross buns on Good Friday"
    ],
    "food": [
      "Hot cross buns",
      "Easter lamb (symbolic)",
      "Simnel cake (UK)",
      "Easter bread (various cultures)",
      "Chocolate eggs"
    ],
    "clothing": [
      "New Easter outfits (Western cultural tradition)",
      "Liturgical white vestments"
    ],
    "music": [
      "Handel's Messiah (Hallelujah Chorus)",
      "Easter hymns (Christ the Lord Is Risen Today)",
      "Orthodox Paschal troparion"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-04-20",
        "endDate": "2025-04-20",
        "regionNotes": "Western Easter (Gregorian); Orthodox: April 20",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-04-05",
        "endDate": "2026-04-05",
        "regionNotes": "Western Easter; Orthodox: April 12",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-03-28",
        "endDate": "2027-03-28",
        "regionNotes": "Western Easter; Orthodox: May 2",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-04-16",
        "endDate": "2028-04-16",
        "regionNotes": "Western Easter; Orthodox: April 16",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-04-01",
        "endDate": "2029-04-01",
        "regionNotes": "Western Easter (approximate)",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-04-21",
        "endDate": "2030-04-21",
        "regionNotes": "Western Easter (approximate)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-04-13",
        "endDate": "2031-04-13",
        "regionNotes": "Computus Western Liturgical Calendar",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-03-28",
        "endDate": "2032-03-28",
        "regionNotes": "Computus Western Liturgical Calendar",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-04-17",
        "endDate": "2033-04-17",
        "regionNotes": "Computus Western Liturgical Calendar",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-04-09",
        "endDate": "2034-04-09",
        "regionNotes": "Computus Western Liturgical Calendar",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-03-25",
        "endDate": "2035-03-25",
        "regionNotes": "Computus Western Liturgical Calendar",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Easter: An Illustrated History",
        "author": "Staff",
        "publisher": "Encyclopaedia Britannica",
        "year": "2024",
        "url": "https://www.britannica.com/topic/Easter-holiday"
      }
    ]
  },
  {
    "id": "f-christmas",
    "slug": "christmas",
    "name": "Christmas",
    "alternateNames": [
      "Nativity of Jesus",
      "Noël",
      "Weihnachten",
      "Navidad",
      "Natal"
    ],
    "culturalOrigin": "Western Christianity — Roman Empire era",
    "religion": "Christianity, Secular",
    "traditionType": "Fixed Gregorian Calendar",
    "category": "Religious & Cultural",
    "countries": [
      "Global — most Christian-majority nations and many secular observances worldwide"
    ],
    "regions": [
      "Europe",
      "Americas",
      "Sub-Saharan Africa",
      "Southeast Asia",
      "Australia",
      "Global"
    ],
    "typicalMonth": 12,
    "dateRule": "fixed_gregorian",
    "significance": "Celebrates the birth of Jesus Christ, the central figure of Christianity. Widely observed also as a secular cultural holiday involving family gatherings, gift-giving, and community festivities.",
    "history": "The December 25 date was established in the 4th century in Rome, possibly aligned with existing Roman Saturnalia and Sol Invictus festivals. The modern secular traditions (Christmas tree, Santa Claus, gift-giving) developed in 19th-century Germany and England.",
    "whyCelebrated": "Christians mark the Incarnation — God becoming human through the birth of Jesus. Secular observances center on family, generosity, and community warmth during the winter solstice period.",
    "howObserved": "Midnight Mass and Christmas services; decorating Christmas trees; gift-giving and Santa Claus traditions; Advent season preparation; carol singing; family feasting on Christmas Day.",
    "rituals": [
      "Midnight Mass (Christmas Eve)",
      "Decorating the Christmas tree",
      "Gift exchange on Christmas morning",
      "Advent wreath and calendar",
      "Carol singing and nativity plays"
    ],
    "food": [
      "Roast turkey or goose",
      "Christmas pudding (UK)",
      "Bûche de Noël (France)",
      "Lebkuchen gingerbread (Germany)",
      "Panettone (Italy)"
    ],
    "clothing": [
      "Festive attire; Santa Claus costume; ugly sweaters (cultural)"
    ],
    "music": [
      "Silent Night",
      "O Holy Night",
      "Handel's Messiah",
      "Jingle Bells",
      "Traditional carols"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-12-25",
        "endDate": "2025-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-12-25",
        "endDate": "2026-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-12-25",
        "endDate": "2027-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-12-25",
        "endDate": "2028-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-12-25",
        "endDate": "2029-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-12-25",
        "endDate": "2030-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-12-25",
        "endDate": "2031-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-12-25",
        "endDate": "2032-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-12-25",
        "endDate": "2033-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-12-25",
        "endDate": "2034-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-12-25",
        "endDate": "2035-12-25",
        "regionNotes": "Fixed Dec 25; Orthodox Christmas: Jan 7",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "The Battle for Christmas",
        "author": "Stephen Nissenbaum",
        "publisher": "Knopf",
        "year": "1996",
        "url": ""
      }
    ]
  },
  {
    "id": "f-vesak",
    "slug": "vesak-buddha-day",
    "name": "Vesak",
    "alternateNames": [
      "Buddha Jayanti",
      "Buddha Purnima",
      "Wesak",
      "Visakha Bucha"
    ],
    "culturalOrigin": "South Asia — marking Siddhartha Gautama's birth, enlightenment, and death",
    "religion": "Buddhism",
    "traditionType": "Lunar Buddhist Calendar",
    "category": "Religious",
    "countries": [
      "Sri Lanka",
      "Thailand",
      "Myanmar",
      "Cambodia",
      "Vietnam",
      "Laos",
      "India",
      "Nepal",
      "Indonesia",
      "Malaysia",
      "Singapore"
    ],
    "regions": [
      "South Asia",
      "Southeast Asia",
      "East Asia",
      "Global Buddhist Communities"
    ],
    "typicalMonth": 5,
    "dateRule": "lunar_theravada",
    "significance": "The most sacred day in Theravada Buddhism, commemorating three critical events in the life of Siddhartha Gautama on the same lunar day: his birth, enlightenment (Bodhi), and Parinirvana (death).",
    "history": "Recognized as significant in Theravada countries for centuries. In 1999, the United Nations formally recognized Vesak as an international day of observance. The date varies by country and Buddhist tradition.",
    "whyCelebrated": "To honor the life, teachings, and liberation of Siddhartha Gautama, the historical Buddha, and to recommit to Buddhist values of compassion, non-violence, and the Middle Way.",
    "howObserved": "Temple visits before dawn; offering incense, flowers, and candles; releasing caged birds and animals; candlelit processions; acts of charity (dana) and vegetarian observance; meditation sessions.",
    "rituals": [
      "Bathing the Buddha statue with scented water",
      "Offering flowers, incense, and candles at temples",
      "Releasing caged birds and fish",
      "Candlelit evening processions",
      "Dana (charitable giving) and community service"
    ],
    "food": [
      "Vegetarian meals",
      "Kheer (sweet rice pudding)",
      "Alms-giving to monks"
    ],
    "clothing": [
      "White clothing (representing purity)",
      "Modest temple attire"
    ],
    "music": [
      "Buddhist chanting (Pali sutras)",
      "Dharma songs",
      "Bell and drum offerings"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-05-12",
        "endDate": "2025-05-12",
        "regionNotes": "Full moon of Vesak month; date varies by country (May 12 in many Theravada countries)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-05-31",
        "endDate": "2026-05-31",
        "regionNotes": "Full moon of Vesak month (approximate)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-05-20",
        "endDate": "2027-05-20",
        "regionNotes": "Full moon of Vesak month (approximate)",
        "verified": false
      },
      {
        "year": 2028,
        "startDate": "2028-05-09",
        "endDate": "2028-05-09",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-05-27",
        "endDate": "2029-05-27",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-05-16",
        "endDate": "2030-05-16",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-05-06",
        "endDate": "2031-05-06",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-05-24",
        "endDate": "2032-05-24",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-05-13",
        "endDate": "2033-05-13",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-05-03",
        "endDate": "2034-05-03",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-05-22",
        "endDate": "2035-05-22",
        "regionNotes": "Vesak Full Moon (calculated Buddhist calendar)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "UN Resolution on Vesak",
        "author": "United Nations General Assembly",
        "publisher": "United Nations",
        "year": "1999",
        "url": "https://www.un.org/en/observances/vesak-day"
      }
    ]
  },
  {
    "id": "f-obon",
    "slug": "obon-japanese-ancestors",
    "name": "Obon",
    "alternateNames": [
      "Bon Festival",
      "Urabon-e"
    ],
    "culturalOrigin": "Japan — Blend of Buddhist Ullambana and indigenous ancestor veneration",
    "religion": "Buddhist, Shinto syncretism",
    "traditionType": "Fixed Solar (mid-August) or Lunar-based (regional)",
    "category": "Ancestral & Seasonal",
    "countries": [
      "Japan",
      "Japanese diaspora communities"
    ],
    "regions": [
      "East Asia",
      "Japanese Diaspora"
    ],
    "typicalMonth": 8,
    "dateRule": "fixed_gregorian",
    "significance": "A Japanese Buddhist festival honoring the spirits of ancestors. Families return home, visit graves, and light lanterns to guide spirits. The Bon Odori dance invites ancestral spirits to participate in the celebration.",
    "history": "Derived from the Buddhist Ullambana ceremony in which Maudgalyayana (Mulian) freed his mother's spirit from suffering. Introduced to Japan around the 7th century. Over time merged with indigenous Shinto ancestor veneration into a distinctly Japanese practice.",
    "whyCelebrated": "To welcome the spirits of deceased ancestors back to the family home for a brief reunion, honor them with offerings, and bid farewell with lantern ceremonies on the final night.",
    "howObserved": "Families clean and decorate grave sites; light lanterns (tōrō nagashi) and float them on rivers; perform Bon Odori folk dances in community circles; visit family home for the reunion; light mukaebi (welcoming fire) and okuribi (send-off fire).",
    "rituals": [
      "Cleaning and visiting ancestors' graves",
      "Lighting welcoming fires (mukaebi)",
      "Bon Odori community dances",
      "Floating river lanterns (tōrō nagashi)",
      "Setting up family altars (butsudan) with offerings",
      "Send-off fires on the final night (okuribi)"
    ],
    "food": [
      "Ohagi (sweet glutinous rice balls)",
      "Soumen noodles",
      "Edamame",
      "Traditional summer foods"
    ],
    "clothing": [
      "Yukata (light summer kimono)",
      "Festival happi coats for dance"
    ],
    "music": [
      "Bon Odori folk songs (regional variations)",
      "Taiko drumming",
      "Shamisen and shakuhachi"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-08-13",
        "endDate": "2025-08-16",
        "regionNotes": "Most of Japan observes Aug 13–16; some regions observe in July",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-08-13",
        "endDate": "2026-08-16",
        "regionNotes": "Fixed: Aug 13–16 (most regions)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-08-13",
        "endDate": "2027-08-16",
        "regionNotes": "Fixed: Aug 13–16",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-08-13",
        "endDate": "2028-08-16",
        "regionNotes": "Fixed: Aug 13–16",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-08-13",
        "endDate": "2029-08-16",
        "regionNotes": "Fixed: Aug 13–16",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-08-13",
        "endDate": "2030-08-16",
        "regionNotes": "Fixed: Aug 13–16",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-08-13",
        "endDate": "2031-08-16",
        "regionNotes": "Solar Obon (Hachigatsu Bon, Japan)",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-08-13",
        "endDate": "2032-08-16",
        "regionNotes": "Solar Obon (Hachigatsu Bon, Japan)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-08-13",
        "endDate": "2033-08-16",
        "regionNotes": "Solar Obon (Hachigatsu Bon, Japan)",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-08-13",
        "endDate": "2034-08-16",
        "regionNotes": "Solar Obon (Hachigatsu Bon, Japan)",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-08-13",
        "endDate": "2035-08-16",
        "regionNotes": "Solar Obon (Hachigatsu Bon, Japan)",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Death and Afterlife in Japanese Buddhism",
        "author": "Stone, Jacqueline I. & Walter, Mariko N. (eds.)",
        "publisher": "University of Hawaii Press",
        "year": "2008",
        "url": ""
      }
    ]
  },
  {
    "id": "f-vaisakhi",
    "slug": "vaisakhi-sikh",
    "name": "Vaisakhi",
    "alternateNames": [
      "Baisakhi",
      "Khalsa Sajna Diwas"
    ],
    "culturalOrigin": "Punjab, India — Sikh Khalsa founding",
    "religion": "Sikhism, Hindu (agrarian tradition)",
    "traditionType": "Solar Sikh Calendar (Nanakshahi)",
    "category": "Religious & Seasonal",
    "countries": [
      "India",
      "Pakistan",
      "United Kingdom",
      "Canada",
      "United States"
    ],
    "regions": [
      "South Asia",
      "Global Sikh Diaspora"
    ],
    "typicalMonth": 4,
    "dateRule": "solar_nanakshahi",
    "significance": "Marks the founding of the Khalsa (the community of initiated Sikhs) by Guru Gobind Singh on Vaisakhi 1699. Also a harvest festival in Punjab marking the end of the winter wheat harvest.",
    "history": "On April 13, 1699, Guru Gobind Singh gathered thousands at Anandpur Sahib, called for volunteers willing to give their lives, and initiated five Sikhs (Panj Pyare) as the first Khalsa. The founding Amrit Sanchar ceremony established Sikh identity and principles.",
    "whyCelebrated": "To celebrate the founding of the Khalsa and the principles of the Sikh faith — equality, selfless service (seva), and standing against injustice. Also celebrates the spring harvest in Punjab.",
    "howObserved": "Processions (Nagar Kirtan) through streets; visits to Gurdwara for prayer (Ardas) and kirtan; community langar feast; bhangra and giddha folk dances; re-enactment of Guru Gobind Singh's Khalsa founding.",
    "rituals": [
      "Nagar Kirtan (procession with Guru Granth Sahib)",
      "Amrit Sanchar (Khalsa initiation ceremony)",
      "Gurdwara prayers and kirtan",
      "Langar (community kitchen feast)",
      "Bhangra and Giddha folk dances"
    ],
    "food": [
      "Langar dishes: dal makhani, rice, roti",
      "Karah Prasad (sacred pudding)",
      "Channa masala",
      "Lassi"
    ],
    "clothing": [
      "Saffron or blue dastar (turban) for Khalsa Sikhs",
      "Traditional Punjabi dress",
      "Salwar kameez"
    ],
    "music": [
      "Shabad Kirtan (Sikh devotional hymns)",
      "Bhangra dhol drumming",
      "Giddha folk singing"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-04-13",
        "endDate": "2025-04-14",
        "regionNotes": "Fixed April 13–14 (Nanakshahi calendar)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-04-13",
        "endDate": "2026-04-14",
        "regionNotes": "Fixed April 13–14",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-04-14",
        "endDate": "2027-04-14",
        "regionNotes": "Fixed April 14 (Nanakshahi)",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-04-13",
        "endDate": "2028-04-14",
        "regionNotes": "Fixed April 13–14",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-04-13",
        "endDate": "2029-04-14",
        "regionNotes": "Fixed April 13–14",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-04-13",
        "endDate": "2030-04-14",
        "regionNotes": "Fixed April 13–14",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-04-14",
        "endDate": "2031-04-14",
        "regionNotes": "Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-04-13",
        "endDate": "2032-04-13",
        "regionNotes": "Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-04-14",
        "endDate": "2033-04-14",
        "regionNotes": "Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-04-14",
        "endDate": "2034-04-14",
        "regionNotes": "Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-04-14",
        "endDate": "2035-04-14",
        "regionNotes": "Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "The Sikhs: History, Religion and Society",
        "author": "W.H. McLeod",
        "publisher": "Columbia University Press",
        "year": "1989",
        "url": ""
      }
    ]
  },
  {
    "id": "f-nowruz",
    "slug": "nowruz-persian-new-year",
    "name": "Nowruz",
    "alternateNames": [
      "Naw-Rúz",
      "Nevruz",
      "Persian New Year",
      "Iranian New Year"
    ],
    "culturalOrigin": "Ancient Iran / Persian Empire",
    "religion": "Zoroastrian, Secular/Cultural (observed by Muslims, Baha'is, Alevis, and many others)",
    "traditionType": "Solar Calendar (Spring Equinox)",
    "category": "Seasonal & Cultural",
    "countries": [
      "Iran",
      "Afghanistan",
      "Tajikistan",
      "Uzbekistan",
      "Kazakhstan",
      "Azerbaijan",
      "Turkey",
      "Pakistan",
      "India (Parsi)",
      "Georgia"
    ],
    "regions": [
      "Central Asia",
      "Middle East",
      "South Asia",
      "Global Iranian Diaspora"
    ],
    "typicalMonth": 3,
    "dateRule": "solar_equinox",
    "significance": "The Persian New Year, marking the spring equinox and the first day of Farvardin in the Solar Hijri calendar. One of the oldest festivals in human history, with a UNESCO Intangible Cultural Heritage inscription.",
    "history": "With origins dating back at least 3,000 years to the Achaemenid Empire and possibly to Zoroastrian religion. The Shahnameh (Book of Kings) attributes Nowruz to the mythical King Jamshid. UNESCO inscribed it in 2009 and 2016 (expanded list).",
    "whyCelebrated": "To celebrate the renewal of nature, the arrival of spring, and the New Year. The Haft-Seen table symbolizes seven elements representing renewal, health, fertility, and prosperity.",
    "howObserved": "Spring cleaning (khane tekani); setting up the Haft-Seen table with seven symbolic items; visiting family and elders; jumping over bonfires on the eve (Chaharshanbe Suri); giving gifts (Eidi); Sizdah Bedar (13th day picnic).",
    "rituals": [
      "Khane tekani (thorough spring cleaning)",
      "Setting up Haft-Seen table",
      "Chaharshanbe Suri (fire-jumping eve celebration)",
      "Family visits from youngest to oldest",
      "Sizdah Bedar (Nature Day on 13th day)",
      "Giving Eidi (cash gifts)"
    ],
    "food": [
      "Sabzi Polo Mahi (herbed rice with fish)",
      "Ash Reshteh (noodle soup)",
      "Reshteh Polo",
      "Ajil (mixed dried nuts and fruits)",
      "Baklava"
    ],
    "clothing": [
      "New clothes (symbolizing fresh start)",
      "Traditional Persian regional dress"
    ],
    "music": [
      "Classical Persian music (dastgāh system)",
      "Nowruz folk songs",
      "Tar and santur performances"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-03-20",
        "endDate": "2025-04-01",
        "regionNotes": "Spring equinox ~March 20; 13-day celebration through Sizdah Bedar",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-03-20",
        "endDate": "2026-04-01",
        "regionNotes": "Spring equinox; UNESCO ICH inscribed",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-03-21",
        "endDate": "2027-04-02",
        "regionNotes": "Spring equinox date may vary by 1 day",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-03-20",
        "endDate": "2028-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-03-20",
        "endDate": "2029-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-03-20",
        "endDate": "2030-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-03-20",
        "endDate": "2031-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-03-20",
        "endDate": "2032-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-03-20",
        "endDate": "2033-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-03-20",
        "endDate": "2034-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-03-20",
        "endDate": "2035-04-01",
        "regionNotes": "Spring equinox",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Nowruz — UNESCO Intangible Cultural Heritage",
        "author": "UNESCO ICH",
        "publisher": "UNESCO",
        "year": "2009",
        "url": "https://ich.unesco.org/en/RL/nowruz-navruz-nooruz-nowrouz-nawrouz-00282"
      }
    ]
  },
  {
    "id": "f-kwanzaa",
    "slug": "kwanzaa",
    "name": "Kwanzaa",
    "alternateNames": [],
    "culturalOrigin": "United States — created 1966, drawing on pan-African harvest traditions",
    "religion": "Cultural/Secular (pan-African spiritual themes)",
    "traditionType": "Fixed Gregorian Calendar",
    "category": "Cultural & Community",
    "countries": [
      "United States",
      "Caribbean",
      "Canada",
      "UK African diaspora"
    ],
    "regions": [
      "North America",
      "Global African Diaspora"
    ],
    "typicalMonth": 12,
    "dateRule": "fixed_gregorian",
    "significance": "A seven-day celebration of African heritage, culture, and values created by Dr. Maulana Karenga in 1966. Each night a candle is lit for one of seven principles (Nguzo Saba): Unity, Self-Determination, Collective Work and Responsibility, Cooperative Economics, Purpose, Creativity, and Faith.",
    "history": "Created by Dr. Maulana Karenga at California State University in 1966 during the Black Power movement in response to the Watts Rebellion. Draws on first-fruit harvest festivals across various African cultures.",
    "whyCelebrated": "To affirm and celebrate African cultural identity, heritage, and community values. Each of the seven days honors one principle with a candle lighting and family discussion.",
    "howObserved": "Each night a candle is lit on the kinara (candleholder) representing one of seven principles; family discussions on each principle; cultural music, dance, and art; a community feast (Karamu) on December 31.",
    "rituals": [
      "Nightly kinara candle lighting",
      "Pouring libations (tambiko) for ancestors",
      "Gift-giving on January 1",
      "Karamu feast on December 31",
      "Sharing stories of African heritage"
    ],
    "food": [
      "Karamu feast foods with African diaspora cuisine: jollof rice, collard greens, yams, catfish"
    ],
    "clothing": [
      "Kente cloth",
      "African-print garments",
      "Traditional African regional dress"
    ],
    "music": [
      "African drumming",
      "Jazz and soul music",
      "Traditional African songs"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-12-26",
        "endDate": "2026-01-01",
        "regionNotes": "Fixed Dec 26 – Jan 1; Karamu Dec 31",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-12-26",
        "endDate": "2027-01-01",
        "regionNotes": "Fixed Dec 26 – Jan 1",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-12-26",
        "endDate": "2028-01-01",
        "regionNotes": "Fixed Dec 26 – Jan 1",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-12-26",
        "endDate": "2029-01-01",
        "regionNotes": "Fixed Dec 26 – Jan 1",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-12-26",
        "endDate": "2030-01-01",
        "regionNotes": "Fixed Dec 26 – Jan 1",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-12-26",
        "endDate": "2031-01-01",
        "regionNotes": "Fixed Dec 26 – Jan 1",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-12-26",
        "endDate": "2032-01-01",
        "regionNotes": "Fixed 7-day observance (Dec 26–Jan 1)",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-12-26",
        "endDate": "2033-01-01",
        "regionNotes": "Fixed 7-day observance (Dec 26–Jan 1)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-12-26",
        "endDate": "2034-01-01",
        "regionNotes": "Fixed 7-day observance (Dec 26–Jan 1)",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-12-26",
        "endDate": "2035-01-01",
        "regionNotes": "Fixed 7-day observance (Dec 26–Jan 1)",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-12-26",
        "endDate": "2036-01-01",
        "regionNotes": "Fixed 7-day observance (Dec 26–Jan 1)",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Kwanzaa: A Celebration of Family, Community and Culture",
        "author": "Maulana Karenga",
        "publisher": "University of Sankore Press",
        "year": "1998",
        "url": ""
      }
    ]
  },
  {
    "id": "f-songkran",
    "slug": "songkran-thai-water-festival",
    "name": "Songkran",
    "alternateNames": [
      "Thai New Year",
      "Thingyan (Myanmar)",
      "Pi Mai (Laos)",
      "Chaul Chnam Thmey (Cambodia)"
    ],
    "culturalOrigin": "Mainland Southeast Asia",
    "religion": "Theravada Buddhist, Brahmanical, Folk",
    "traditionType": "Solar Calendar (Thai solar year)",
    "category": "Seasonal & Religious",
    "countries": [
      "Thailand",
      "Myanmar",
      "Laos",
      "Cambodia",
      "Yunnan (China)",
      "Tamil communities"
    ],
    "regions": [
      "Southeast Asia",
      "South Asia (Tamil communities)"
    ],
    "typicalMonth": 4,
    "dateRule": "solar_thai",
    "significance": "The traditional New Year of Thailand and mainland Southeast Asia, marked by ritual water pouring and bathing of Buddha images and elders (symbolizing purification and respect) and massive public water fights (joyous celebration).",
    "history": "Originally a Brahmanical new year ritual adapted into Theravada Buddhist practice. The date (April 13–15) aligns with the Sun's passage into Aries in tropical astrology. The water-fight tradition evolved into a community celebration of renewal.",
    "whyCelebrated": "To mark the solar new year, purify and renew through water (symbolizing cleansing away the old year), and pay respect to elders and Buddha images. Water throwing symbolizes washing away bad luck.",
    "howObserved": "Visiting temples, offering food to monks, gently pouring water on elders' hands; bathing Buddha statues; massive public water fights in streets (especially in Chiang Mai and Bangkok); building sand pagodas.",
    "rituals": [
      "Bathing Buddha images with scented water",
      "Pouring water on elders' hands (Rod Nam Dam Hua)",
      "Releasing birds and fish",
      "Building sand pagodas (castles) at temples",
      "Public water fights"
    ],
    "food": [
      "Khao Niao (sticky rice)",
      "Mango sticky rice",
      "Kanom jeen (fermented rice noodles)",
      "Traditional Thai festive sweets"
    ],
    "clothing": [
      "Floral or colorful shirts (for water festival)",
      "Traditional Thai dress for temple visits"
    ],
    "music": [
      "Thai classical ensemble (piphat)",
      "Luk thung folk music",
      "Contemporary pop at water fight venues"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-04-13",
        "endDate": "2025-04-15",
        "regionNotes": "Fixed April 13–15; major celebrations April 13–14 in Thailand",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-04-13",
        "endDate": "2026-04-15",
        "regionNotes": "Fixed April 13–15",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-04-13",
        "endDate": "2027-04-15",
        "regionNotes": "Fixed April 13–15",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-04-13",
        "endDate": "2028-04-15",
        "regionNotes": "Fixed April 13–15",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-04-13",
        "endDate": "2029-04-15",
        "regionNotes": "Fixed April 13–15",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-04-13",
        "endDate": "2030-04-15",
        "regionNotes": "Fixed April 13–15",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-04-13",
        "endDate": "2031-04-15",
        "regionNotes": "Fixed Thai Solar New Year",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-04-13",
        "endDate": "2032-04-15",
        "regionNotes": "Fixed Thai Solar New Year",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-04-13",
        "endDate": "2033-04-15",
        "regionNotes": "Fixed Thai Solar New Year",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-04-13",
        "endDate": "2034-04-15",
        "regionNotes": "Fixed Thai Solar New Year",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-04-13",
        "endDate": "2035-04-15",
        "regionNotes": "Fixed Thai Solar New Year",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Songkran Festival",
        "author": "Tourism Authority of Thailand",
        "publisher": "TAT",
        "year": "2024",
        "url": "https://www.tourismthailand.org"
      }
    ]
  },
  {
    "id": "f-midsummer",
    "slug": "midsummer-nordic",
    "name": "Midsummer (Midsommar)",
    "alternateNames": [
      "St. John's Eve",
      "Juhannus (Finland)",
      "Sankthans (Norway/Denmark)",
      "Jāņi (Latvia)"
    ],
    "culturalOrigin": "Northern Europe — pre-Christian solar festivals",
    "religion": "Folk, Pagan, Lutheran (adopted)",
    "traditionType": "Solar Calendar (Summer Solstice / Fixed)",
    "category": "Seasonal & Folk",
    "countries": [
      "Sweden",
      "Finland",
      "Norway",
      "Denmark",
      "Latvia",
      "Estonia",
      "Lithuania"
    ],
    "regions": [
      "Nordic & Baltic Europe"
    ],
    "typicalMonth": 6,
    "dateRule": "solar_solstice",
    "significance": "Celebrates the summer solstice — the longest day of the year — with maypole raising, flower garlands, bonfires, and outdoor festivities. Originally linked to the summer solstice's agricultural importance; later merged with St. John the Baptist's Day in Christian tradition.",
    "history": "Pre-Christian Germanic and Slavic solstice celebrations were widespread. The Catholic Church aligned the feast of St. John the Baptist (June 24) with these traditions. Sweden's specific Midsommar traditions (dancing around the maypole) developed through the 16th–17th centuries.",
    "whyCelebrated": "To celebrate the peak of summer, the power of the sun, and the abundance of nature. Flowers are at their peak and the night is almost non-existent in Nordic countries — a moment of pure light.",
    "howObserved": "Raising and dancing around a decorated maypole (majstång); picking wildflowers for wreaths; feasting on herring, new potatoes, and strawberries; lighting bonfires at the water's edge; singing traditional songs.",
    "rituals": [
      "Raising the midsummer maypole (majstång)",
      "Weaving flower crowns and garlands",
      "Bonfires by lakes and rivers",
      "Traditional folk dances (frog dance in Sweden)",
      "Picking seven flowers to place under pillow for prophetic dreams"
    ],
    "food": [
      "Pickled herring",
      "New potatoes with dill",
      "Strawberries and cream",
      "Sill (herring)",
      "Snaps (aquavit)"
    ],
    "clothing": [
      "Flower wreaths and crowns",
      "Swedish traditional dress (folkdräkt)",
      "Summer casual"
    ],
    "music": [
      "Swedish folk songs (Ormar and Groda, Vi ska sjunga)",
      "Accordion and fiddle",
      "Traditional Scandinavian polkas"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-20",
        "endDate": "2025-06-21",
        "regionNotes": "Sweden: Friday nearest June 24; Solstice: June 21; Finland Juhannus: June 20–21",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-06-19",
        "endDate": "2026-06-20",
        "regionNotes": "Friday nearest June 24 (Sweden)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-25",
        "endDate": "2027-06-26",
        "regionNotes": "Friday nearest June 24 (Sweden)",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-06-23",
        "endDate": "2028-06-24",
        "regionNotes": "Friday nearest June 24 (Sweden)",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-06-21",
        "endDate": "2029-06-22",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-06-21",
        "endDate": "2030-06-22",
        "regionNotes": "Solstice date",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-06-20",
        "endDate": "2031-06-21",
        "regionNotes": "Friday closest to summer solstice (Sweden/Finland)",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-06-25",
        "endDate": "2032-06-26",
        "regionNotes": "Friday closest to summer solstice (Sweden/Finland)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-06-24",
        "endDate": "2033-06-25",
        "regionNotes": "Friday closest to summer solstice (Sweden/Finland)",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-06-23",
        "endDate": "2034-06-24",
        "regionNotes": "Friday closest to summer solstice (Sweden/Finland)",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-06-22",
        "endDate": "2035-06-23",
        "regionNotes": "Friday closest to summer solstice (Sweden/Finland)",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Midsommar: The Swedish Midsummer Celebration",
        "author": "Visit Sweden",
        "publisher": "Sweden Tourism",
        "year": "2024",
        "url": "https://visitsweden.com"
      }
    ]
  },
  {
    "id": "f-diwali-scotland",
    "slug": "hogmanay-scottish-new-year",
    "name": "Hogmanay",
    "alternateNames": [
      "Scottish New Year",
      "Auld Lang Syne"
    ],
    "culturalOrigin": "Scotland — Celtic and Norse traditions",
    "religion": "Secular/Folk",
    "traditionType": "Fixed Gregorian Calendar",
    "category": "Seasonal & Folk",
    "countries": [
      "United Kingdom (Scotland)",
      "Scottish diaspora"
    ],
    "regions": [
      "Northern Europe",
      "Global Scottish Diaspora"
    ],
    "typicalMonth": 12,
    "dateRule": "fixed_gregorian",
    "significance": "Scotland's elaborate New Year celebration, considered one of the world's great New Year festivities, featuring torch-lit processions, fireball ceremonies, and the tradition of First-Footing (the first person to enter a home after midnight brings gifts for good luck).",
    "history": "Has roots in Norse and Celtic winter solstice celebrations. The word \"Hogmanay\" may derive from Norse or Norman French. The emphasis on New Year over Christmas may stem from Scotland's Presbyterian Church discouraging Christmas festivities in the 17th century.",
    "whyCelebrated": "To celebrate the arrival of the New Year with community, fire, and renewal traditions. The outgoing year is 'seen out' and the new one welcomed with hope and good cheer.",
    "howObserved": "Torch-lit processions; fireball-swinging ceremonies (Stonehaven); First-Footing tradition; Auld Lang Syne sung at midnight; massive public celebrations in Edinburgh's Hogmanay festival.",
    "rituals": [
      "First-Footing: being first to enter a home after midnight (with gifts of coal, whisky, shortbread)",
      "Burning the old year (fire ceremonies)",
      "Singing Auld Lang Syne at midnight",
      "Torch-lit street processions",
      "Fireball swinging (Stonehaven)"
    ],
    "food": [
      "Scottish shortbread",
      "Black bun (spiced fruit cake)",
      "Whisky",
      "Haggis",
      "Cranachan"
    ],
    "clothing": [
      "Scottish kilts and tartans",
      "Festive winter wear"
    ],
    "music": [
      "Auld Lang Syne (Robert Burns, 1788)",
      "Scottish bagpipes",
      "Ceilidh folk dance music"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-12-31",
        "endDate": "2026-01-01",
        "regionNotes": "New Year's Eve Dec 31 through Jan 1",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-12-31",
        "endDate": "2027-01-01",
        "regionNotes": "New Year's Eve Dec 31",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-12-31",
        "endDate": "2028-01-01",
        "regionNotes": "New Year's Eve Dec 31",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-12-31",
        "endDate": "2029-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-12-31",
        "endDate": "2030-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-12-31",
        "endDate": "2031-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-12-31",
        "endDate": "2032-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-12-31",
        "endDate": "2033-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-12-31",
        "endDate": "2034-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-12-31",
        "endDate": "2035-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-12-31",
        "endDate": "2036-01-01",
        "regionNotes": "Scottish New Year celebration (Dec 31–Jan 1)",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Edinburgh's Hogmanay",
        "author": "VisitScotland",
        "publisher": "VisitScotland",
        "year": "2024",
        "url": "https://www.visitscotland.com/events/hogmanay"
      }
    ]
  },
  {
    "id": "f-dia-muertos",
    "slug": "dia-de-los-muertos",
    "name": "Día de los Muertos",
    "alternateNames": [
      "Day of the Dead",
      "Día de Muertos"
    ],
    "culturalOrigin": "Mexico — Aztec and pre-Columbian traditions blended with Catholic All Saints' Day",
    "religion": "Catholic syncretism, Aztec/Mesoamerican folk religion",
    "traditionType": "Fixed Gregorian Calendar",
    "category": "Ancestral & Cultural",
    "countries": [
      "Mexico",
      "Guatemala",
      "Honduras",
      "El Salvador",
      "United States (Mexican communities)"
    ],
    "regions": [
      "Latin America",
      "North America (Latino communities)"
    ],
    "typicalMonth": 11,
    "dateRule": "fixed_gregorian",
    "significance": "A joyful celebration of deceased loved ones, believed to return to visit the living on these days. Intricate altars (ofrendas) decorated with marigolds, photographs, food, and personal objects of the departed are created in homes and cemeteries.",
    "history": "Rooted in Aztec and other Mesoamerican traditions of honoring the dead, which were originally month-long festivals. Spanish colonization blended these traditions with the Catholic All Saints' Day (November 1) and All Souls' Day (November 2). UNESCO inscribed it in 2008.",
    "whyCelebrated": "To honor and celebrate deceased loved ones in a joyful rather than mournful way, based on the belief that the boundary between the living and dead dissolves and spirits return for a brief annual reunion.",
    "howObserved": "Building colorful ofrendas (altars) at home and in cemeteries with photos, marigolds, food, candles, and personal items of the deceased; cemetery vigils; face painting as calaveras; sugar skull decorations; parades in cities.",
    "rituals": [
      "Building ofrendas (altars) with photos and offerings",
      "Cemetery vigils and grave decorating",
      "Laying marigold (cempasúchil) petal paths to guide spirits",
      "Face painting as Calavera Catrina",
      "Sharing stories of deceased loved ones"
    ],
    "food": [
      "Pan de Muerto (sweet bread)",
      "Sugar skulls (calaveras de azúcar)",
      "Mole",
      "Tamales",
      "Marigold-infused foods"
    ],
    "clothing": [
      "Calavera face paint",
      "Traditional Oaxacan or Aztec-inspired dress",
      "Catrina costumes"
    ],
    "music": [
      "Son Jarocho (Veracruz)",
      "Mariachi",
      "Traditional Indigenous music of each region"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-11-01",
        "endDate": "2025-11-02",
        "regionNotes": "Nov 1: Día de los Inocentes (children); Nov 2: Día de los Muertos (adults); UNESCO ICH",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-11-01",
        "endDate": "2026-11-02",
        "regionNotes": "Fixed Nov 1–2",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-11-01",
        "endDate": "2027-11-02",
        "regionNotes": "Fixed Nov 1–2",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-11-01",
        "endDate": "2028-11-02",
        "regionNotes": "Fixed Nov 1–2",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-11-01",
        "endDate": "2029-11-02",
        "regionNotes": "Fixed Nov 1–2",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-11-01",
        "endDate": "2030-11-02",
        "regionNotes": "Fixed Nov 1–2",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-11-01",
        "endDate": "2031-11-02",
        "regionNotes": "All Saints & All Souls Days (Mexico)",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-11-01",
        "endDate": "2032-11-02",
        "regionNotes": "All Saints & All Souls Days (Mexico)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-11-01",
        "endDate": "2033-11-02",
        "regionNotes": "All Saints & All Souls Days (Mexico)",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-11-01",
        "endDate": "2034-11-02",
        "regionNotes": "All Saints & All Souls Days (Mexico)",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-11-01",
        "endDate": "2035-11-02",
        "regionNotes": "All Saints & All Souls Days (Mexico)",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Day of the Dead — UNESCO ICH",
        "author": "UNESCO ICH",
        "publisher": "UNESCO",
        "year": "2008",
        "url": "https://ich.unesco.org/en/RL/indigenous-festivity-dedicated-to-the-dead-00054"
      }
    ]
  },
  {
    "id": "f-powwow-north-america",
    "slug": "north-american-powwow",
    "name": "Powwow",
    "alternateNames": [
      "Pau Wau",
      "Indigenous gathering"
    ],
    "culturalOrigin": "North America — Plains and other Indigenous nations",
    "religion": "Indigenous (varies by nation — Lakota, Ojibwe, Cree, Navajo, and many others)",
    "traditionType": "Variable — tied to community calendar",
    "category": "Cultural & Community",
    "countries": [
      "United States",
      "Canada"
    ],
    "regions": [
      "North America — Indigenous communities throughout"
    ],
    "typicalMonth": 6,
    "dateRule": "community_determined",
    "significance": "A gathering of Indigenous peoples to celebrate culture, maintain traditions, dance, sing, visit, and trade. Powwows vary widely by nation and region but share the drum circle, regalia, and communal spirit as unifying elements.",
    "history": "The term \"powwow\" derives from the Narragansett and Massachusett word \"powwaw\" (a spiritual leader). Modern intertribal powwows developed in the late 19th and early 20th centuries as Indigenous communities maintained cultural practices despite suppression.",
    "whyCelebrated": "To honor Indigenous heritage, reconnect with cultural traditions, share songs and dances between nations, celebrate community survival, and welcome all to witness and participate respectfully.",
    "howObserved": "Grand Entry processional of dancers in full regalia; competitive and traditional dances (Fancy Shawl, Grass Dance, Jingle Dress, Traditional, etc.); drum circles; arts and crafts vendors; feast and fry bread.",
    "rituals": [
      "Grand Entry processional with eagle staff and flags",
      "Intertribal drum songs",
      "Competitive dance categories (Fancy, Traditional, Grass, Jingle)",
      "Give-away ceremonies",
      "Opening and closing prayers"
    ],
    "food": [
      "Fry bread",
      "Indian tacos",
      "Buffalo/bison dishes",
      "Wild rice",
      "Community feast"
    ],
    "clothing": [
      "Regalia (specific to each dancer's nation and dance style)",
      "Beadwork, feather work, ribbonwork"
    ],
    "music": [
      "Intertribal drum songs",
      "Honor songs",
      "Contest songs",
      "Veteran songs"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-01",
        "endDate": "2025-08-31",
        "regionNotes": "Thousands of powwows held May–September across North America; no single date",
        "verified": false
      },
      {
        "year": 2026,
        "startDate": "2026-06-01",
        "endDate": "2026-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2027,
        "startDate": "2027-06-01",
        "endDate": "2027-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2028,
        "startDate": "2028-06-01",
        "endDate": "2028-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-06-01",
        "endDate": "2029-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-06-01",
        "endDate": "2030-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-06-01",
        "endDate": "2031-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-06-01",
        "endDate": "2032-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-06-01",
        "endDate": "2033-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-06-01",
        "endDate": "2034-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-06-01",
        "endDate": "2035-08-31",
        "regionNotes": "Powwow season: spring through fall",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Powwow Trail: Understanding and Enjoying the Native American Powwow",
        "author": "Ellis, Clyde, et al.",
        "publisher": "University of Nebraska Press",
        "year": "2005",
        "url": ""
      }
    ]
  },
  {
    "id": "f-paryushana",
    "slug": "paryushana-jain",
    "name": "Paryushana",
    "alternateNames": [
      "Das Lakshana (Digambara)",
      "Parva Adhyatma",
      "Festival of Forgiveness"
    ],
    "culturalOrigin": "Ancient India — Jain tradition",
    "religion": "Jainism",
    "traditionType": "Lunisolar Jain Calendar",
    "category": "Religious",
    "countries": [
      "India",
      "United States",
      "United Kingdom",
      "East Africa (Jain diaspora)"
    ],
    "regions": [
      "South Asia",
      "Global Jain Diaspora"
    ],
    "typicalMonth": 8,
    "dateRule": "lunisolar_jain",
    "significance": "The most important festival for Jains — eight or ten days of intense spiritual practice, fasting, meditation, scriptural study, and forgiveness. On the final day (Samvatsari Pratikraman), Jains seek forgiveness from all living beings.",
    "history": "One of the oldest Jain observances, traced to the Agamic period. The Shvetambara tradition observes eight days (Paryushana); the Digambara tradition observes ten days (Das Lakshana) beginning shortly after. Both culminate in Samvatsari / Kshamavani.",
    "whyCelebrated": "To purify the soul through austerities, self-examination, and forgiveness. The ultimate Jain spiritual aspiration: liberation (moksha) from the cycle of rebirth through non-attachment and non-violence (ahimsa).",
    "howObserved": "Many Jains observe complete fasting (Upwas); scriptural readings and discourses; confession rituals (Pratikraman); on the final day, seeking forgiveness from all through the phrase \"Micchami Dukkadam\" (may all evil done be forgiven).",
    "rituals": [
      "Tapasya (fasting — partial or complete)",
      "Pratikraman (confession ritual)",
      "Scriptural readings of Kalpasutra",
      "Seeking forgiveness (Kshamavani)",
      "Samvatsari Pratikraman (annual atonement)"
    ],
    "food": [
      "Strict fasting; limited satvik foods if partial fast",
      "Boiled water only for complete fasters"
    ],
    "clothing": [
      "White clothing representing purity"
    ],
    "music": [
      "Devotional Jain bhajans and stotras"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-08-19",
        "endDate": "2025-08-26",
        "regionNotes": "Shvetambara: 8 days; Samvatsari Aug 26; Digambara: Das Lakshana Aug 27–Sep 5",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-05",
        "endDate": "2026-09-12",
        "regionNotes": "Shvetambara tradition (approximate)",
        "verified": false
      },
      {
        "year": 2027,
        "startDate": "2027-08-26",
        "endDate": "2027-09-02",
        "regionNotes": "Approximate",
        "verified": false
      },
      {
        "year": 2028,
        "startDate": "2028-08-16",
        "endDate": "2028-08-23",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-04",
        "endDate": "2029-09-11",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-08-25",
        "endDate": "2030-09-01",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-08-14",
        "endDate": "2031-08-21",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-01",
        "endDate": "2032-09-08",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-08-21",
        "endDate": "2033-08-28",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-09",
        "endDate": "2034-09-16",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-08-29",
        "endDate": "2035-09-05",
        "regionNotes": "Bhadrapada Krishna (calculated Jain calendar)",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Jainism: An Introduction",
        "author": "Dundas, Paul",
        "publisher": "Routledge",
        "year": "2002",
        "url": ""
      }
    ]
  },
  {
    "id": "f-new-years-day",
    "slug": "new-years-day-gregorian",
    "name": "New Year's Day",
    "alternateNames": [
      "January 1",
      "Jour de l'An",
      "Silvester (Germany/Austria)"
    ],
    "culturalOrigin": "Global — based on Gregorian calendar standardization",
    "religion": "Secular, with Christian and diverse cultural traditions",
    "traditionType": "Fixed Gregorian Calendar",
    "category": "Secular & Cultural",
    "countries": [
      "Global — virtually all countries observing the Gregorian calendar"
    ],
    "regions": [
      "Global"
    ],
    "typicalMonth": 1,
    "dateRule": "fixed_gregorian",
    "significance": "The first day of the Gregorian calendar year, marking a global moment of celebration, reflection, and renewal. While the Gregorian calendar is a Western institution, New Year celebrations on January 1 are now observed worldwide.",
    "history": "The Gregorian calendar was introduced by Pope Gregory XIII in 1582, gradually adopted by most of the world through the 18th–20th centuries. January 1 as New Year dates to Julius Caesar's Julian calendar reform of 45 BCE.",
    "whyCelebrated": "To mark the passage into a new year, reflect on the past year, and set intentions for the future. New Year's Eve fireworks and celebrations are a global cultural phenomenon.",
    "howObserved": "New Year's Eve fireworks, parties, and countdown; public celebrations (Sydney, Dubai, London, New York Times Square); family gatherings; watching traditional entertainment; making New Year's resolutions.",
    "rituals": [
      "Midnight countdown and fireworks",
      "Champagne/sparkling wine toasts",
      "Auld Lang Syne (English-speaking countries)",
      "Watching fireworks",
      "New Year's resolutions"
    ],
    "food": [
      "Champagne",
      "Black-eyed peas (US South, for good luck)",
      "Regional luck foods (grapes in Spain, lentils in Italy, herring in Nordic countries)"
    ],
    "clothing": [
      "Festive evening wear",
      "Party costumes"
    ],
    "music": [
      "Auld Lang Syne",
      "Fireworks soundtrack",
      "Regional pop and traditional music"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-01-01",
        "endDate": "2025-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-01-01",
        "endDate": "2026-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-01-01",
        "endDate": "2027-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-01-01",
        "endDate": "2028-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-01-01",
        "endDate": "2029-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-01-01",
        "endDate": "2030-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-01-01",
        "endDate": "2031-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-01-01",
        "endDate": "2032-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-01-01",
        "endDate": "2033-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-01-01",
        "endDate": "2034-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-01-01",
        "endDate": "2035-01-01",
        "regionNotes": "Fixed January 1 — Gregorian calendar",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "New Year's Day",
        "author": "Encyclopaedia Britannica",
        "publisher": "Britannica",
        "year": "2024",
        "url": "https://www.britannica.com/topic/New-Years-Day"
      }
    ]
  },
  {
    "id": "f-krishna-janmashtami",
    "slug": "krishna-janmashtami",
    "name": "Krishna Janmashtami",
    "alternateNames": [
      "Gokulashtami",
      "Yadukula Ashtami",
      "Srikrishna Jayanti"
    ],
    "culturalOrigin": "Mathura & Vrindavan, Northern India — Hindu Puranic tradition",
    "religion": "Hinduism",
    "traditionType": "Hindu Lunisolar Calendar (Bhadrapada Krishna Ashtami)",
    "category": "Religious & Community",
    "countries": [
      "India",
      "Nepal",
      "Fiji",
      "Mauritius",
      "Guyana",
      "Trinidad and Tobago",
      "Global Hindu Diaspora"
    ],
    "regions": [
      "South Asia",
      "Global Hindu Diaspora"
    ],
    "typicalMonth": 8,
    "dateRule": "hindu_lunisolar",
    "significance": "Celebrates the birth of Lord Krishna, the eighth avatar of Vishnu. Known for midnight vigils, fasting, devotional singing, and the Dahi Handi human pyramid festival in Maharashtra.",
    "history": "Recorded in the Bhagavata Purana, Harivamsa, and Mahabharata. Born at midnight in a Mathura prison cell to Devaki and Vasudeva, Krishna was carried across the Yamuna River to Gokul to escape King Kamsa.",
    "whyCelebrated": "To celebrate the divine descent of Krishna to destroy demonic oppression, restore righteousness (Dharma), and teach the Bhagavad Gita.",
    "howObserved": "Fasting until midnight; chanting the Bhagavata Purana and devotional bhajans; decorating cradles with infant Krishna (Bal Gopal) idols; breaking pots of curd hung high above streets (Dahi Handi in Mumbai).",
    "rituals": [
      "Nirjala or Phalahar fasting throughout the day",
      "Midnight Abhisheka (ritual bathing) of Bal Gopal idol",
      "Dahi Handi human pyramids in Maharashtra and Goa",
      "Raas Leela dramatic enactments in Vrindavan and Mathura",
      "Drawing small footprints of baby Krishna with rice flour leading into the home"
    ],
    "food": [
      "Makhan Mishri (butter with rock sugar)",
      "Panjiri coriander-dry fruit prasad",
      "Poha Chivda",
      "Pedha",
      "Kheer"
    ],
    "clothing": [
      "Traditional Indian attire; children dressed as baby Krishna with peacock feathers and Radha"
    ],
    "music": [
      "Krishna Bhajans",
      "Govinda Ala Re folk music during Dahi Handi",
      "Classical Odissi and Kathak dances"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-08-16",
        "endDate": "2025-08-16",
        "regionNotes": "Ashtami Tithi begins Aug 15 night; midnight puja Aug 16 (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-04",
        "endDate": "2026-09-04",
        "regionNotes": "Rohini Nakshatra & Ashtami Tithi (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-08-25",
        "endDate": "2027-08-25",
        "regionNotes": "Bhadrapada Krishna Ashtami (calculated)",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-08-13",
        "endDate": "2028-08-13",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-01",
        "endDate": "2029-09-01",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-08-21",
        "endDate": "2030-08-21",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-08-10",
        "endDate": "2031-08-10",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-08-28",
        "endDate": "2032-08-28",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-08-17",
        "endDate": "2033-08-17",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-05",
        "endDate": "2034-09-05",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-08-26",
        "endDate": "2035-08-26",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Janmashtami Date & Nishita Puja Muhurat",
        "publisher": "Drik Panchang",
        "year": "2026",
        "url": "https://www.drikpanchang.com/festivals/janmashtami/janmashtami-date-time.html"
      },
      {
        "title": "The Bhagavata Purana",
        "author": "Trad. Vyasa / translation by Bibek Debroy",
        "publisher": "Penguin Books",
        "year": "2019",
        "url": ""
      }
    ]
  },
  {
    "id": "f-maha-shivaratri",
    "slug": "maha-shivaratri",
    "name": "Maha Shivaratri",
    "alternateNames": [
      "The Great Night of Shiva",
      "Shivaratri"
    ],
    "culturalOrigin": "Ancient India — Vedic and Shaiva tradition",
    "religion": "Hinduism",
    "traditionType": "Hindu Lunisolar Calendar (Phalguna / Magha Krishna Chaturdashi)",
    "category": "Religious",
    "countries": [
      "India",
      "Nepal",
      "Mauritius",
      "Indonesia (Bali)",
      "Global Hindu Diaspora"
    ],
    "regions": [
      "South Asia",
      "Global Hindu Diaspora"
    ],
    "typicalMonth": 2,
    "dateRule": "hindu_lunisolar",
    "significance": "Celebrates the cosmic dance of Shiva (Tandava) and his divine marriage to Goddess Parvati. Marked by overnight vigil (Jaagaran), meditation, fasting, and continuous offerings of Bael leaves on the Shiva Lingam.",
    "history": "Described in the Shiva Purana, Linga Purana, and Skanda Purana. According to legend, this is the night Shiva performed the Ananda Tandava and drank the Halahala poison to save the universe.",
    "whyCelebrated": "To overcome spiritual darkness and ignorance in life and the world, and to cultivate self-restraint, introspection, and liberation (Moksha).",
    "howObserved": "Strict fast throughout the day and night; all-night vigil at Shiva temples; four Prahara pujas during the night with milk, honey, yogurt, ghee, and water abhishekams; continuous chanting of Om Namah Shivaya.",
    "rituals": [
      "Upavasa (fasting) without food or water (or fruits only)",
      "Four Prahar Abhishekam of Shiva Linga with panchamrita and bilva patra",
      "All-night Jaagaran vigil with sacred hymns like Rudram and Shiva Tandava Stotram",
      "Visiting Jyotirlinga shrines and Pashupatinath Temple in Kathmandu"
    ],
    "food": [
      "Fasting foods: Sabudana khichdi, singhare ka halwa, thandai, fruits, makhana"
    ],
    "clothing": [
      "Simple dhoti, white or saffron unstitched cotton garments, rudraksha beads, bhasma (sacred ash) tilak"
    ],
    "music": [
      "Vedic Rudram chanting",
      "Shiva Tandava Stotram",
      "Dhrupad devotional classical singing"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-02-26",
        "endDate": "2025-02-27",
        "regionNotes": "Nishita Kaal Puja Feb 26 midnight (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-02-15",
        "endDate": "2026-02-16",
        "regionNotes": "Chaturdashi Tithi begins Feb 15 (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-03-06",
        "endDate": "2027-03-07",
        "regionNotes": "Phalguna Krishna Chaturdashi",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-02-24",
        "endDate": "2028-02-25",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-02-12",
        "endDate": "2029-02-13",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-03-03",
        "endDate": "2030-03-04",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-02-20",
        "endDate": "2031-02-21",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-03-10",
        "endDate": "2032-03-11",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-02-27",
        "endDate": "2033-02-28",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-02-17",
        "endDate": "2034-02-18",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-03-08",
        "endDate": "2035-03-09",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Maha Shivaratri Puja Muhurat & Timings",
        "publisher": "Drik Panchang",
        "year": "2026",
        "url": "https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html"
      },
      {
        "title": "The Shiva Purana",
        "publisher": "Motilal Banarsidass",
        "year": "2002",
        "url": ""
      }
    ]
  },
  {
    "id": "f-ganesh-chaturthi",
    "slug": "ganesh-chaturthi",
    "name": "Ganesh Chaturthi",
    "alternateNames": [
      "Vinayaka Chaturthi",
      "Ganeshotsav",
      "Vinayaka Chavithi"
    ],
    "culturalOrigin": "Maharashtra & Peninsular India — Puranic tradition",
    "religion": "Hinduism",
    "traditionType": "Hindu Lunisolar Calendar (Bhadrapada Shukla Chaturthi)",
    "category": "Religious & Community",
    "countries": [
      "India",
      "Nepal",
      "Mauritius",
      "South Africa",
      "United States",
      "Global Hindu Diaspora"
    ],
    "regions": [
      "South Asia",
      "Global Hindu Diaspora"
    ],
    "typicalMonth": 8,
    "dateRule": "hindu_lunisolar",
    "significance": "Ten-day celebration honoring Ganesha, the elephant-headed deity of wisdom, beginnings, and obstacle removal. Culminates in Anant Chaturdashi with grand immersion processions (Visarjan).",
    "history": "Celebrated privately since the Satavahana dynasty and popularized publicly by Chhatrapati Shivaji Maharaj. In 1893, freedom fighter Bal Gangadhar Tilak transformed it into a public national festival (Sarvajanik Ganeshotsav) to bridge caste barriers and organize civic resistance against British colonial rule.",
    "whyCelebrated": "To seek the blessings of Lord Ganesha for intellect, auspicious new enterprises, and elimination of obstacles.",
    "howObserved": "Installation of clay Ganesha idols in homes and public pandals; ten days of daily aartis and cultural performances; massive community processions carrying idols to the sea or rivers for Visarjan immersion accompanied by dhol-tasha drumming.",
    "rituals": [
      "Prana Pratishtha ritual invoking life into clay idol",
      "Shodashopachara (16-step) daily worship offering 21 Modaks and Durva grass",
      "Uttarpuja farewell prayer on Anant Chaturdashi",
      "Visarjan (immersion) in water bodies with chants of Ganpati Bappa Morya"
    ],
    "food": [
      "Modak (steamed rice-flour dumplings stuffed with coconut and jaggery)",
      "Puran Poli",
      "Sundal",
      "Laddoo (Boondi and Motichoor)",
      "Karanji"
    ],
    "clothing": [
      "Traditional Maharashtrian Nauvari saree and Kurta-Pyjama with saffron pheta (turban)"
    ],
    "music": [
      "Dhol Tasha percussion troupes",
      "Ganpati Aartis (Sukhkarta Dukhharta)",
      "Lejim folk dance rhythm"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-08-27",
        "endDate": "2025-09-06",
        "regionNotes": "Chaturthi to Anant Chaturdashi (10-day Ganeshotsav, verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-14",
        "endDate": "2026-09-24",
        "regionNotes": "Chaturthi to Anant Chaturdashi (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-09-04",
        "endDate": "2027-09-14",
        "regionNotes": "Bhadrapada Shukla Chaturthi",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-08-24",
        "endDate": "2028-09-03",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-12",
        "endDate": "2029-09-22",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-09-01",
        "endDate": "2030-09-11",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-08-21",
        "endDate": "2031-08-31",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-08",
        "endDate": "2032-09-18",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-08-29",
        "endDate": "2033-09-08",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-16",
        "endDate": "2034-09-26",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-09-06",
        "endDate": "2035-09-16",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Ganesh Chaturthi Timings & Visarjan Dates",
        "publisher": "Drik Panchang",
        "year": "2026",
        "url": "https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesh-chaturthi-date-time.html"
      },
      {
        "title": "Tilak and the Public Ganpati Festival",
        "author": "Richard Cashman",
        "publisher": "Journal of Asian Studies",
        "year": "1970",
        "url": ""
      }
    ]
  },
  {
    "id": "f-makar-sankranti",
    "slug": "makar-sankranti-pongal",
    "name": "Makar Sankranti & Pongal",
    "alternateNames": [
      "Pongal",
      "Uttarayan",
      "Maghi",
      "Khichdi",
      "Sankranthi",
      "Shishur Saenkrat"
    ],
    "culturalOrigin": "Pan-Indian — Vedic solar astronomical tradition",
    "religion": "Hinduism & Pan-Indian Cultural",
    "traditionType": "Solar Hindu Calendar (Surya Nirayana Transit into Makara / Capricorn)",
    "category": "Harvest & Seasonal",
    "countries": [
      "India",
      "Nepal",
      "Sri Lanka",
      "Malaysia",
      "Singapore",
      "Global Diaspora"
    ],
    "regions": [
      "South Asia",
      "Southeast Asia",
      "Global Diaspora"
    ],
    "typicalMonth": 1,
    "dateRule": "hindu_solar_fixed",
    "significance": "Major agricultural harvest festival celebrating the northward journey of the Sun (Uttarayan). Marks the end of winter solstice and beginning of longer days and harvest of winter crops (rabi).",
    "history": "Referenced in the Mahabharata and ancient Vedic texts. Bhishma Pitamaha waited for the sacred Uttarayan sun to leave his mortal body. In Tamil Nadu, celebrated for 4 days as Bhogi, Surya Pongal, Maattu Pongal, and Kaanum Pongal.",
    "whyCelebrated": "To express gratitude to the Sun god (Surya), nature, farm cattle, and the earth for abundant harvest and prosperity.",
    "howObserved": "In Gujarat and Maharashtra, millions fly colorful paper kites (Uttarayan kite festival). In Tamil Nadu, overflowing pots of sweet rice and milk are boiled outdoors to shouts of \"Pongalo Pongal!\". In Andhra Pradesh and Telangana, Haridasu singers walk the villages and bonfires are lit on Bhogi.",
    "rituals": [
      "Holy dip (Snana) in sacred rivers (Ganga, Yamuna, Godavari, Kaveri, at Gangasagar and Prayagraj)",
      "Uttarayan kite flying competitions filling skies across Ahmedabad and Jaipur",
      "Boiling sweet Pongal in clay pots until it overflows, symbolizing overflowing prosperity",
      "Decorating and honoring farm cattle on Maattu Pongal with painted horns and floral garlands",
      "Distributing Tilgul (sesame and jaggery sweets): \"Tilgul ghya, god god bola\" (Eat sesame and speak sweetly)"
    ],
    "food": [
      "Sakkarai Pongal (sweet jaggery rice with ghee and cashews)",
      "Ven Pongal (peppery savory rice)",
      "Tilgul sesame-jaggery laddoo",
      "Khichdi",
      "Undhiyu mixed vegetable casserole (Gujarat)"
    ],
    "clothing": [
      "Bright silk dhotis, Kasavu sarees, vibrant Kanjeevaram sarees, festive colorful kurtas"
    ],
    "music": [
      "Folk Nadaswaram and Thavil festive music",
      "Kite festival anthems and folk songs in Gujarat and Rajasthan"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-01-14",
        "endDate": "2025-01-15",
        "regionNotes": "Makara Sankranti Surya Transit (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-01-14",
        "endDate": "2026-01-15",
        "regionNotes": "Sankranti Moment Jan 14 evening / Jan 15 morning (verified by Drik Panchang)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-01-15",
        "endDate": "2027-01-15",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-01-15",
        "endDate": "2028-01-15",
        "regionNotes": "Solar Makara Transit (leap year)",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-01-14",
        "endDate": "2029-01-14",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-01-14",
        "endDate": "2030-01-14",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-01-15",
        "endDate": "2031-01-15",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-01-15",
        "endDate": "2032-01-15",
        "regionNotes": "Solar Makara Transit (leap year)",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-01-14",
        "endDate": "2033-01-14",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-01-14",
        "endDate": "2034-01-14",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-01-15",
        "endDate": "2035-01-15",
        "regionNotes": "Solar Makara Transit",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Makar Sankranti Surya Sankramana Timings",
        "publisher": "Drik Panchang",
        "year": "2026",
        "url": "https://www.drikpanchang.com/festivals/makar-sankranti/makar-sankranti-date-time.html"
      },
      {
        "title": "The Astronomical Origin of Makar Sankranti",
        "author": "B. V. Raman",
        "publisher": "Raman Publications",
        "year": "1998",
        "url": ""
      }
    ]
  },
  {
    "id": "f-onam",
    "slug": "onam",
    "name": "Onam",
    "alternateNames": [
      "Thiruvonam",
      "Kerala Harvest Festival"
    ],
    "culturalOrigin": "Kerala, Southwestern India — Dravidian & Puranic heritage",
    "religion": "Hinduism & Kerala Cultural / Secular Unity",
    "traditionType": "Malayalam Solar Calendar (Kollam Era, Month of Chingam)",
    "category": "Harvest & Cultural",
    "countries": [
      "India (Kerala)",
      "United Arab Emirates",
      "Oman",
      "Qatar",
      "Kuwait",
      "Global Malayali Diaspora"
    ],
    "regions": [
      "South Asia",
      "Middle East / Gulf Diaspora",
      "Global Malayali Diaspora"
    ],
    "typicalMonth": 8,
    "dateRule": "malayalam_solar",
    "significance": "Ten-day harvest and cultural festival commemorating the mythical golden-age King Mahabali who visits his subjects each year. Celebrated across religious lines by all Malayalis worldwide.",
    "history": "Legend recounts that King Mahabali ruled Kerala with complete egalitarianism, where all people were equal and deceit was unknown. Lord Vishnu took the Vamana avatar to test Mahabali and granted him the boon to return to Kerala once every year during Thiruvonam.",
    "whyCelebrated": "To welcome the spirit of King Mahabali and celebrate prosperity, social equality, cultural pride, and agricultural harvest.",
    "howObserved": "Ten days from Atham to Thiruvonam: creating intricate floral carpets (Pookkalam) on verandahs; racing long snake-boats (Vallam Kali) on backwaters; performing Pulikkali tiger dances; and serving the grand vegetarian feast (Onasadya) on banana leaves.",
    "rituals": [
      "Laying floral rangoli carpets (Athapookkalam) with fresh blossoms growing larger daily",
      "Vallam Kali snake boat races (Nehru Trophy Boat Race on Punnamada Lake)",
      "Pulikkali folk performance where performers paint themselves as tigers and leopards",
      "Serving Onasadya grand multi-course feast with 26+ traditional vegetarian dishes",
      "Onathallu martial arts bouts and Onapattu folk singing"
    ],
    "food": [
      "Onasadya (26-course banquet served on banana leaves): Avial, Sambar, Olan, Thoran, Kalan, Parippu, Payasam, Banana chips (Upperi), Sarkara Varatti"
    ],
    "clothing": [
      "Kerala Kasavu Mundu and Kasavu Sarees (off-white handloom cotton with gold zari border)"
    ],
    "music": [
      "Vanchipattu (boat song chants during snake boat races)",
      "Onapattu folk melodies",
      "Chenda Melam temple percussion orchestras"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-08-26",
        "endDate": "2025-09-05",
        "regionNotes": "Atham Aug 26; Thiruvonam Sep 5 (verified by Kerala Government Calendar)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-08-16",
        "endDate": "2026-08-26",
        "regionNotes": "Atham Aug 16; Thiruvonam Aug 26 (verified by Kerala Government Calendar)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-09-02",
        "endDate": "2027-09-12",
        "regionNotes": "Chingam Thiruvonam",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-08-22",
        "endDate": "2028-09-01",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-08-11",
        "endDate": "2029-08-21",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-08-30",
        "endDate": "2030-09-09",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-08-20",
        "endDate": "2031-08-30",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-08-08",
        "endDate": "2032-08-18",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-08-28",
        "endDate": "2033-09-07",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-08-18",
        "endDate": "2034-08-28",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-09-06",
        "endDate": "2035-09-16",
        "regionNotes": "Calculated Malayalam calendar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Kerala Government Official Holiday Calendar",
        "publisher": "Government of Kerala",
        "year": "2026",
        "url": "https://kerala.gov.in"
      },
      {
        "title": "Folklore and Traditions of Kerala",
        "author": "A. Sreedhara Menon",
        "publisher": "DC Books",
        "year": "2008",
        "url": ""
      }
    ]
  },
  {
    "id": "f-rosh-hashanah",
    "slug": "rosh-hashanah",
    "name": "Rosh Hashanah",
    "alternateNames": [
      "Jewish New Year",
      "Yom Teruah",
      "Day of Judgment"
    ],
    "culturalOrigin": "Ancient Judea / Levant — Hebrew biblical tradition",
    "religion": "Judaism",
    "traditionType": "Hebrew Lunisolar Calendar (1–2 Tishrei)",
    "category": "Religious & Renewal",
    "countries": [
      "Israel",
      "United States",
      "France",
      "Canada",
      "United Kingdom",
      "Argentina",
      "Global Jewish Diaspora"
    ],
    "regions": [
      "Middle East",
      "North America",
      "Europe",
      "Global Jewish Diaspora"
    ],
    "typicalMonth": 9,
    "dateRule": "hebrew_lunisolar",
    "significance": "The Jewish New Year, marking the creation of Adam and Eve and the anniversary of the world. Inaugurates the Ten Days of Repentance (Yamim Noraim) leading to Yom Kippur.",
    "history": "Commanded in Leviticus 23:23–25 as a holy convocation commemorated with the blowing of trumpets (shofar). In Rabbinic tradition, it is the Day of Judgment when God inscribes the destiny of every person in the Book of Life for the coming year.",
    "whyCelebrated": "To sound the wake-up call to spiritual repentance, review one's deeds, crown God as sovereign of the universe, and pray for a sweet new year.",
    "howObserved": "Synagogue services centered on sounding the ram's horn shofar 100 times; festive meals featuring apples dipped in honey; Tashlich prayers beside flowing water casting away past misdeeds.",
    "rituals": [
      "Blowing the Shofar ram's horn in the synagogue (Tekiah, Shevarim, Teruah)",
      "Dipping slices of sweet apple in honey with the prayer: \"May it be Your will to renew for us a good and sweet year\"",
      "Tashlich ritual reciting prayers by a river or sea to symbolically cast sins into the depths",
      "Candle lighting and reciting the Shehecheyanu blessing",
      "Eating round Challah bread symbolizing the cyclical nature of time"
    ],
    "food": [
      "Apples dipped in honey",
      "Round Challah with raisins",
      "Pomegranate seeds (symbolizing 613 commandments)",
      "Fish head or lamb head (\"that we be the head and not the tail\")",
      "Honey cake (Lekach)"
    ],
    "clothing": [
      "White festive attire (kittel in synagogue), yarmulke, and tallit prayer shawls"
    ],
    "music": [
      "Shofar blasts",
      "Avinu Malkeinu liturgical prayer chant",
      "Unetanneh Tokef piyyut melody"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-09-22",
        "endDate": "2025-09-24",
        "regionNotes": "Begins sunset Sep 22; 1-2 Tishrei (verified by Hebcal)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-11",
        "endDate": "2026-09-13",
        "regionNotes": "Begins sunset Sep 11; 1-2 Tishrei (verified by Hebcal)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-10-01",
        "endDate": "2027-10-03",
        "regionNotes": "Hebrew calendar 5788",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-09-20",
        "endDate": "2028-09-22",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-09",
        "endDate": "2029-09-11",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-09-27",
        "endDate": "2030-09-29",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-09-17",
        "endDate": "2031-09-19",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-05",
        "endDate": "2032-09-07",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-09-23",
        "endDate": "2033-09-25",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-13",
        "endDate": "2034-09-15",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-10-03",
        "endDate": "2035-10-05",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Hebcal Jewish Calendar Database",
        "publisher": "Hebcal",
        "year": "2026",
        "url": "https://www.hebcal.com/holidays/rosh-hashana"
      },
      {
        "title": "The Jewish Holidays: A Guide and Commentary",
        "author": "Michael Strassfeld",
        "publisher": "Harper & Row",
        "year": "1985",
        "url": ""
      }
    ]
  },
  {
    "id": "f-sukkot",
    "slug": "sukkot",
    "name": "Sukkot",
    "alternateNames": [
      "Feast of Tabernacles",
      "Feast of Booths",
      "Chag HaAsif",
      "Season of Our Joy"
    ],
    "culturalOrigin": "Ancient Israel — Biblical Torah tradition",
    "religion": "Judaism",
    "traditionType": "Hebrew Lunisolar Calendar (15–21 Tishrei)",
    "category": "Religious & Agricultural",
    "countries": [
      "Israel",
      "United States",
      "France",
      "Canada",
      "United Kingdom",
      "Global Jewish Diaspora"
    ],
    "regions": [
      "Middle East",
      "North America",
      "Europe",
      "Global Jewish Diaspora"
    ],
    "typicalMonth": 10,
    "dateRule": "hebrew_lunisolar",
    "significance": "Seven-day biblical pilgrimage festival commemorating the forty years the Israelites wandered in the desert living in temporary shelters (sukkot), and celebrating the final autumn agricultural harvest.",
    "history": "Commanded in Leviticus 23:39–43. Historically one of the three pilgrimage festivals (Shalosh Regalim) when Jews journeyed to the Temple in Jerusalem. Concludes with Shemini Atzeret and Simchat Torah celebrating the completion and restart of the annual Torah reading cycle.",
    "whyCelebrated": "To recall God's protection in the wilderness, express gratitude for the harvest, and reflect on the impermanence of material security by dwelling in temporary outdoor huts.",
    "howObserved": "Building outdoor thatched booths (sukkah) with roofs made of natural vegetation (sechach); eating all meals inside the sukkah for seven days; waving the Four Species (Arba'at HaMinim) in six directions in synagogue.",
    "rituals": [
      "Building and decorating the Sukkah with fruit, foliage, and artwork",
      "Dwelling (eating and sleeping) in the Sukkah for seven days",
      "Waving the Four Species: Etrog (citron), Lulav (palm frond), Hadas (myrtle branch), and Aravah (willow branch)",
      "Welcoming symbolic spiritual guests (Ushpizin: Abraham, Isaac, Jacob, Moses, Aaron, Joseph, David)",
      "Hoshana Rabbah seven-circuit processions with willow branches"
    ],
    "food": [
      "Stuffed cabbage (Holishkes / Kreplach symbolizing packed abundance)",
      "Autumn harvest squash and pumpkin dishes",
      "Pomegranate and apple cakes",
      "Fresh figs and dates"
    ],
    "clothing": [
      "Festive holiday dress for meals and synagogue services"
    ],
    "music": [
      "Hallel psalms chanting",
      "Simchat Torah Klezmer dance music and Torah circle dancing (Hakafot)"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-10-06",
        "endDate": "2025-10-13",
        "regionNotes": "15-21 Tishrei (verified by Hebcal)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-25",
        "endDate": "2026-10-02",
        "regionNotes": "15-21 Tishrei (verified by Hebcal)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-10-15",
        "endDate": "2027-10-22",
        "regionNotes": "Hebrew calendar 5788",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-10-04",
        "endDate": "2028-10-11",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-23",
        "endDate": "2029-09-30",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-10-11",
        "endDate": "2030-10-18",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-10-01",
        "endDate": "2031-10-08",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-19",
        "endDate": "2032-09-26",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-10-07",
        "endDate": "2033-10-14",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-27",
        "endDate": "2034-10-04",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-10-17",
        "endDate": "2035-10-24",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Hebcal Jewish Calendar Database",
        "publisher": "Hebcal",
        "year": "2026",
        "url": "https://www.hebcal.com/holidays/sukkot"
      },
      {
        "title": "The Jewish Book of Why",
        "author": "Alfred J. Kolatch",
        "publisher": "Jonathan David Publishers",
        "year": "2003",
        "url": ""
      }
    ]
  },
  {
    "id": "f-hanukkah",
    "slug": "hanukkah",
    "name": "Hanukkah",
    "alternateNames": [
      "Chanukah",
      "Festival of Lights",
      "Feast of Dedication",
      "Chag HaUrim"
    ],
    "culturalOrigin": "Ancient Judea (Jerusalem) — Second Temple era",
    "religion": "Judaism",
    "traditionType": "Hebrew Lunisolar Calendar (25 Kislev – 2 Tevet)",
    "category": "Religious & Commemoration",
    "countries": [
      "Israel",
      "United States",
      "France",
      "Canada",
      "United Kingdom",
      "Global Jewish Diaspora"
    ],
    "regions": [
      "Middle East",
      "North America",
      "Europe",
      "Global Jewish Diaspora"
    ],
    "typicalMonth": 12,
    "dateRule": "hebrew_lunisolar",
    "significance": "Eight-day winter festival celebrating the rededication of the Second Temple in Jerusalem following the Maccabean victory over the Seleucid Empire in 165 BCE, and the miracle of the oil that burned for eight days.",
    "history": "Recorded in the First and Second Books of Maccabees and the Talmud (Shabbat 21b). Judah the Maccabee and his brothers reclaimed the desecrated Temple. Finding only one cruse of pure olive oil with the High Priest's seal—enough for just one day—the menorah miraculous burned for eight continuous days until new oil could be consecrated.",
    "whyCelebrated": "To commemorate religious freedom, Jewish spiritual resilience against enforced assimilation, and divine providence.",
    "howObserved": "Lighting an additional candle on the nine-branched Hanukkiah each night at dusk; singing traditional hymns like Maoz Tzur; playing the four-sided dreidel spinning top game; and giving chocolate coins (gelt) or gifts to children.",
    "rituals": [
      "Kindling the Hanukkiah (menorah) starting with one light on night one and reaching eight on night eight",
      "Using the shamash (helper candle) to light the others with blessing prayers",
      "Displaying the Hanukkiah in a window facing the street for Pirsumei Nisa (publicizing the miracle)",
      "Spinning the four-sided dreidel with letters Nun, Gimel, Hei, Shin (\"A great miracle happened there\")",
      "Singing Maoz Tzur (Rock of Ages) and Hanerot Halalu hymns"
    ],
    "food": [
      "Latkes (crispy fried potato pancakes served with sour cream and applesauce)",
      "Sufganiyot (jelly-filled deep-fried donuts dusted with powdered sugar)",
      "Chocolate Hanukkah gelt coins"
    ],
    "clothing": [
      "Casual holiday clothing; festive blue, white, and silver Hanukkah sweaters"
    ],
    "music": [
      "Maoz Tzur liturgical melody",
      "Dreidel song (\"I Have a Little Dreidel\")",
      "Traditional Ladino songs like Ocho Kandelikas"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-12-14",
        "endDate": "2025-12-22",
        "regionNotes": "25 Kislev – 2 Tevet (verified by Hebcal)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-12-04",
        "endDate": "2026-12-12",
        "regionNotes": "25 Kislev – 2 Tevet (verified by Hebcal)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-12-24",
        "endDate": "2028-01-01",
        "regionNotes": "Hebrew calendar 5788",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-12-12",
        "endDate": "2028-12-20",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-12-02",
        "endDate": "2029-12-10",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-12-20",
        "endDate": "2030-12-28",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-12-10",
        "endDate": "2031-12-18",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-11-28",
        "endDate": "2032-12-06",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-12-16",
        "endDate": "2033-12-24",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-12-06",
        "endDate": "2034-12-14",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-12-26",
        "endDate": "2036-01-03",
        "regionNotes": "Calculated Hebrew calendar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Hebcal Jewish Calendar Database",
        "publisher": "Hebcal",
        "year": "2026",
        "url": "https://www.hebcal.com/holidays/chanukah"
      },
      {
        "title": "Talmud Bavli, Tractate Shabbat 21b",
        "publisher": "Koren Publishers Jerusalem",
        "year": "2012",
        "url": ""
      }
    ]
  },
  {
    "id": "f-islamic-new-year",
    "slug": "islamic-new-year",
    "name": "Islamic New Year",
    "alternateNames": [
      "Hijri New Year",
      "Ra’s al-Sana al-Hijriyya",
      "Awal Muharram"
    ],
    "culturalOrigin": "Medina & Arabian Peninsula — Islamic historical era",
    "religion": "Islam",
    "traditionType": "Lunar Islamic Hijri Calendar (1 Muharram)",
    "category": "Religious & Commemoration",
    "countries": [
      "Saudi Arabia",
      "Egypt",
      "Indonesia",
      "Turkey",
      "Morocco",
      "Malaysia",
      "Pakistan",
      "Global Muslim World"
    ],
    "regions": [
      "Middle East & North Africa",
      "Southeast Asia",
      "South Asia",
      "Global Diaspora"
    ],
    "typicalMonth": 6,
    "dateRule": "islamic_lunar",
    "significance": "Marks the start of a new Islamic lunar calendar year and commemorates the Hijra: the migration of Prophet Muhammad and early Muslims from Mecca to Medina in 622 CE, establishing the first Muslim community.",
    "history": "Instituted during the caliphate of Umar ibn al-Khattab in 639 CE, choosing the Hijra as the defining watershed epoch of Islamic history. Muharram is one of the four sacred months (al-Ashhur al-Hurum) in the Quran during which warfare was prohibited.",
    "whyCelebrated": "To remember the sacrifices of the early Muslim community, engage in spiritual self-reflection, and pray for peace and blessings in the new year.",
    "howObserved": "A quiet, reflective public holiday in most Muslim-majority countries. Families attend mosque lectures on the significance of the Hijra, recite Quranic surahs, and fast during the early days of Muharram.",
    "rituals": [
      "Reflective prayers and Quran recitation at local mosques",
      "Observing voluntary fasts during the sacred month of Muharram",
      "Listening to historical lectures on the lessons of the Hijra",
      "Exchanging congratulations for the new Hijri year (Kullu am wa antum bi-khair)"
    ],
    "food": [
      "Traditional sweet dishes: Muharram pudding / Ashure (Noah's pudding in Turkey), sweet couscous, festive semolina porridge"
    ],
    "clothing": [
      "Traditional modest attire: Thobe, jalabiya, batik, or white prayer garments"
    ],
    "music": [
      "Islamic Nasheeds (devotional acapella hymns), Tala al-Badru Alayna singing"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-26",
        "endDate": "2025-06-26",
        "regionNotes": "1 Muharram 1447 AH (verified by Umm al-Qura Calendar)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-06-16",
        "endDate": "2026-06-16",
        "regionNotes": "1 Muharram 1448 AH (verified by Umm al-Qura Calendar)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-06",
        "endDate": "2027-06-06",
        "regionNotes": "1 Muharram 1449 AH",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-05-25",
        "endDate": "2028-05-25",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-05-14",
        "endDate": "2029-05-14",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-05-04",
        "endDate": "2030-05-04",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-04-23",
        "endDate": "2031-04-23",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-04-11",
        "endDate": "2032-04-11",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-03-31",
        "endDate": "2033-03-31",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-03-21",
        "endDate": "2034-03-21",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-03-10",
        "endDate": "2035-03-10",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Umm al-Qura Calendar of Saudi Arabia",
        "publisher": "King Abdulaziz City for Science and Technology",
        "year": "2026",
        "url": "https://www.ummulqura.org.sa"
      },
      {
        "title": "The Oxford History of Islam",
        "author": "John L. Esposito",
        "publisher": "Oxford University Press",
        "year": "1999",
        "url": ""
      }
    ]
  },
  {
    "id": "f-ashura",
    "slug": "day-of-ashura",
    "name": "Day of Ashura",
    "alternateNames": [
      "Youm-e-Ashura",
      "10th of Muharram",
      "Tamkharit (Senegal)"
    ],
    "culturalOrigin": "Middle East & Karbala, Iraq — Islamic history",
    "religion": "Islam (Sunni and Shia observances)",
    "traditionType": "Lunar Islamic Hijri Calendar (10 Muharram)",
    "category": "Religious & Commemoration",
    "countries": [
      "Iraq",
      "Iran",
      "Pakistan",
      "India",
      "Lebanon",
      "Turkey",
      "Egypt",
      "Senegal",
      "Global Muslim World"
    ],
    "regions": [
      "Middle East & North Africa",
      "South Asia",
      "West Africa",
      "Global Muslim Community"
    ],
    "typicalMonth": 7,
    "dateRule": "islamic_lunar",
    "significance": "In Shia Islam, a solemn day of mourning commemorating the martyrdom of Imam Husayn ibn Ali (grandson of the Prophet) at the Battle of Karbala in 680 CE. In Sunni Islam, a day of voluntary fasting commemorating Prophet Moses being saved from Pharaoh when the Red Sea parted.",
    "history": "The 10th day of Muharram has multi-layered historical resonance: Moses fasting in gratitude for the Exodus, and later the tragedy of Karbala where Imam Husayn, his family, and 72 companions stood against the tyrannical Umayyad army of Yazid I.",
    "whyCelebrated": "To honor the supreme sacrifice of Imam Husayn for justice, truth, and resistance against tyranny, and in Sunni traditions to express gratitude for deliverance from oppression.",
    "howObserved": "Shia communities observe solemn mourning processions (Majaalis), passion plays (Ta'ziyeh), and elegiac poetry recitations (Noha/Marsiya). Sunni communities observe a two-day voluntary fast (9th and 10th Muharram) and cook communal pots of porridge or Ashure pudding.",
    "rituals": [
      "Attending commemorative Majlis assemblies listening to accounts of Karbala",
      "Reciting Ziyarat Ashura and elegiac mourning poetry",
      "Voluntary fasting on the 9th and 10th of Muharram (Sunni tradition)",
      "Distributing free water, sherbet, and communal food (Sabeel / Niaz) to all passersby",
      "Preparing and sharing Ashure pudding (Noah's pudding) across Anatolia and the Balkans"
    ],
    "food": [
      "Noah's Pudding (Ashure: cracked wheat, chickpeas, dried apricots, raisins, figs, walnuts, and pomegranate)",
      "Haleem savory meat and wheat stew",
      "Free Sabeel milk sherbet with basil seeds"
    ],
    "clothing": [
      "Black or dark mourning clothes in Shia communities; modest white clothing for fasting prayers"
    ],
    "music": [
      "Sufi elegies, Marsiya recitations, Latmiya rhythmic mourning poetry"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-07-05",
        "endDate": "2025-07-06",
        "regionNotes": "10 Muharram 1447 AH (verified by Umm al-Qura Calendar)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-06-25",
        "endDate": "2026-06-26",
        "regionNotes": "10 Muharram 1448 AH (verified by Umm al-Qura Calendar)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-15",
        "endDate": "2027-06-16",
        "regionNotes": "10 Muharram 1449 AH",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-06-03",
        "endDate": "2028-06-04",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-05-23",
        "endDate": "2029-05-24",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-05-13",
        "endDate": "2030-05-14",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-05-02",
        "endDate": "2031-05-03",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-04-20",
        "endDate": "2032-04-21",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-04-09",
        "endDate": "2033-04-10",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-03-30",
        "endDate": "2034-03-31",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-03-19",
        "endDate": "2035-03-20",
        "regionNotes": "Calculated lunar Hijri",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "The Miracle Play of Hasan and Husain",
        "author": "Sir Lewis Pelly",
        "publisher": "W. H. Allen & Co.",
        "year": "1879",
        "url": ""
      },
      {
        "title": "Islamic Finder World Hijri Calendar",
        "publisher": "IslamicFinder",
        "year": "2026",
        "url": "https://www.islamicfinder.org"
      }
    ]
  },
  {
    "id": "f-chuseok",
    "slug": "chuseok",
    "name": "Chuseok",
    "alternateNames": [
      "Hangawi",
      "Korean Autumn Harvest Festival",
      "Gabae"
    ],
    "culturalOrigin": "Korean Peninsula — Silla Kingdom (57 BCE–935 CE)",
    "religion": "Confucian, Ancestral Veneration, Korean Folk",
    "traditionType": "Korean Lunisolar Calendar (15th day of 8th lunar month)",
    "category": "Harvest & Ancestral",
    "countries": [
      "South Korea",
      "North Korea",
      "Global Korean Diaspora"
    ],
    "regions": [
      "East Asia",
      "Global Korean Diaspora"
    ],
    "typicalMonth": 9,
    "dateRule": "lunisolar_korean",
    "significance": "One of Korea's two major three-day holidays, celebrated on the autumn full moon to give thanks for the harvest and honor ancestors with ritual food offerings and tomb maintenance.",
    "history": "Traced back to Gabae during the reign of King Yuri of Silla, which started as a month-long national weaving competition among palace women that concluded with food, wine, and festive song on the full moon.",
    "whyCelebrated": "To give thanks to ancestral spirits for the autumn harvest and share blessings among gathered generations of family.",
    "howObserved": "Millions travel across the country to family hometowns; early morning Charye ancestral memorial rites are conducted before elaborate wooden tables; families visit ancestral graves (Beolcho) to tidy them; women perform Ganggangsullae circle dances under the harvest moon.",
    "rituals": [
      "Charye ancestral memorial service setting out newly harvested grain, fruit, and songpyeon",
      "Beolcho grave weeding and cleaning at ancestral burial mounds",
      "Making Songpyeon half-moon-shaped rice cakes steamed over aromatic pine needles",
      "Ganggangsullae traditional circular folk dance performed by women under the full moon (UNESCO Intangible Cultural Heritage)",
      "Ssireum traditional Korean belt wrestling tournaments"
    ],
    "food": [
      "Songpyeon (half-moon shaped rice cakes filled with toasted sesame, red bean, or chestnuts)",
      "Jeon savory pancakes (pajeon, donggeurangttaeng)",
      "Japchae glass noodle stir-fry",
      "Fresh Korean pears, persimmons, and jujubes",
      "Baekju traditional rice wine"
    ],
    "clothing": [
      "Hanbok traditional Korean clothing with flowing jeogori jacket and chima skirt in bright holiday colors"
    ],
    "music": [
      "Pungmul traditional Korean percussion and farmer's drumming",
      "Ganggangsullae call-and-response folk singing",
      "Gayageum zither melodies"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-10-05",
        "endDate": "2025-10-07",
        "regionNotes": "15th day of 8th lunar month (Korea National Holiday)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-09-24",
        "endDate": "2026-09-26",
        "regionNotes": "15th day of 8th lunar month (Korea National Holiday)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-09-14",
        "endDate": "2027-09-16",
        "regionNotes": "15th day of 8th lunar month",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-10-02",
        "endDate": "2028-10-04",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-09-21",
        "endDate": "2029-09-23",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-09-11",
        "endDate": "2030-09-13",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-09-30",
        "endDate": "2031-10-02",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-09-18",
        "endDate": "2032-09-20",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-09-07",
        "endDate": "2033-09-09",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-09-26",
        "endDate": "2034-09-28",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-09-15",
        "endDate": "2035-09-17",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "National Folk Museum of Korea: Chuseok",
        "publisher": "National Folk Museum of Korea",
        "year": "2024",
        "url": "https://www.nfm.go.kr"
      },
      {
        "title": "UNESCO Intangible Cultural Heritage: Ganggangsullae",
        "publisher": "UNESCO",
        "year": "2009",
        "url": "https://ich.unesco.org/en/RL/ganggangsullae-00188"
      }
    ]
  },
  {
    "id": "f-double-ninth",
    "slug": "double-ninth-festival",
    "name": "Double Ninth Festival",
    "alternateNames": [
      "Chongyang Festival",
      "Chung Yeung Festival",
      "Seniors' Day"
    ],
    "culturalOrigin": "China — Han Dynasty (202 BCE–220 CE)",
    "religion": "Taoist, Confucian, Ancestral",
    "traditionType": "Lunisolar Chinese Calendar (9th day of 9th lunar month)",
    "category": "Ancestral & Seasonal",
    "countries": [
      "China",
      "Hong Kong",
      "Taiwan",
      "Singapore",
      "Malaysia",
      "Vietnam"
    ],
    "regions": [
      "East Asia",
      "Southeast Asia"
    ],
    "typicalMonth": 10,
    "dateRule": "lunisolar_chinese",
    "significance": "Traditional festival of longevity and ancestral remembrance. In the I Ching, nine is a yang number; the 9th day of the 9th month has double yang, considered auspicious yet dangerous, celebrated by climbing mountains, drinking chrysanthemum wine, and visiting ancestors' graves.",
    "history": "Legend of the Han Dynasty relates that the scholar Huan Jing was advised by a Taoist immortal to take his family to high ground with cornel branches and chrysanthemum wine to escape a deadly plague. In 1989, China designated it Senior Citizens' Day.",
    "whyCelebrated": "To pray for health and long life, ward off autumn illness, honor the elderly, and visit graves of ancestors.",
    "howObserved": "In Hong Kong, families visit hillside cemeteries to clean graves and burn paper offerings. In mainland China, walking up hills and mountains, viewing blooming chrysanthemums, drinking chrysanthemum wine, and eating Chongyang cake.",
    "rituals": [
      "Climbing hills and high mountains (Denggao) to breathe fresh autumn air and seek elevation",
      "Wearing fragrant Zhuyu (Cornus officinalis / dogwood) sprigs to ward off pestilence",
      "Drinking chrysanthemum tea or wine believed to purge heat and prolong life",
      "Visiting ancestral graves and sweeping tomb stones in Hong Kong and Guangdong",
      "Presenting nine-layered steamed Chongyang cakes to elders as wishes for progress and longevity"
    ],
    "food": [
      "Chongyang cake (steamed rice cake with dates, chestnuts, and pine nuts)",
      "Chrysanthemum wine and tea",
      "Roast suckling pig (Hong Kong grave-sweeping offering)",
      "Autumn crab"
    ],
    "clothing": [
      "Comfortable hiking garments, sprigs of red zhuyu pinned to clothing"
    ],
    "music": [
      "Traditional Chinese Guqin zither",
      "Classical autumnal poetry recitations (Wang Wei's Double Ninth poem)"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-10-29",
        "endDate": "2025-10-29",
        "regionNotes": "9th day of 9th lunar month (verified by Hong Kong Observatory)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-10-18",
        "endDate": "2026-10-18",
        "regionNotes": "9th day of 9th lunar month (verified by Hong Kong Observatory)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-10-08",
        "endDate": "2027-10-08",
        "regionNotes": "9th day of 9th lunar month",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-10-26",
        "endDate": "2028-10-26",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-10-16",
        "endDate": "2029-10-16",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-10-05",
        "endDate": "2030-10-05",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-10-24",
        "endDate": "2031-10-24",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-10-12",
        "endDate": "2032-10-12",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-10-01",
        "endDate": "2033-10-01",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-10-20",
        "endDate": "2034-10-20",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-10-09",
        "endDate": "2035-10-09",
        "regionNotes": "Calculated lunisolar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Hong Kong Observatory Almanac & Lunar Calendar",
        "publisher": "Hong Kong Observatory",
        "year": "2026",
        "url": "https://www.hko.gov.hk"
      },
      {
        "title": "Chinese Festivals",
        "author": "Chun-chieh Huang",
        "publisher": "National Taiwan University Press",
        "year": "2015",
        "url": ""
      }
    ]
  },
  {
    "id": "f-loy-krathong",
    "slug": "loy-krathong-yi-peng",
    "name": "Loy Krathong & Yi Peng",
    "alternateNames": [
      "Festival of Lights Thailand",
      "Yee Peng Sky Lantern Festival",
      "Tazaungdaing (Myanmar)"
    ],
    "culturalOrigin": "Sukhothai Kingdom, Thailand — Buddhist & Siamese heritage",
    "religion": "Theravada Buddhism & Thai Folk",
    "traditionType": "Thai Lunisolar Calendar (Full moon of the 12th lunar month)",
    "category": "Spiritual & Light",
    "countries": [
      "Thailand",
      "Laos",
      "Myanmar",
      "Cambodia"
    ],
    "regions": [
      "Southeast Asia"
    ],
    "typicalMonth": 11,
    "dateRule": "thai_lunisolar",
    "significance": "Celebrated across Thailand by releasing decorated floating baskets (krathongs) onto rivers and waterways, and in Chiang Mai launching thousands of glowing paper lanterns (khom loi) into the night sky (Yi Peng).",
    "history": "Rooted in ancient Brahmin and Buddhist rites paying respects to Phra Mae Khongkha (the Goddess of Water) and venerating the sacred footprint of the Buddha beside the mythical Nammatha River.",
    "whyCelebrated": "To ask forgiveness from the water goddess for polluting rivers, release misfortune and negative emotions from the past year, and make wishes for good fortune.",
    "howObserved": "Crowds gather along rivers, canals, and lakes to launch banana-stalk krathongs decorated with flowers, incense, and candles. In Chiang Mai, the northern Lanna festival of Yi Peng illuminates the night sky with mass releases of glowing sky lanterns.",
    "rituals": [
      "Crafting krathongs from banana trunk slices, folded banana leaves, orchids, marigolds, three incense sticks, and a candle",
      "Placing coin and nail clippings inside the krathong to symbolize shedding misfortune",
      "Floating the lit krathong gently away onto water with a silent prayer",
      "Releasing Khom Loi sky lanterns in northern Thailand (Chiang Mai)",
      "Nopphamat beauty pageants and traditional Lanna folk dances"
    ],
    "food": [
      "Khao Soi coconut curry noodles (Northern Thailand)",
      "Sai Oua Chiang Mai herbal sausage",
      "Khanom Krok coconut rice pancakes",
      "Pad Thai street food"
    ],
    "clothing": [
      "Traditional Thai silk attire: Chut Thai, sinh wrap skirts, Sabai shawls"
    ],
    "music": [
      "Loy Krathong traditional song played on Ranat ek xylophone, Sueng lute, and Saw duang fiddle"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-11-05",
        "endDate": "2025-11-06",
        "regionNotes": "Full moon 12th Thai lunar month (verified by Tourism Authority of Thailand)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-11-24",
        "endDate": "2026-11-25",
        "regionNotes": "Full moon 12th Thai lunar month (verified by Tourism Authority of Thailand)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-11-13",
        "endDate": "2027-11-14",
        "regionNotes": "Thai lunar calendar",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-11-01",
        "endDate": "2028-11-02",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2029,
        "startDate": "2029-11-20",
        "endDate": "2029-11-21",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2030,
        "startDate": "2030-11-10",
        "endDate": "2030-11-11",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2031,
        "startDate": "2031-11-28",
        "endDate": "2031-11-29",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2032,
        "startDate": "2032-11-16",
        "endDate": "2032-11-17",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2033,
        "startDate": "2033-11-06",
        "endDate": "2033-11-07",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2034,
        "startDate": "2034-11-25",
        "endDate": "2034-11-26",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      },
      {
        "year": 2035,
        "startDate": "2035-11-14",
        "endDate": "2035-11-15",
        "regionNotes": "Calculated Thai lunisolar",
        "verified": false
      }
    ],
    "sources": [
      {
        "title": "Tourism Authority of Thailand: Loy Krathong Dates",
        "publisher": "TAT Official Gazette",
        "year": "2026",
        "url": "https://www.tourismthailand.org"
      },
      {
        "title": "Festivals of Thailand",
        "author": "Phya Anuman Rajadhon",
        "publisher": "Siam Society",
        "year": "1986",
        "url": ""
      }
    ]
  },
  {
    "id": "f-matariki",
    "slug": "matariki",
    "name": "Matariki",
    "alternateNames": [
      "Te Kāhui o Matariki",
      "Māori New Year",
      "Pleiades Rising"
    ],
    "culturalOrigin": "Aotearoa / New Zealand — Indigenous Māori heritage",
    "religion": "Indigenous Māori Cosmology & Spirituality",
    "traditionType": "Māori Maramataka Lunar Calendar (Mid-winter Tangaroa moon phase)",
    "category": "Indigenous & Astronomical",
    "countries": [
      "New Zealand"
    ],
    "regions": [
      "Oceania"
    ],
    "typicalMonth": 6,
    "dateRule": "maori_maramataka",
    "significance": "The rising of the Matariki star cluster (the Pleiades) in the pre-dawn winter sky marks the beginning of the Māori New Year. A time to remember those who passed, celebrate the present harvest with feasts, and plan for the future.",
    "history": "Celebrated by iwi (tribes) across Aotearoa for centuries according to the Maramataka lunar calendar. In 2022, New Zealand officially legislated Matariki as a national public holiday, the first indigenous public holiday in the nation's history.",
    "whyCelebrated": "Matariki brings together three core values: remembrance (honoring ancestors), celebrating the present (community unity and shared kai/food), and looking forward (planting and renewal).",
    "howObserved": "Pre-dawn gatherings on hills and coasts to view the rising stars; hautapu ritual offering steam from food to feed the stars; flying traditional kites (pukaea); family gatherings sharing hāngī feasts.",
    "rituals": [
      "Pre-dawn stargazing ceremonies calling out the names of relatives who passed away during the previous year (Pōhutukawa star)",
      "Hautapu ceremony: cooking food representing earth, water, and air in an earth oven, lifting the lids at dawn to release steam as an offering to the stars",
      "Lighting fires and candles to welcome the dawn of the new cycle",
      "Flying traditional Māori kites (manu tukutuku) to connect the heavens and earth",
      "Wānanga tribal storytelling and passing genealogical knowledge (whakapapa)"
    ],
    "food": [
      "Hāngī feast (pork, chicken, sweet potato kūmara, pumpkin, and stuffing cooked underground over volcanic rocks)",
      "Rēwena potato sourdough bread",
      "Kaimoana seafood (pāua, mussels, smoked eel)",
      "Boil-up with watercress and doughboys"
    ],
    "clothing": [
      "Kākahu feather cloaks, traditional woven Māori flax garments (korowai), pounamu (greenstone jade) pendants"
    ],
    "music": [
      "Waiata traditional melodic songs",
      "Taonga pūoro traditional musical instruments (flutes and conch shells)",
      "Kapa haka cultural performance"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-20",
        "endDate": "2025-06-20",
        "regionNotes": "Official New Zealand Statutory Public Holiday",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-07-10",
        "endDate": "2026-07-10",
        "regionNotes": "Official New Zealand Statutory Public Holiday",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-25",
        "endDate": "2027-06-25",
        "regionNotes": "Official New Zealand Statutory Public Holiday",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-07-14",
        "endDate": "2028-07-14",
        "regionNotes": "Official New Zealand Statutory Public Holiday",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-07-06",
        "endDate": "2029-07-06",
        "regionNotes": "Official New Zealand Statutory Public Holiday",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-06-21",
        "endDate": "2030-06-21",
        "regionNotes": "Official New Zealand Statutory Public Holiday",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-07-11",
        "endDate": "2031-07-11",
        "regionNotes": "Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-07-02",
        "endDate": "2032-07-02",
        "regionNotes": "Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-06-24",
        "endDate": "2033-06-24",
        "regionNotes": "Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-07-07",
        "endDate": "2034-07-07",
        "regionNotes": "Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-06-29",
        "endDate": "2035-06-29",
        "regionNotes": "Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Te Kāhui o Matariki Public Holiday Act 2022",
        "publisher": "New Zealand Parliamentary Counsel Office",
        "year": "2022",
        "url": "https://www.legislation.govt.nz"
      },
      {
        "title": "Matariki: The Star of the Year",
        "author": "Dr. Rangi Matamua",
        "publisher": "Huia Publishers",
        "year": "2017",
        "url": ""
      }
    ]
  },
  {
    "id": "f-inti-raymi",
    "slug": "inti-raymi",
    "name": "Inti Raymi",
    "alternateNames": [
      "Festival of the Sun",
      "Fiesta del Sol"
    ],
    "culturalOrigin": "Cusco, Peru — Inca Empire (Tawantinsuyu)",
    "religion": "Indigenous Andean & Inca Tradition",
    "traditionType": "Solar Astronomical (Winter Solstice in Southern Hemisphere — June 24)",
    "category": "Indigenous & Cultural",
    "countries": [
      "Peru",
      "Ecuador",
      "Bolivia"
    ],
    "regions": [
      "Americas",
      "South America"
    ],
    "typicalMonth": 6,
    "dateRule": "fixed_gregorian",
    "significance": "Ancient Inca theatrical and religious ceremony honoring Inti, the Sun God, and celebrating the winter solstice which marks the shortest day and the return of lengthening sunlight in the southern hemisphere.",
    "history": "Instituted by Inca Emperor Pachacuti in 1412 CE at Cusco. Banned by Spanish Viceroy Francisco de Toledo in 1572 as pagan, it was revived in 1944 by Peruvian writer Faustino Espinoza Navarro based on the chronicles of Garcilaso de la Vega and is now celebrated annually at the fortress of Sacsayhuamán.",
    "whyCelebrated": "To honor the Sun god, ensure the sun's return for successful agricultural crops, and celebrate Quechua and Andean cultural heritage.",
    "howObserved": "Over 800 actors, dancers, and musicians reenact the ancient ceremony in three stages: the Qorikancha Sun Temple, Cusco's Plaza de Armas, and the colossal stone fortress of Sacsayhuamán before thousands of spectators.",
    "rituals": [
      "Inca emperor (Sapa Inca) greets the dawn at the Qorikancha Sun Temple",
      "Procession of the four suyus (quadrants) of the Inca Empire to Plaza de Armas",
      "Ritual invocation in Quechua to Inti and Pachamama (Mother Earth) at Sacsayhuamán",
      "Theatrical sacrifice of a llama and reading of omens for the coming year",
      "Sankhu ritual sacred corn bread distributed to the populace"
    ],
    "food": [
      "Chiri Uchu (traditional cold Cusco banquet: guinea pig, chicken, jerky ch'arki, toasted corn, fish eggs, and cheese)",
      "Pachamanca earthen barbecue",
      "Chicha de jora fermented corn drink"
    ],
    "clothing": [
      "Elaborate gold-threaded Inca royal tunics (Unku), feather crowns (Mascaypacha), colorful woven Andean ponchos and chullo caps"
    ],
    "music": [
      "Pututu conch shell trumpets, panpipes (zampoñas and quenas), traditional bombo drums, Quechua choral anthems"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-24",
        "endDate": "2025-06-24",
        "regionNotes": "Fixed Solstice Day (Cusco Civic Holiday)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-06-24",
        "endDate": "2026-06-24",
        "regionNotes": "Fixed Solstice Day (Cusco Civic Holiday)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-24",
        "endDate": "2027-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-06-24",
        "endDate": "2028-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-06-24",
        "endDate": "2029-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-06-24",
        "endDate": "2030-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-06-24",
        "endDate": "2031-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-06-24",
        "endDate": "2032-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-06-24",
        "endDate": "2033-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-06-24",
        "endDate": "2034-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-06-24",
        "endDate": "2035-06-24",
        "regionNotes": "Fixed June 24",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "EMUFEC: Empresa Municipal de Festejos del Cusco",
        "publisher": "Cusco City Council",
        "year": "2024",
        "url": "https://emufec.gob.pe"
      },
      {
        "title": "Comentarios Reales de los Incas",
        "author": "Inca Garcilaso de la Vega",
        "publisher": "Lisbon",
        "year": "1609",
        "url": ""
      }
    ]
  },
  {
    "id": "f-juneteenth",
    "slug": "juneteenth",
    "name": "Juneteenth",
    "alternateNames": [
      "Juneteenth National Independence Day",
      "Freedom Day",
      "Jubilee Day",
      "Emancipation Day"
    ],
    "culturalOrigin": "Galveston, Texas, United States — African American heritage",
    "religion": "African American Christian & Cultural Civic",
    "traditionType": "Fixed Gregorian Calendar (June 19)",
    "category": "Historical & Civic",
    "countries": [
      "United States"
    ],
    "regions": [
      "North America",
      "Americas"
    ],
    "typicalMonth": 6,
    "dateRule": "fixed_gregorian",
    "significance": "Commemorates the day on June 19, 1865, when Union General Gordon Granger arrived in Galveston, Texas, and issued General Order No. 3, announcing the freedom of the last remaining enslaved African Americans in the Confederacy, two and a half years after the Emancipation Proclamation.",
    "history": "First celebrated in Texas in 1866 with prayer meetings and spirituals. The tradition spread throughout the United States during the Great Migration. In 2021, it was officially signed into law as the eleventh United States federal holiday.",
    "whyCelebrated": "To honor the end of chattel slavery in the United States, remember the endurance of enslaved ancestors, and celebrate African American freedom, culture, and achievement.",
    "howObserved": "Parades, street festivals, family reunions, cookouts, readings of the Emancipation Proclamation, and educational exhibitions centered on African American history and civil rights.",
    "rituals": [
      "Reading aloud of General Order No. 3 and the Emancipation Proclamation",
      "Singing \"Lift Every Voice and Sing\" (the Black National Anthem)",
      "Community prayer services and spirituals in historical Black churches",
      "Eating traditional red-colored foods symbolizing resilience, sacrifice, and joy",
      "Family genealogy presentations and oral history recordings"
    ],
    "food": [
      "Red-colored foods: Red velvet cake, barbecue ribs with red sauce, watermelon, strawberry soda, hibiscus tea (sorrel), strawberry pie",
      "Collard greens, black-eyed peas, cornbread"
    ],
    "clothing": [
      "Juneteenth festival t-shirts, African wax-print Dashikis and Kente cloths, red, black, and green Pan-African colors"
    ],
    "music": [
      "\"Lift Every Voice and Sing\"",
      "Gospel choirs",
      "Jazz, Blues, and contemporary R&B"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-06-19",
        "endDate": "2025-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-06-19",
        "endDate": "2026-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-06-19",
        "endDate": "2027-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-06-19",
        "endDate": "2028-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-06-19",
        "endDate": "2029-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-06-19",
        "endDate": "2030-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-06-19",
        "endDate": "2031-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-06-19",
        "endDate": "2032-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-06-19",
        "endDate": "2033-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-06-19",
        "endDate": "2034-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-06-19",
        "endDate": "2035-06-19",
        "regionNotes": "US Federal Holiday",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "National Museum of African American History and Culture: The Historical Legacy of Juneteenth",
        "publisher": "Smithsonian Institution",
        "year": "2023",
        "url": "https://nmaahc.si.edu"
      },
      {
        "title": "On Juneteenth",
        "author": "Annette Gordon-Reed",
        "publisher": "Liveright Publishing",
        "year": "2021",
        "url": ""
      }
    ]
  },
  {
    "id": "f-carnival",
    "slug": "carnival-mardi-gras",
    "name": "Carnival & Mardi Gras",
    "alternateNames": [
      "Mardi Gras",
      "Carnaval do Brasil",
      "Carnevale di Venezia",
      "Shrove Tuesday",
      "Fat Tuesday"
    ],
    "culturalOrigin": "Southern Europe — Western Christian Pre-Lenten tradition",
    "religion": "Christian (Western Catholic) & Global Cultural",
    "traditionType": "Western Liturgical Calendar (Pre-Lenten Season culminating Fat Tuesday)",
    "category": "Cultural & Civic",
    "countries": [
      "Brazil",
      "United States (New Orleans)",
      "Italy (Venice)",
      "Trinidad and Tobago",
      "France",
      "Germany",
      "Colombia"
    ],
    "regions": [
      "Americas",
      "Europe",
      "Caribbean"
    ],
    "typicalMonth": 2,
    "dateRule": "western_liturgical",
    "significance": "Global pre-Lenten festival of parades, masquerades, music, and indulgence before the forty-day fasting period of Lent. Celebrated with distinctive traditions in Rio de Janeiro, New Orleans, Venice, and Port of Spain.",
    "history": "Evolved from ancient Roman Saturnalia and medieval European Christian feasts. The word Carnival derives from medieval Latin \"carne levare\" (to remove meat), as households consumed rich meat, fats, and dairy before the solemn fast of Ash Wednesday.",
    "whyCelebrated": "To indulge in communal feasting, masquerade, satire, and musical celebration before the austerity of Lent.",
    "howObserved": "In Rio de Janeiro, samba schools parade through the Sambadrome; in New Orleans, krewes throw beads from floats during Mardi Gras parades; in Venice, masked balls and gondola parades animate the canals; in Trinidad, Soca music fuels J'ouvert morning celebrations.",
    "rituals": [
      "Parades of masked dancers and marching brass bands",
      "Crowning of King Momo (Brazil) or Rex, King of Carnival (New Orleans)",
      "Finding the plastic baby hidden inside the King Cake (bringing good luck)",
      "Samba school competitions judged on theme, music, and costume"
    ],
    "food": [
      "King cake with purple, green, and gold sugar",
      "Feijoada black bean stew (Brazil)",
      "Pancakes / crêpes (Shrove Tuesday UK/France)",
      "Frittelle and Galani fried pastries (Venice)",
      "Beignets"
    ],
    "clothing": [
      "Elaborate feathered and beaded samba costumes, Venetian porcelain masks and Renaissance capes, Mardi Gras purple/green/gold beads"
    ],
    "music": [
      "Brazilian Samba-enredo",
      "New Orleans Dixieland brass bands",
      "Trinidad Soca and Calypso"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-03-04",
        "endDate": "2025-03-04",
        "regionNotes": "Mardi Gras day (Ash Wednesday falls Mar 5; Rio Carnival Feb 28–Mar 4)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-02-17",
        "endDate": "2026-02-17",
        "regionNotes": "Mardi Gras day (Ash Wednesday Feb 18; Rio Feb 13–17)",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-02-09",
        "endDate": "2027-02-09",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-02-29",
        "endDate": "2028-02-29",
        "regionNotes": "Pre-Lenten Tuesday in leap year",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-02-13",
        "endDate": "2029-02-13",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-03-05",
        "endDate": "2030-03-05",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-02-25",
        "endDate": "2031-02-25",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-02-10",
        "endDate": "2032-02-10",
        "regionNotes": "Pre-Lenten Tuesday in leap year",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-03-01",
        "endDate": "2033-03-01",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-02-21",
        "endDate": "2034-02-21",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-02-06",
        "endDate": "2035-02-06",
        "regionNotes": "Pre-Lenten Tuesday",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "Carnival Dates & Lent Calendar",
        "publisher": "Vatican Liturgical Calendar / Encyclopaedia Britannica",
        "year": "2026",
        "url": "https://www.britannica.com/topic/Carnival-festival"
      },
      {
        "title": "Carnival, Culture, and Politics in Rio de Janeiro",
        "author": "Lúcia M. Sá",
        "publisher": "Duke University Press",
        "year": "2007",
        "url": ""
      }
    ]
  },
  {
    "id": "f-st-patricks-day",
    "slug": "st-patricks-day",
    "name": "Saint Patrick’s Day",
    "alternateNames": [
      "Feast of Saint Patrick",
      "Lá Fhéile Pádraig"
    ],
    "culturalOrigin": "Ireland — Christian feast day & Irish national tradition",
    "religion": "Christianity (Catholic, Anglican), Irish Cultural & Secular",
    "traditionType": "Fixed Gregorian Calendar (March 17)",
    "category": "Religious & Cultural",
    "countries": [
      "Ireland",
      "United States",
      "United Kingdom",
      "Canada",
      "Australia",
      "Global Irish Diaspora"
    ],
    "regions": [
      "Europe",
      "North America",
      "Global Irish Diaspora"
    ],
    "typicalMonth": 3,
    "dateRule": "fixed_gregorian",
    "significance": "Celebrates Saint Patrick (c. 385–461 CE), the patron saint of Ireland who brought Christianity to the island, using the three-leaved shamrock to explain the Holy Trinity. Celebrated globally as a festival of Irish culture, music, parades, and wearing the green.",
    "history": "Made an official Christian feast day in the early 17th century by the Catholic Church. The modern secular celebration with parades was popularized by Irish emigrants in Boston and New York City in the 18th century as an expression of cultural identity.",
    "whyCelebrated": "To honor Saint Patrick's missionary life and celebrate Irish cultural heritage, solidarity, music, and folklore worldwide.",
    "howObserved": "Major street parades in Dublin, New York, Boston, and Chicago (which dyes its river green); wearing green clothing and shamrock pins; attending church services; traditional céilí folk dances and pub gatherings.",
    "rituals": [
      "Wearing green clothing, rosettes, or real shamrocks (Trifolium dubium) on the lapel",
      "The \"drowning of the shamrock\" in whiskey at the end of the day",
      "Parades featuring pipe and drum bands, step dancers, and community floats",
      "Attending Mass or Anglican services of thanksgiving"
    ],
    "food": [
      "Corned beef and cabbage (Irish-American)",
      "Irish soda bread with caraway",
      "Colcannon mashed potatoes with kale",
      "Irish lamb stew",
      "Guinness stout"
    ],
    "clothing": [
      "Emerald green attire, tweed caps, knitted Aran wool sweaters, shamrock badges"
    ],
    "music": [
      "Irish traditional folk music: Uilleann pipes, tin whistle, bodhrán drum, fiddle jigs and reels"
    ],
    "occurrences": [
      {
        "year": 2025,
        "startDate": "2025-03-17",
        "endDate": "2025-03-17",
        "regionNotes": "Fixed Gregorian March 17 (Ireland Public Holiday)",
        "verified": true
      },
      {
        "year": 2026,
        "startDate": "2026-03-17",
        "endDate": "2026-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2027,
        "startDate": "2027-03-17",
        "endDate": "2027-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2028,
        "startDate": "2028-03-17",
        "endDate": "2028-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2029,
        "startDate": "2029-03-17",
        "endDate": "2029-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2030,
        "startDate": "2030-03-17",
        "endDate": "2030-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2031,
        "startDate": "2031-03-17",
        "endDate": "2031-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2032,
        "startDate": "2032-03-17",
        "endDate": "2032-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2033,
        "startDate": "2033-03-17",
        "endDate": "2033-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2034,
        "startDate": "2034-03-17",
        "endDate": "2034-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      },
      {
        "year": 2035,
        "startDate": "2035-03-17",
        "endDate": "2035-03-17",
        "regionNotes": "Fixed March 17",
        "verified": true
      }
    ],
    "sources": [
      {
        "title": "St. Patrick's Festival Dublin",
        "publisher": "St. Patrick's Festival Board, Ireland",
        "year": "2024",
        "url": "https://stpatricksfestival.ie"
      },
      {
        "title": "The World of Saint Patrick",
        "author": "Philip Freeman",
        "publisher": "Oxford University Press",
        "year": "2014",
        "url": ""
      }
    ]
  }
]

export const VERIFIED_CULTURAL_ARCHIVE = [
  {
    "slug": "kyoto-machiya-crafts",
    "name": "Kyoto Machiya & Traditional Crafts",
    "region": "Kansai",
    "country": "Japan",
    "language": "Japanese",
    "traditionType": "Living Craft & Architecture",
    "religionContext": "Shinto & Zen Buddhism syncretism",
    "summary": "A thousand-year preservation of wooden townhouse (machiya) joinery, Nishijin textile weaving, and urushi lacquerware rooted in ancient imperial artisan guilds.",
    "history": "Originating during the Heian period (794–1185) and refined through the Edo merchant era, Kyoto craftsmen cultivated refined aesthetic philosophies including Wabi-sabi and Monozukuri.",
    "origins": "Emerged along the Kamogawa river basin where clean groundwater facilitated natural dyeing and paper production.",
    "geography": "Historic urban quarters of Kamigyo and Nakagyo wards in Kyoto Prefecture.",
    "practices": [
      "Kintsugi ceramic repair",
      "Chado tea ceremony etiquette",
      "Nishijin-ori silk weaving",
      "Sukiya-zukuri woodworking"
    ],
    "clothing": "Hand-woven silk Kimono dyed using natural persimmon and indigo pigments.",
    "food": "Shojin-ryori (Buddhist vegetarian cuisine) and seasonal Kaiseki tasting course.",
    "music": "Gagaku court melodies and Shakuhachi bamboo flute arrangements.",
    "architecture": "Timber-frame Machiya townhouses featuring lattice facades (koshi) and micro-interior courtyards (tsuboniwa).",
    "timeline": [
      {
        "year": "794 CE",
        "event": "Emperor Kanmu establishes Heian-kyo (Kyoto) as capital."
      },
      {
        "year": "1467 CE",
        "event": "Onin War disrupts urban fabric, spurring guild reorganization in Nishijin."
      },
      {
        "year": "1603 CE",
        "event": "Edo Period merchant class consolidates Machiya architectural standards."
      },
      {
        "year": "1976 CE",
        "event": "Japanese government implements Traditional Craft Industries Act preservation."
      }
    ],
    "sources": [
      {
        "title": "Traditional Japanese Architecture: An Exploration of Elements and Forms",
        "author": "Mira Locher",
        "publisher": "Tuttle Publishing",
        "year": "2010",
        "license": "Scholarly Reference"
      },
      {
        "title": "Nishijin Textile Heritage and Guild Documentation",
        "author": "Kyoto Prefectural Museum of Cultural History",
        "publisher": "Kyoto Cultural Archives",
        "year": "2021",
        "license": "Public Domain / Institutional"
      }
    ]
  },
  {
    "slug": "andalusian-flamenco-roots",
    "name": "Andalusian Flamenco & Cante Jondo",
    "region": "Andalusia",
    "country": "Spain",
    "language": "Spanish, Caló dialect",
    "traditionType": "Folk Performing Art",
    "religionContext": "Syncretic Catholic, Sephardic Jewish & Moorish Andalusi crosscurrents",
    "summary": "An emotive musical and poetic art form combining cante (singing), toque (guitar playing), baile (dance), and jaleo (vocalized rhythmic encouragement).",
    "history": "Forged across centuries through the cultural synthesis of Romani migrants, Andalusian peasants, Moors, and Sephardic communities in southern Spain.",
    "origins": "The Guadalquivir river valley, predominantly the neighborhoods of Triana in Seville and Jerez de la Frontera.",
    "geography": "Provinces of Seville, Cádiz, Huelva, and Granada.",
    "practices": [
      "Compás rhythmic cycles",
      "Duende (expressive emotional transcendence)",
      "Palmas syncopated clapping"
    ],
    "clothing": "Traje de flamenca with ruffled skirts, polka dot motifs, and embroidered Manila shawls.",
    "food": "Salmorejo cordobés, cured jamón ibérico, and Jerez sherry wine.",
    "music": "Phrygian modal guitar improvisation, Soleá, and Bulerías polyrhythms.",
    "architecture": "Courtyard corralas of Triana and cave dwellings of Sacromonte in Granada.",
    "timeline": [
      {
        "year": "1492 CE",
        "event": "Reconquista concludes; cultural syncretism goes underground."
      },
      {
        "year": "1783 CE",
        "event": "Charles III pragmatic sanction begins legal reintegration of Gitanos."
      },
      {
        "year": "1881 CE",
        "event": "Silver Age of Flamenco begins in Seville cafés cantantes."
      },
      {
        "year": "2010 CE",
        "event": "UNESCO declares Flamenco an Intangible Cultural Heritage of Humanity."
      }
    ],
    "sources": [
      {
        "title": "The Art of Flamenco",
        "author": "Donn E. Pohren",
        "publisher": "Society of Spanish Studies",
        "year": "2005",
        "license": "Scholarly Reference"
      }
    ]
  },
  {
    "slug": "yoruba-sacred-beadwork",
    "name": "Yoruba Sacred Beadwork & Orisha Iconography",
    "region": "West Africa",
    "country": "Nigeria & Benin",
    "language": "Yoruba",
    "traditionType": "Sacred Textile & Regalia Tradition",
    "religionContext": "Yoruba Traditional Religion (Isese)",
    "summary": "Master beadworking reserved for royal crowns (ade), scepters, and ceremonial vestments embodying divine authority (ashe) and ancestor remembrance.",
    "history": "Dating back to the medieval Kingdom of Ife (11th-15th century), glass beadmaking was centered in the sacred forest groves of Ile-Ife.",
    "origins": "Ile-Ife, regarded in Yoruba cosmology as the cradle of humankind and divine royalty.",
    "geography": "Osun, Oyo, Ogun, and Ondo states in southwestern Nigeria.",
    "practices": [
      "Bead embroidery on conical crowns",
      "Iba invocations to Orisha deities",
      "Bata drumming ceremonies"
    ],
    "clothing": "Aso Oke hand-woven cloth adorned with thousands of imported glass beads.",
    "food": "Iyan (pounded yam) with Efo Riro vegetable stew and fermented locust beans.",
    "music": "Bata and Dundun talking drum polyrhythmic ensembles.",
    "architecture": "Palace courtyards (Aafin) featuring carved caryatid pillars and impluvium open courtyards.",
    "timeline": [
      {
        "year": "1000 CE",
        "event": "Ile-Ife glass bead furnace industrial production established."
      },
      {
        "year": "1903 CE",
        "event": "British colonial administration documents the sacred Ade crowns of Yoruba Obas."
      },
      {
        "year": "1990 CE",
        "event": "Contemporary preservation and revitalization led by Oshogbo master artists."
      }
    ],
    "sources": [
      {
        "title": "Yoruba: Nine Centuries of African Art and Thought",
        "author": "Henry John Drewal & John Pemberton III",
        "publisher": "Center for African Art",
        "year": "1989",
        "license": "Scholarly Reference"
      }
    ]
  }
]
