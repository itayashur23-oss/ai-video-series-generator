
import { Genre, VisualStyle, CameraAngle, SeriesTemplate } from "./types";

export const SERIES_TEMPLATES: SeriesTemplate[] = [
  {
    id: "neon_detective",
    name: { en: "Neon Noir Detective", he: "בלש סייברפאנק" },
    description: { en: "A gritty detective solving crimes in a rain-soaked futuristic city.", he: "בלש קשוח פותר תעלומות בעיר עתידנית גשומה וספוגת ניאון." },
    thumbnailIcon: "🕵️‍♂️",
    config: {
      topic: "A retired detective is pulled back for one last case involving a rogue AI in Sector 7.",
      genre: Genre.SciFi,
      style: VisualStyle.Cyberpunk,
      camera: CameraAngle.Medium,
      characterInstructions: "Serious expression, smoking electronic cigarette, trench coat always moving in wind.",
      characters: [
        { id: "t1_c1", name: "Detective Vance", description: "A grizzled private investigator in his mid-50s with a rugged square jawline and deep-set, weary eyes. His LEFT eye is a prominent cybernetic ocular implant that emits a constant, glowing crimson red LED light from a mechanical iris. His face is marked by a jagged vertical scar crossing his RIGHT eyebrow and another faint scar on his left cheek. He has thick, salt-and-pepper 4-day stubble. He wears a heavy, wet beige trench coat with a popped collar, made of water-resistant synthetic canvas that reflects neon light. A dark brown felt fedora is pulled low over his forehead, with visible water droplets dripping from the brim." }
      ]
    }
  },
  {
    id: "fantasy_quest",
    name: { en: "Epic Fantasy Quest", he: "מסע פנטזיה אפי" },
    description: { en: "Heroes journey through magical lands to find an ancient artifact.", he: "גיבורים במסע בארצות קסומות למציאת עתיקות עתיק." },
    thumbnailIcon: "🐉",
    config: {
      topic: "A young elf and an old warrior must carry the Crystal of Light to the Mountain of Shadows.",
      genre: Genre.Fantasy,
      style: VisualStyle.Cinematic,
      camera: CameraAngle.Wide,
      characterInstructions: "Epic poses, wind blowing through hair, magical aura.",
      characters: [
        { id: "t2_c1", name: "Elara", description: "A graceful young elf with ethereal features, high cheekbones, and wide almond-shaped emerald green eyes. Her waist-length silver hair flows freely, styled with two thin braids on the LEFT side decorated with tiny glowing white flowers. She wears organic leaf-leather armor crafted from overlapping emerald-green scales that mimic natural foliage, layered over a soft brown suede tunic. In her RIGHT hand, she grips a gnarled staff made of ancient white oak, topped with a large translucent crystal that emits a soft, warm amber glow. Her long, pointed ears are adorned with delicate silver cuffs on the LEFT ear. She has a faint, glowing green vine tattoo winding up her RIGHT forearm." },
        { id: "t2_c2", name: "Borg", description: "A hulking, muscular warrior with an imposing physique standing over 6'5\". His head is completely bald and gleaming slightly. He possesses a thick, bushy dark brown beard that reaches his upper chest, braided into two distinct sections secured with heavy iron rings at the ends. His face is weathered and scarred, with a noticeably broken nose. He wears a full set of battle-worn, dark forged iron plate armor, covered in deep dents and scratches. The chest plate features a prominent embossed emblem of a roaring bear's head. A tattered, dark red fur cloak is clasped to his large shoulder pauldrons with heavy iron chains. A colossal two-handed greatsword with a chipped blade and leather-wrapped hilt is strapped across his back." }
      ]
    }
  },
  {
    id: "pixar_pets",
    name: { en: "Lost Pets Adventure", he: "הרפתקאות חיות מחמד" },
    description: { en: "Cute animals trying to find their way home (Pixar Style).", he: "חיות חמודות מנסות למצוא את הדרך הביתה (בסגנון פיקסאר)." },
    thumbnailIcon: "🐾",
    config: {
      topic: "A house cat and a stray dog team up to cross the busy city and find their owner.",
      genre: Genre.Comedy,
      style: VisualStyle.Pixar,
      camera: CameraAngle.LowAngle,
      characterInstructions: "Exaggerated cute expressions, big eyes, fluffy fur texture.",
      characters: [
        { id: "t3_c1", name: "Mittens", description: "Small tuxedo cat (black and white), big green eyes, red collar with a bell." },
        { id: "t3_c2", name: "Barky", description: "Golden Retriever puppy, messy fur, happy expression, tongue out, blue bandana." }
      ]
    }
  },
  {
    id: "alien_nature",
    name: { en: "Alien Planet Documentary", he: "דוקו כוכב חייזרי" },
    description: { en: "National Geographic style documentary about life on a purple planet.", he: "סרט טבע דוקומנטרי על חיים בכוכב לכת סגול." },
    thumbnailIcon: "🪐",
    config: {
      topic: "Documenting the migration of the giant floating whales on the planet Zog during the triple sunset.",
      genre: Genre.Documentary,
      style: VisualStyle.Realistic,
      camera: CameraAngle.Drone,
      characterInstructions: "Natural movement, animalistic behavior, no human interaction.",
      characters: [
        { id: "t4_c1", name: "Sky Whale", description: "Gigantic bio-luminescent creature resembling a whale but with 4 wings, floating in the sky. Blue and pink glowing patterns." }
      ]
    }
  },
  {
    id: "vintage_horror",
    name: { en: "Victorian Horror", he: "אימה ויקטוריאנית" },
    description: { en: "Gothic horror mystery in a haunted mansion (19th century).", he: "מסתורין אימה גותי באחוזה רדופה (המאה ה-19)." },
    thumbnailIcon: "👻",
    config: {
      topic: "A governess arrives at a gloomy manor only to find the children behave strangely at night.",
      genre: Genre.Horror,
      style: VisualStyle.Vintage,
      camera: CameraAngle.EyeLevel,
      characterInstructions: "Fearful expressions, holding candle, dark shadows, pale skin.",
      characters: [
        { id: "t5_c1", name: "Miss Blackwood", description: "Woman in black victorian dress, high collar, hair in a tight bun, pale terrified face, holding a candelabra." }
      ]
    }
  },
  {
    id: "space_opera",
    name: { en: "Galactic Space Opera", he: "אופרת חלל" },
    description: { en: "Space battles and political intrigue in a distant galaxy.", he: "קרבות חלל ותככים פוליטיים בגלקסיה רחוקה." },
    thumbnailIcon: "🚀",
    config: {
      topic: "A rebel pilot steals the plans for the Empire's new super-weapon.",
      genre: Genre.SciFi,
      style: VisualStyle.Cinematic,
      camera: CameraAngle.Wide,
      characterInstructions: "Heroic, action-oriented, futuristic technology usage.",
      characters: [
        { id: "t6_c1", name: "Commander Kael", description: "Male pilot, orange flight suit with white vest, helmet under arm, futuristic blaster on hip." }
      ]
    }
  },
  {
    id: "sitcom_cafe",
    name: { en: "Coffee Shop Sitcom", he: "סיטקום בבית קפה" },
    description: { en: "Friends hanging out in a cozy coffee shop (90s style).", he: "חברים מבלים בבית קפה שכונתי (סגנון שנות ה-90)." },
    thumbnailIcon: "☕",
    config: {
      topic: "The gang debates whether a hotdog is a sandwich while waiting for their orders.",
      genre: Genre.Comedy,
      style: VisualStyle.Realistic,
      camera: CameraAngle.Medium,
      characterInstructions: "Casual gestures, laughing, drinking coffee, expressive hand movements.",
      characters: [
        { id: "t7_c1", name: "Rossi", description: "Man, 30s, black hair gelled up, wearing a leather jacket and jeans. Smirking." },
        { id: "t7_c2", name: "Rachelina", description: "Woman, 20s, blonde hair, wearing a denim apron (waitress uniform)." }
      ]
    }
  },
  {
    id: "clay_monsters",
    name: { en: "Claymation Monsters", he: "מפלצות פלסטלינה" },
    description: { en: "Stop-motion style funny monsters living under a bed.", he: "מפלצות מצחיקות מפלסטלינה שחיות מתחת למיטה." },
    thumbnailIcon: "👾",
    config: {
      topic: "The monster under the bed is actually afraid of the child's toys.",
      genre: Genre.Comedy,
      style: VisualStyle.Claymation,
      camera: CameraAngle.LowAngle,
      characterInstructions: "Jerky stop-motion movement, fingerprint textures on clay, goofy expressions.",
      characters: [
        { id: "t8_c1", name: "Gloop", description: "Green blob monster made of clay, one big eye, two small arms, goofy smile." }
      ]
    }
  },
  {
    id: "samurai_anime",
    name: { en: "Samurai Showdown", he: "סמוראי אנימה" },
    description: { en: "High-octane anime action with swords and cherry blossoms.", he: "אקשן אנימה מהיר עם חרבות ופריחת הדובדבן." },
    thumbnailIcon: "⚔️",
    config: {
      topic: "A lone wandering samurai defends a village from bandits during the spring festival.",
      genre: Genre.Action,
      style: VisualStyle.Anime,
      camera: CameraAngle.LowAngle,
      characterInstructions: "Intense staring, hand on sword hilt, wind blowing robes.",
      characters: [
        { id: "t9_c1", name: "Ronin X", description: "Anime style swordsman, long black ponytail, red kimono with white flower patterns, scar over eye, holding katana." }
      ]
    }
  },
  {
    id: "steampunk_inventor",
    name: { en: "Steampunk Inventor", he: "ממציא סטימפאנק" },
    description: { en: "Brass gears, steam engines, and Victorian adventure.", he: "גלגלי שיניים, קיטור והרפתקאות ויקטוריאניות." },
    thumbnailIcon: "⚙️",
    config: {
      topic: "An inventor tests her new steam-powered flying backpack over the smoggy city.",
      genre: Genre.SciFi,
      style: VisualStyle.Realistic,
      camera: CameraAngle.FullBody,
      characterInstructions: "Excited, tinkering with tools, wearing goggles.",
      characters: [
        { id: "t10_c1", name: "Lady Gear", description: "Woman with brown curly hair, brass goggles on forehead, brown leather corset, white shirt, holding a wrench." }
      ]
    }
  },

  // --- NEW TEMPLATES (DOCUMENTARY) ---

  {
    id: "deep_sea_doc",
    name: { en: "Deep Sea Mysteries", he: "מסתרי המעמקים" },
    description: { en: "Bioluminescent creatures in the darkest parts of the ocean.", he: "יצורים זוהרים במעמקים החשוכים ביותר של האוקיינוס." },
    thumbnailIcon: "🦑",
    config: {
      topic: "Exploring the unknown ecosystem of the Mariana Trench.",
      genre: Genre.Documentary,
      style: VisualStyle.Realistic,
      camera: CameraAngle.CloseUp,
      characterInstructions: "Slow movement, floating, glowing lights, organic textures.",
      characters: [
        { id: "t11_c1", name: "Abyss Jellyfish", description: "Translucent jellyfish with neon blue bio-luminescent tendrils, floating in pitch black water." }
      ]
    }
  },
  {
    id: "savanna_wildlife",
    name: { en: "Savanna Wildlife", he: "חיות הסוואנה" },
    description: { en: "Classic nature documentary about lions in Africa.", he: "דוקו טבע קלאסי על אריות באפריקה." },
    thumbnailIcon: "🦁",
    config: {
      topic: "A pride of lions struggling to survive during the dry season.",
      genre: Genre.Documentary,
      style: VisualStyle.Realistic,
      camera: CameraAngle.Wide,
      characterInstructions: "Realistic animal behavior, walking through tall grass, resting in shade.",
      characters: [
        { id: "t12_c1", name: "Simba the King", description: "Large male African lion with a thick dark mane, scars on nose, golden fur, powerful build." }
      ]
    }
  },
  {
    id: "ancient_egypt_doc",
    name: { en: "Building History: Egypt", he: "היסטוריה: מצרים העתיקה" },
    description: { en: "Historical reenactment of the construction of the pyramids.", he: "שחזור היסטורי של בניית הפירמידות." },
    thumbnailIcon: "🏺",
    config: {
      topic: "The architectural engineering behind the Great Pyramid of Giza.",
      genre: Genre.Documentary,
      style: VisualStyle.Cinematic,
      camera: CameraAngle.Drone,
      characterInstructions: "Working hard, carrying stones, wiping sweat, historical clothing.",
      characters: [
        { id: "t13_c1", name: "Architect Imhotep", description: "Ancient Egyptian man, bald, wearing white linen kilt and gold necklace, holding papyrus scrolls." }
      ]
    }
  },
  {
    id: "micro_world",
    name: { en: "Microscopic World", he: "העולם המיקרוסקופי" },
    description: { en: "Macro photography documentary of insects.", he: "דוקו צילום מאקרו של חרקים." },
    thumbnailIcon: "🐞",
    config: {
      topic: "The daily life of a worker ant in a massive colony.",
      genre: Genre.Documentary,
      style: VisualStyle.Realistic,
      camera: CameraAngle.CloseUp, // Macro
      characterInstructions: "Detailed insect movement, twitching antennae, crawling.",
      characters: [
        { id: "t14_c1", name: "Worker Ant 409", description: "Red fire ant, highly detailed macro shot, sharp mandibles, shiny exoskeleton." }
      ]
    }
  },
  {
    id: "solar_punk_future",
    name: { en: "Future Cities: 2150", he: "ערי העתיד: 2150" },
    description: { en: "Architectural documentary about sustainable future living.", he: "דוקו אדריכלי על חיים ברי קיימא בעתיד." },
    thumbnailIcon: "🏙️",
    config: {
      topic: "How humanity adapted to live in vertical forests and solar-powered cities.",
      genre: Genre.Documentary,
      style: VisualStyle.Realistic,
      camera: CameraAngle.Drone,
      characterInstructions: "Peaceful, advanced technology usage, wearing organic fabrics.",
      characters: [
        { id: "t15_c1", name: "Eco-Architect", description: "An elegant woman in her early 30s with a sharp, asymmetrical short white pixie cut and piercing icy blue eyes. She wears flowing futuristic robes made of a unique white organic fabric that has a subtle, iridescent pearly sheen and resembles woven silk-vines. The robes have a high structured collar and silver luminescent embroidery on the RIGHT sleeve. On her LEFT ear, she wears a delicate silver holographic communication device. She stands on a seamless transparent glass balcony that overlooks a high-tech city. Around her, lush bioluminescent floating plants in white ceramic pots are arranged, with long trailing vines that react to the wind." }
      ]
    }
  },

  // --- NEW TEMPLATES (PIXAR ANIMALS) ---

  {
    id: "office_zoo",
    name: { en: "Office Zoo", he: "גן חיות במשרד" },
    description: { en: "Animals working 9-to-5 jobs in a busy office (Pixar Style).", he: "חיות עובדות בעבודות משרדיות רגילות (בסגנון פיקסאר)." },
    thumbnailIcon: "👔",
    config: {
      topic: "A stressed bear manager tries to get his team of rabbits to finish the report on time.",
      genre: Genre.Comedy,
      style: VisualStyle.Pixar,
      camera: CameraAngle.Medium,
      characterInstructions: "Human-like gestures, typing on computers, drinking coffee, wearing ties.",
      characters: [
        { id: "t16_c1", name: "Mr. Grizzly", description: "Large brown bear wearing a white shirt and a blue tie, holding a tiny coffee mug. Stressed expression." },
        { id: "t16_c2", name: "Intern Hop", description: "Small white rabbit wearing big glasses and a headset, looking overwhelmed." }
      ]
    }
  },
  {
    id: "space_hamsters",
    name: { en: "Space Hamsters", he: "אוגרי החלל" },
    description: { en: "Tiny hamsters in space suits exploring a kitchen (Pixar Style).", he: "אוגרים בחליפות חלל חוקרים את המטבח (בסגנון פיקסאר)." },
    thumbnailIcon: "🐹",
    config: {
      topic: "The hamster astronauts land on the 'Moon' (a giant block of cheese on the table).",
      genre: Genre.SciFi,
      style: VisualStyle.Pixar,
      camera: CameraAngle.LowAngle,
      characterInstructions: "Floating in zero-g (slow motion), waddling in heavy suits, sniffing.",
      characters: [
        { id: "t17_c1", name: "Captain Fluff", description: "Golden hamster wearing a high-tech white space suit with a bubble helmet. Serious face." }
      ]
    }
  },
  {
    id: "bakery_cats",
    name: { en: "The Cat Bakery", he: "מאפיית החתולים" },
    description: { en: "Cats trying to run a French bakery (Pixar Style).", he: "חתולים מנסים לנהל מאפייה צרפתית (בסגנון פיקסאר)." },
    thumbnailIcon: "🥐",
    config: {
      topic: "The head baker cat accidentally knocks over the flour sack right before the critics arrive.",
      genre: Genre.Comedy,
      style: VisualStyle.Pixar,
      camera: CameraAngle.Medium,
      characterInstructions: "Kneading dough with paws, covered in white flour, wearing chef hats.",
      characters: [
        { id: "t18_c1", name: "Chef Meow", description: "Persian white cat wearing a tall chef's hat and a red scarf. Covered in flour dust." }
      ]
    }
  },
  {
    id: "penguin_detective",
    name: { en: "Penguin P.I.", he: "בלש פינגווין" },
    description: { en: "A penguin detective in a snowy city (Pixar Style).", he: "פינגווין בלש בעיר מושלגת (בסגנון פיקסאר)." },
    thumbnailIcon: "🐧",
    config: {
      topic: "Solving the mystery of the missing fish in Iceberg City.",
      genre: Genre.Mystery,
      style: VisualStyle.Pixar,
      camera: CameraAngle.Medium,
      characterInstructions: "Waddling but acting tough, holding a magnifying glass, looking suspicious.",
      characters: [
        { id: "t19_c1", name: "Detective Waddles", description: "Emperor penguin wearing a beige trench coat and a fedora hat. Stern look." }
      ]
    }
  },
  {
    id: "garden_bugs",
    name: { en: "Backyard Kingdom", he: "ממלכת החצר האחורית" },
    description: { en: "Insects building a civilization in the grass (Pixar Style).", he: "חרקים בונים ציוויליזציה בדשא (בסגנון פיקסאר)." },
    thumbnailIcon: "🐜",
    config: {
      topic: "An adventurous beetle helps a lost ladybug find her way back to the flower castle.",
      genre: Genre.Action,
      style: VisualStyle.Pixar,
      camera: CameraAngle.LowAngle, // Bug view
      characterInstructions: "Expressive faces on insects, standing on two legs, using leaves as tools.",
      characters: [
        { id: "t20_c1", name: "Sir Beetle", description: "Shiny green beetle wearing a backpack made of a nut shell, holding a twig staff." }
      ]
    }
  },

  // --- NEW: VIRAL SOCIAL MEDIA TRENDS ---

  {
    id: "viral_satisfying",
    name: { en: "Oddly Satisfying (ASMR)", he: "סיפוק ויזואלי (ASMR)" },
    description: { en: "Viral TikTok style: Kinetic sand, crushing, and textures.", he: "סגנון טיקטוק ויראלי: חול קינטי, מעיכת דברים וטקסטורות מספקות." },
    thumbnailIcon: "✨",
    config: {
      topic: "A compilation of extremely satisfying visual textures and slow motion destruction of soft objects.",
      genre: Genre.Documentary, // Closest fit for "observation"
      style: VisualStyle.Realistic,
      camera: CameraAngle.CloseUp,
      characterInstructions: "No humans, just hands or automated presses. Slow, smooth motion. High detail textures.",
      characters: []
    }
  },
  {
    id: "viral_liminal",
    name: { en: "Liminal Spaces (Backrooms)", he: "מרחבים לימינליים (Backrooms)" },
    description: { en: "Creepy, empty nostalgia and the uncanny valley.", he: "מרחבים ריקים, מפחידים ומעוררי נוסטלגיה (תופעת ה-Liminal Spaces)." },
    thumbnailIcon: "🚪",
    config: {
      topic: "Exploration of an endless, empty yellow office complex with buzzing lights and damp carpet.",
      genre: Genre.Horror,
      style: VisualStyle.Vintage, // VHS look
      camera: CameraAngle.POV,
      characterInstructions: "No characters, just the camera moving slowly through empty spaces. Unsettling stillness.",
      characters: []
    }
  },
  {
    id: "viral_luxury",
    name: { en: "Luxury Lifestyle", he: "חיי פאר (Luxury Aesthetic)" },
    description: { en: "Supercars, mansions, and travel aesthetics.", he: "מכוניות יוקרה, אחוזות ונופים עוצרי נשימה (Lifestyle)." },
    thumbnailIcon: "🥂",
    config: {
      topic: "A day in the life of a billionaire travelling from a private jet to a yacht in Monaco.",
      genre: Genre.Documentary, // Lifestyle
      style: VisualStyle.Cinematic,
      camera: CameraAngle.Wide,
      characterInstructions: "Elegant clothing, sunglasses, champagne, slow motion walking, looking away from camera.",
      characters: [
        { id: "t23_c1", name: "The Influencer", description: "Young successful model, wearing high-end fashion designer suit/dress, gold watch." }
      ]
    }
  },
  {
    id: "viral_facts",
    name: { en: "Mind-Blowing Space Facts", he: "עובדות חלל מטורפות" },
    description: { en: "Visualizing cosmic scales and black holes for Shorts/Reels.", he: "ויזואליזציה של גדלים בחלל וחורים שחורים לסרטונים קצרים." },
    thumbnailIcon: "🌌",
    config: {
      topic: "Visualizing what happens when you fall into a black hole compared to a neutron star.",
      genre: Genre.Educational,
      style: VisualStyle.Cinematic,
      camera: CameraAngle.Drone,
      characterInstructions: "Epic scale, massive celestial bodies, floating astronaut for scale.",
      characters: [
        { id: "t24_c1", name: "The Traveler", description: "Tiny astronaut figure floating in the vastness of space, reflecting the cosmos in visor." }
      ]
    }
  },
  {
    id: "viral_motivation",
    name: { en: "Dark Motivation", he: "מוטיבציה אפלה (Dark Psychology)" },
    description: { en: "Stoic, high contrast, discipline and hustle culture.", he: "סטואיות, ניגודיות גבוהה, משמעת עצמית ופיתוח גוף." },
    thumbnailIcon: "💪",
    config: {
      topic: "A lone athlete training in the rain at night, pushing past limits.",
      genre: Genre.Drama,
      style: VisualStyle.Noir,
      camera: CameraAngle.Medium,
      characterInstructions: "Intense focus, sweat, rain, hoodie up, shadow boxing or lifting heavy weights.",
      characters: [
        { id: "t25_c1", name: "The Stoic", description: "Muscular man in a dark hoodie, face hidden in shadow, intense eyes visible. Gritty texture." }
      ]
    }
  }
];
