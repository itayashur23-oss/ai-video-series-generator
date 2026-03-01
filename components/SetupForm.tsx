
import React, { useRef, useState, useEffect } from 'react';
import { CameraAngle, SeriesConfig, VisualStyle, Genre, Language, Character, TargetEngine, SeriesTemplate } from '../types';
import { translations, GENRE_LABELS, CAMERA_LABELS, STYLE_LABELS } from '../translations';
import { Clapperboard, Video, User, List, Camera, Film, Loader2, Image as ImageIcon, X, MessageSquarePlus, MonitorPlay, Timer, MessageCircle, Sparkles, Subtitles, Captions, Images, Layers, Globe, Trash2, Link, Download, BookOpen, Cpu, Grid, LayoutTemplate, Save, Smartphone, Square, RectangleVertical, Palette, Wind, ChevronDown, Settings2 } from 'lucide-react';
import { generateRandomSeriesIdea } from '../services/geminiService';
import { SERIES_TEMPLATES } from '../templates';

interface SetupFormProps {
  config: SeriesConfig;
  setConfig: React.Dispatch<React.SetStateAction<SeriesConfig>>;
  onSubmit: () => void;
  isLoading: boolean;
  lang: Language;
}

// Localized preset structure
interface LocalizedPreset {
  name: Record<Language, string>;
  description: Record<Language, string>;
}

const CUSTOM_CHARS_KEY = 'storystream_custom_chars';

// Pre-defined detailed characters with localization
const PRESET_CHARACTERS: LocalizedPreset[] = [
  // --- Modern / Realistic ---
  {
    name: { en: "Casual Guy (Dan)", he: "בחור רגיל (דן)" },
    description: {
        en: "A lean young man in his mid-20s with a sharp jawline and tanned skin. He has short, messy chestnut brown hair and intense hazel eyes. He wears a high-quality plain white crew-neck t-shirt and slim-fit blue denim jeans featuring a prominent horizontal tear exactly on the LEFT knee. His footwear consists of bright red canvas sneakers. On his LEFT wrist, he wears a minimalist silver watch with a metallic link strap. He has a subtle 3-day stubble.",
        he: "בחור צעיר ורזה באמצע שנות ה-20 לחייו, בעל קו לסת חד ועור שחום. יש לו שיער חום ערמוני קצר ומבולגן ועיניים בצבע דבש (הייזל) עמוק. הוא לובש חולצת טי לבנה איכותית עם צווארון עגול וג'ינס כחול בגזרה צרה הכולל קרע אופקי בולט בדיוק בברך שמאל. לרגליו נעלי ספורט אדומות מבד קנבס. על פרק יד שמאל הוא עונד שעון כסוף מינימליסטי עם רצועת חוליות מתכתית. יש לו זיפים קלים של שלושה ימים."
    }
  },
  {
 "name": { "en": "The Arrogant Chef (Julian)", "he": "שף פרטי (ג'וליאן)" },
    "description": {
        "en": "A tall, slender man in his 40s with an unnaturally long neck and his nose physically tilted upward in a permanent expression of disdain. He wears a bespoke, snow-white double-breasted chef's jacket with 24-karat gold buttons and a silk lavender cravat tied perfectly around his neck. His thin, manicured mustache is waxed into sharp points. On his LEFT hand, he wears a massive diamond ring over his white silk gloves. He holds a gold-plated wire whisk as if it were a royal scepter.",
        "he": "גבר גבוה ורזה בשנות ה-40 לחייו, בעל צוואר ארוך בצורה יוצאת דופן ואף שמוטה פיזית כלפי מעלה בהבעה קבועה של זלזול. הוא לובש מקטרת שף (ג'קט) לבנה כשלג עם רכיסה כפולה וכפתורי זהב 24 קראט, ועניבת משי (קראבט) בצבע לבנדר הקשורה בצורה מושלמת לצווארו. שפמו הדק והמטופח משוח בשעווה לקצוות חדים. על ידו השמאלית הוא עונד טבעת יהלום מאסיבית מעל כפפות משי לבנות. הוא אוחז במטרפה מצופה זהב כאילו הייתה שרביט מלכותי."
    }
  },
  {
    "name": { "en": "TV Host (Leo)", "he": "מנחה טלוויזיה (ליאו)" },
    "description": {
        "en": "A charismatic young man in his mid-20s with an unnaturally bright, toothy white smile and skin perfectly bronzed by studio makeup. His dark hair is styled in a voluminous, gravity-defying quiff. He wears a slim-fit electric blue suit over a patterned silk shirt with the top two buttons undone. A thin, transparent earpiece wire is visible behind his RIGHT ear. He holds a slim silver microphone with a glowing red 'ON AIR' logo. He has a high-energy, almost manic expression in his wide hazel eyes.",
        "he": "בחור צעיר וכריזמטי באמצע שנות ה-20 לחייו, בעל חיוך לבן ובוהק בצורה לא טבעית ועור שזוף באופן מושלם על ידי איפור אולפן. שיערו הכהה מעוצב בתספורת 'קוויף' (Quiff) בעלת נפח המאתגרת את כוח המשיכה. הוא לובש חליפה בגזרה צרה בצבע כחול אלקטריק מעל חולצת משי מודפסת כששני הכפתורים העליונים פתוחים. חוט דק ושקוף של אוזנייה נראה מאחורי אוזנו הימנית. הוא אוחז במיקרופון כסוף דק עם לוגו 'ON AIR' אדום וזוהר. יש לו הבעה מלאת אנרגיה, כמעט מאנית, בעיניו הרחבות."
    }
  },
  {
    "name": { "en": "TV Host (Maya)", "he": "מנחת טלוויזיה (מאיה)" },
    "description": {
        "en": "A radiant young woman in her early 20s with waist-length, glossy chestnut hair styled in perfect Hollywood waves. She wears a vibrant magenta bodycon dress with asymmetrical shoulder cutouts. Her makeup is flawless, featuring bold winged eyeliner and shimmering gold eyeshadow. On her LEFT wrist, she wears a stack of thin gold bangles that jingle slightly. She holds a sleek, ultra-thin tablet in her RIGHT hand, showing a digital script. She stands in a professional pose with sky-high silver stiletto heels.",
        "he": "אישה צעירה וקורנת בשנות ה-20 המוקדמות לחייה, בעלת שיער ערמוני מבריק באורך המותניים המעוצב בגלי 'הוליווד' מושלמים. היא לובשת שמלת 'בודיקון' בצבע מגנטה עז עם חיתוכים אסימטריים בכתפיים. האיפור שלה ללא רבב, וכולל אייליינר חתולי בולט וצללית זהב מנצנצת. על פרק יד שמאל שלה היא עונדת ערימה של צמידי זהב דקים המקרקשים מעט. בידה הימנית היא אוחזת בטאבלט דקיק ומתוחכם המציג תסריט דיגיטלי. היא עומדת בפוזה מקצועית על נעלי סטילטו כסופות וגבוהות במיוחד."
    }
  },
  {
    "name": { "en": "Chill Croc (Snap)", "he": "תנין סטלן (סנאפ)" },
    "description": {
        "en": "A laid-back, anthropomorphic crocodile with thick, emerald-green scales and heavy, half-lidded yellow eyes. He wears an unbuttoned, oversized Hawaiian shirt with a pattern of pineapples and flamingos. A pair of classic aviator sunglasses with reflective orange lenses rests on his long snout. Around his thick neck, he wears a puka shell necklace. He is barefoot, with his large, clawed feet resting casually, and his long tail curls lazily behind him. He has a small, toothy grin and exudes an aura of total calm.",
        "he": "תנין אנתרופומורפי (בעל מאפיינים אנושיים) רגוע, עם קשקשים עבים בצבע ירוק אזמרגד ועיניים צהובות כבדות וחצי סגורות. הוא לובש חולצת הוואי רחבה ופתוחה עם הדפס של אננסים ופלמינגו. זוג משקפי טייסים קלאסיים עם עדשות כתומות משקפות מונח על חרטומו הארוך. סביב צווארו העבה הוא עונד שרשרת צדפים. הוא יחף, רגליו הגדולות בעלות הטפרים מונחות בנונשלנטיות, וזנבו הארוך מתפתל בעצלתיים מאחוריו. יש לו חיוך קטן חושף שיניים והוא מקרין הילה של שלווה מוחלטת."
    }
  },
  {
    "name": { "en": "Bubba the Skunk", "he": "בואש שמנמן (באבה)" },
    "description": {
        "en": "A round, pleasantly plump skunk with fluffy black fur and a stark white stripe that splits into a wide 'V' on his bushy tail. He has large, watery brown eyes and a small, twitching pink nose. He wears a tiny, crooked red polka-dot bowtie that is slightly too tight for his chubby neck. In his tiny paws, he clumsily grips a half-eaten, dripping grilled cheese sandwich. His belly protrudes slightly from under a small denim vest. He has a goofy grin and crumbs scattered across his chest fur.",
        "he": "בואש עגלגל ושמנמן בנעימות, בעל פרווה שחורה ופרועה ופס לבן בוהק המתפצל ל-'V' רחב על זנבו המברשתני. יש לו עיניים חומות גדולות ומבריקות ואף ורוד קטן שמרטט ללא הרף. הוא עונד עניבת פרפר אדומה קטנה ועקומה עם נקודות לבנות, שהיא מעט צמודה מדי לצווארו השמנמן. בכפותיו הקטנות הוא אוחז בסרבול בכריך גבינה מותכת חצי אכול ומטפטף. בטנו בולטת מעט מתחת לווסט ג'ינס קטן. יש לו חיוך טיפשי ופירורי לחם מפוזרים על פרוות החזה שלו."
     }
  },
  {
    "name": { en: "Business Woman (Sarah)", he: "אשת עסקים (שרה)" },
    description: {
        en: "A sophisticated woman in her mid-30s with an upright, professional posture and pale skin. Her platinum blonde hair is pulled back into a perfectly smooth, tight low bun. She wears thick-framed rectangular black glasses over sharp icy blue eyes. Her outfit consists of a tailored charcoal black blazer with silk lapels over a crisp white button-down blouse. She wears small pearl stud earrings. In her RIGHT hand, she grips a structured dark brown leather briefcase with brass buckles.",
        he: "אישה מתוחכמת באמצע שנות ה-30 לחייה, בעלת יציבה זקופה ומקצועית ועור בהיר. שיער הבלונד פלטינה שלה אסוף ללחמנייה נמוכה, הדוקה וחלקה לחלוטין. היא מרכיבה משקפיים שחורים מלבניים עם מסגרת עבה מעל עיניים כחולות חדות. התלבושת שלה מורכבת מבלייזר שחור פחם מחויט עם דשי משי מעל חולצת כפתורים לבנה מעומלנת. היא עונדת עגילי פנינה צמודים וקטנים. בידה הימנית היא אוחזת בתיק מנהלים קשיח מעור חום כהה עם אבזמי פליז."
    }
  },
  {
"name": { "en": "The Clockwork Collector (Oswald)", "he": "אספן השעונים (אוזוולד)" },
    "description": {
        "en": "An elderly, hunched man with translucent, paper-thin skin through which blue veins are visible. His face is dominated by a heavy, brass mechanical monocle permanently fused to his LEFT eye, featuring three rotating glass lenses of different sizes. He wears a tattered, oil-stained Victorian frock coat adorned with dozens of ticking pocket watches hanging from thin gold chains. On his RIGHT shoulder sits a rusted mechanical bird with glowing red bulb eyes. His fingers are unnaturally long, ending in jagged, blackened nails. He exudes a constant smell of old grease and ozone.",
        "he": "איש קשיש וכפוף בעל עור שקוף ודק כנייר שדרכו נראים ורידים כחולים. את פניו מעטר מונוקל מכני כבד מנחושת המחובר לצמיתות לעינו השמאלית, וכולל שלוש עדשות זכוכית מסתובבות בגדלים שונים. הוא לובש מעיל 'פרוק' ויקטוריאני בלוי ומוכתם בשמן, המקושט בעשרות שעוני כיס מתקתקים התלויים משרשראות זהב דקות. על כתף ימין שלו ניצבת ציפור מכנית חלודה עם עיני נורה אדומות וזוהרות. אצבעותיו ארוכות בצורה לא טבעית ומסתיימות בציפורניים משוננות ומושחרות. הוא מדיף ריח תמידי של גריז ישן ואוזון."
    }
  },
  {
    "name": { "en": "The Memory Merchant (Silt)", "he": "סוחר הזיכרונות (סילט)" },
    "description": {
        "en": "A bizarre, bloated figure with wet, greenish-grey skin that glistens with a thin layer of slime. His head is disproportionately large and hairless, with three bulbous yellow eyes arranged in a vertical row down the center of his forehead. He wears a heavy leather apron filled with hundreds of small glass jars, each containing a swirling, luminous vapor. In his LEFT hand, he grips a staff made of bleached bone, topped with a twitching, preserved heart in a cage. He wears a tattered burlap sack that barely covers his hunched, moss-covered back. A faint trail of iridescent fluid follows his slow, dragging footsteps.",
        "he": "דמות מוזרה ותפוחה בעלת עור אפרפר-ירקרק ורטוב המנצנץ משכבה דקה של ריר. ראשו גדול ללא פרופורציה וחסר שיער, עם שלוש עיניים צהובות ובולטות המסודרות בשורה אנכית במרכז מצחו. הוא לובש סינר עור כבד מלא במאות צנצנות זכוכית קטנות, שכל אחת מהן מכילה אדים זוהרים ומסתחררים. בידו השמאלית הוא אוחז במטה העשוי מעצם מולבנת, שבקצהו לב משומר ומפרפר בתוך כלוב. הוא לובש שק יוטה קרוע שבקושי מכסה את גבו הכפוף והמכוסה בטחב. שובל דק של נוזל ססגוני עוקב אחר פסיעותיו האיטיות והנגררות."
    }
  },
  {
name: { en: "The Doctor", he: "הרופא" },
    description: {
        en: "A professional male doctor in his late 40s with a kind face and short salt-and-pepper hair, notably grey at the temples. He wears a crisp white knee-length lab coat over medical blue scrubs. A classic stethoscope with black tubing hangs around his neck. A rectangular silver name tag is pinned to his LEFT chest pocket. He has thin silver-rimmed glasses and a warm smile.",
        he: "רופא מקצועי בשנות ה-40 המאוחרות לחייו, בעל פנים אדיבות ושיער קצר בצבע 'מלח-פלפל', מאפיר בולט ברקות. הוא לובש חלוק מעבדה לבן ומעומלן באורך הברך מעל מדים רפואיים כחולים. סטטוסקופ קלאסי עם צינור שחור תלוי על צווארו. תג שם כסוף ומלבני נעוץ על כיס החזה השמאלי שלו. הוא מרכיב משקפיים דקיקים עם מסגרת כסף ובעל חיוך חם."
    }
  },
  {
    name: { en: "Viral Streamer 'Pinky'", he: "סטרימרית ויראלית 'פינקי'" },
    description: {
        en: "A vibrant teenage girl with long neon pink hair tied into high twin-tails. She wears professional gaming cat-ear headphones with glowing LED lights, and the microphone boom is positioned on the LEFT side of her face. A small, perfect red heart symbol is painted on her RIGHT cheek. She is swallowed by an oversized pastel purple hoodie with extra-long sleeves. She has large, expressive dark eyes with winged eyeliner.",
        he: "נערה תוססת עם שיער ורוד ניאון ארוך האסוף לשתי קוקיות גבוהות. היא חובשת אוזניות גיימינג עם אוזני חתול ואורות לד זוהרים, כשהמיקרופון ממוקם בצד שמאל של פניה. סמל לב אדום קטן ומושלם מצויר על לחי ימין שלה. היא לובשת קפוצ'ון סגול פסטל ענק (אוברסייז) עם שרוולים ארוכים מאוד. יש לה עיניים כהות גדולות ומביעות עם אייליינר חתולי."
    }
  },
  {
    name: { en: "Hypebeast Kai", he: "קאי (אופנת רחוב)" },
    description: {
        en: "A trendy young man with a sharp undercut hairstyle. He wears a heavy, oversized hoodie in electric neon orange and a sleek black fabric face mask covering his nose and mouth. A thick, chunky silver link chain hangs around his neck, drooping lower on the LEFT side. On the back of his RIGHT hand, a clear black ink tattoo reads 'Hope' in gothic font. He wears black techwear joggers.",
        he: "בחור צעיר וטרנדי עם תספורת אנדרקאט חדה. הוא לובש קפוצ'ון כבד וענק בצבע כתום ניאון חשמלי ומסיכת פנים מבד שחור המכסה את האף והפה. שרשרת חוליות כסופה עבה וכבדה תלויה על צווארו, ונשמטת נמוך יותר בצד שמאל. על גב כף יד ימין שלו, קעקוע בדיו שחור וברור של המילה 'Hope' בגופן גותי. הוא לובש מכנסי דגמ\"ח טכנולוגיים שחורים."
    }
  },
  {
    name: { en: "K-Pop Star Jin", he: "כוכב קיי-פופ ג'ין" },
    description: {
        en: "A slender young male idol with silky silver hair featuring electric blue tips. He wears a dazzling white stage suit adorned with shimmering silver sequins that catch the light. A single, long dangling silver cross earring hangs from his LEFT ear. In his RIGHT hand, he holds a custom microphone covered in sparkling silver glitter. His skin is flawless and pale, with a hint of pink lip tint.",
        he: "איידול צעיר ודק גזרה עם שיער כסוף כמשי וקצוות בצבע כחול חשמלי. הוא לובש חליפת במה לבנה ומסנוורת מעוטרת בפאייטים כסופים מנצנצים שתופסים את האור. עגיל צלב כסוף ארוך ומתנדנד תלוי מאוזן שמאל שלו בלבד. בידו הימנית הוא מחזיק מיקרופון בעיצוב אישי המכוסה נצנצים כסופים. עורו ללא פגמים ובהיר, עם רמז של טינט ורדרד בשפתיים."
    }
  },
  {
    name: { en: "Cosplay Queen Yuki", he: "מלכת הקוספליי יוקי" },
    description: {
        en: "A young woman in a highly detailed white futuristic cyber-armor with glowing blue accents. A traditional red Japanese Oni mask with gold horns is strapped to the RIGHT side of her head. She firmly grips a glowing translucent blue katana sword in her LEFT hand. Her hair is jet black, styled in a sharp hime-cut. Her eyes glow with a subtle blue cybernetic light.",
        he: "אישה צעירה בשריון סייבר עתידני לבן ומפורט מאוד עם הדגשות כחולות זוהרות. מסיכת שד יפני (אוני) אדומה מסורתית עם קרניים מוזהבות קשורה לצד ראשו מצד ימין. היא אוחזת בחוזקה בחרב קטאנה כחולה שקופה וזוהרת בידה השמאלית. שיערה שחור פחם, מעוצב בתספורת 'הימה' חדה. עיניה זוהרות באור קיברנטי כחול עדין."
    }
  },
  {
    name: { en: "Old Money Aesthetic Tom", he: "אסתטיקת 'Old Money' (טום)" },
    description: {
        en: "A refined man with a clean-shaven face and neatly combed brown hair. He wears a premium white piqué cotton polo shirt. A cream-colored cashmere sweater is elegantly tied around his shoulders, with the sleeves knotted specifically on the LEFT side of his chest. In his RIGHT hand, he holds a vintage wooden tennis racket with a tan leather grip. A classic gold watch with a brown leather strap is on his LEFT wrist.",
        he: "גבר מעודן עם פנים מגולחות למשעי ושיער חום מסורק בקפידה. הוא לובש חולצת פולו לבנה מכותנת פיקה איכותית. סוודר קשמיר בצבע שמנת קשור באלגנטיות סביב כתפיו, כשהשרוולים קשורים ספציפית בצד שמאל של החזה. בידו הימנית הוא מחזיק מחבט טניס וינטג' מעץ עם אחיזת עור חומה. שעון זהב קלאסי עם רצועת עור חומה ענוד על פרק יד שמאל שלו."
    }
  },
  {
    name: { en: "Fitness Coach Maya", he: "מאיה המאמנת (כושר)" },
    description: {
        en: "An athletic woman with a deeply tanned, toned physique. Her dark hair is pulled into a high, tight ponytail. She wears a vibrant neon pink sports bra and matching high-waisted leggings. A thick black smartwatch is strapped to her LEFT wrist. A small, sharp black lightning bolt tattoo is visible on the front of her RIGHT shoulder. She has a confident, energetic expression.",
        he: "אישה אתלטית עם גוף חטוב ושזוף מאוד. שיערה הכהה אסוף לקוקו גבוה והדוק. היא לובשת טופ ספורט בצבע ורוד ניאון עז וטייץ תואם בגזרה גבוהה. שעון חכם שחור עבה ענוד על פרק יד שמאל שלה. קעקוע ברק שחור קטן וחד נראה על חלקה הקדמי של כתף ימין שלה. יש לה הבעה בטוחה ואנרגטית."
    }
  },
  {
    name: { en: "Gen Z Influencer Zoe", he: "זואי כוכבת הרשת" },
    description: {
        en: "A trendy 19-year-old girl with shoulder-length hair featuring bleached blonde roots and deep purple dyed tips. She wears a cropped grey hoodie with a large white star print on the center and baggy, light-wash blue jeans. She is constantly holding a modern smartphone in her RIGHT hand. A small silver hoop ring is pierced through her LEFT nostril. She has a relaxed, 'cool' posture.",
        he: "נערה טרנדית בת 19 עם שיער עד הכתפיים, שורשים בלונדיניים וקצוות צבועים בסגול עמוק. היא לובשת קפוצ'ון בטן אפור עם הדפס כוכב לבן גדול במרכז וג'ינס כחול רחב (באגי) בכיבוס בהיר. היא מחזיקה באופן קבוע סמארטפון מודרני ביד ימין. נזם חישוק כסוף קטן בנחיר שמאל שלה. יש לה יציבה רגועה ו'קולית'."
    }
  },
  {
    name: { en: "Top Lawyer Harvey", he: "עורך הדין הארווי" },
    description: {
        en: "A commanding man in his late 30s with a perfectly groomed appearance. He wears a bespoke navy blue three-piece suit and a deep red silk tie. His dark hair is styled with a clean, sharp part on the LEFT side. Polished gold cufflinks are visible at his wrists. In his LEFT hand, he carries a premium dark brown leather document folder with a gold latch. His expression is calm and analytical.",
        he: "גבר סמכותי בשנות ה-30 המאוחרות לחייו עם מראה מטופח להפליא. הוא לובש חליפת שלושה חלקים כחולה (נייבי) שנתפרה לפי מידה ועניבת משי אדומה עמוקה. שיערו הכהה מעוצב עם שביל נקי וחד בצד שמאל. חפתים מוזהבים מלוטשים נראים בפרקי ידיו. בידו השמאלית הוא נושא תיקיית מסמכים מעור חום כהה יוקרתית עם אבזם זהב. הבעתו רגועה ואנליטית."
    }
  },
  {
    name: { en: "Luxury Lifestyle Sophie", he: "סופי (לייף סטייל עשיר)" },
    description: {
        en: "An elegant woman wearing a light, flowing white linen summer dress and a wide-brimmed straw hat with a black ribbon. Large, dark designer sunglasses are perched on top of her head. A stack of thin gold bangles clinks on her RIGHT wrist. In her LEFT hand, she gracefully holds a tall crystal glass of bubbling champagne. She is often depicted in sun-drenched, high-end environments.",
        he: "אישה אלגנטית לובשת שמלת קיץ לבנה מפשתן קליל וזורם וכובע קש רחב שוליים עם סרט שחור. משקפי שמש גדולים וכהים של מעצבים מונחים על ראשה. ערמת צמידי זהב דקים מצלצלת על פרק יד ימין שלה. בידה השמאלית היא אוחזת בחן בכוס קריסטל גבוהה של שמפניה מבעבעת. היא מתוארת לרוב בסביבות יוקרתיות שטופות שמש."
    }
  },
  {
    name: { en: "Swimsuit Model Alex", he: "אלכס דוגמנית חוף" },
    description: {
        en: "A fit, glowing woman with a sun-kissed complexion and a 'wet-look' hairstyle. She wears a vibrant teal bikini with a lush tropical leaf print. A bright pink hibiscus flower is tucked behind her RIGHT ear. A delicate silver anklet with a small seashell charm is on her LEFT ankle. Her skin has a subtle sheen as if just coming out of the ocean.",
        he: "אישה חטובה וזוהרת עם עור שזוף ומראה שיער רטוב. היא לובשת ביקיני טורקיז עז עם הדפס עליים טרופיים עשיר. פרח היביסקוס ורוד בוהק תחוב מאחורי אוזן ימין שלה. צמיד רגל כסוף עדין עם תליון צדף קטן ענוד על קרסול שמאל שלה. לעורה ברק עדין כאילו יצאה זה עתה מהאוקיינוס."
    }
  },
  {
    name: { en: "Chubby Ginger Cat", he: "חתול ג'ינג'י שמנמן" },
    description: {
        en: "A large, fluffy orange tabby cat with distinct darker ginger stripes and a round face. He wears a bright blue collar with a small, shiny gold bell that sits on the LEFT side of his neck. All four of his paws are pure white, like socks. There is a tiny, distinctive V-shaped notch on the tip of his RIGHT ear. He has bright green eyes and long white whiskers.",
        he: "חתול ג'ינג'י גדול ופרוותי עם פסים כהים בולטים ופנים עגולות. הוא עונד קולר כחול בהיר עם פעמון זהב קטן ומבריק שיושב בצד שמאל של צווארו. כל ארבע כפות רגליו לבנות לחלוטין, כמו גרביים. ישנו חתך קטן ומיוחד בצורת V בקצה אוזן ימין שלו. יש לו עיניים ירוקות בהירות ושפם לבן ארוך."
    }
  },
  {
    name: { en: "Baby Giraffe", he: "ג'ירפה צעירה" },
    description: {
        en: "A charming baby giraffe with exceptionally long, dark eyelashes and large, soft ears. She wears a bright red bandana tied neatly around her neck, with the knot positioned on the LEFT side. On her RIGHT shoulder, one of her brown spots is uniquely shaped like a perfect heart. Her coat is a creamy beige with well-defined cocoa-brown patches.",
        he: "ג'ירפה צעירה ומקסימה עם ריסים כהים ארוכים במיוחד ואוזניים גדולות ורכות. היא עונדת בנדנה אדומה בוהקת הקשורה סביב צווארה, כשהקשר ממוקם בצד שמאל. על כתף ימין שלה, אחד הכתמים החומים מעוצב באופן ייחודי ככתם בצורת לב מושלם. הפרווה שלה בצבע בז' שמנת עם כתמים מוגדרים היטב בצבע חום קקאו."
    }
  },
  {
    name: { en: "Adventurous Pug", he: "פאג הרפתקן" },
    description: {
        en: "A sturdy beige pug with a deep black face mask and large, watery brown eyes. He wears a professional forest green hiking harness with a prominent silver metal buckle on the RIGHT side. His pink tongue is constantly peeking out, slightly tilted to the LEFT side of his mouth. He has a curly 'cinnamon roll' tail and a brave, curious expression.",
        he: "כלב פאג בז' חסון עם מסיכה שחורה עמוקה על הפנים ועיניים חומות גדולות ומבריקות. הוא לובש רתמת טיולים מקצועית בצבע ירוק יער עם אבזם מתכת כסוף בולט בצד ימין. הלשון הוורודה שלו מציצה החוצה באופן קבוע, נוטה מעט לצד שמאל של פיו. יש לו זנב מסולסל כמו 'סינבון' והבעה אמיצה וסקרנית."
    }
  },
  {
    name: { en: "Fluffy Bunny", he: "ארנבון פלאפי" },
    description: {
        en: "A tiny, snowball-white rabbit with incredibly soft, dense fur. His LEFT ear is floppy and rests against his cheek, while his RIGHT ear stands perfectly upright. He is often seen clutching a small, bright orange carrot with green leafy tops. He has a tiny pink twitching nose and dark, bead-like eyes. He sits in a rounded, 'loaf' position.",
        he: "ארנבון קטנטן לבן כשלג עם פרווה צפופה ורכה להפליא. אוזן שמאל שלו שמוטה ונחה על הלחי, בעוד אוזן ימין שלו עומדת זקופה לחלוטין. הוא נראה לעיתים קרובות כשהוא אוחז בגזר כתום קטן עם עלים ירוקים. יש לו אף ורדרד קטן שמרטט ועיניים כהות דמויות חרוזים. הוא יושב בתנוחה עגולה וקומפקטית."
    }
  },
  {
    name: { en: "Hipster Penguin", he: "פינגווין היפסטר" },
    description: {
        en: "A fluffy grey Emperor penguin chick with soft, downy feathers. He wears thick-rimmed black circular glasses that look slightly too large for his face. A long, hand-knitted bright yellow scarf is wrapped twice around his neck, with the fringed ends hanging down his RIGHT side. He has a small black beak and a serious, scholarly expression.",
        he: "גוזל פינגווין קיסרי אפור ופרוותי עם נוצות פלומה רכות. הוא מרכיב משקפיים עגולים שחורים עם מסגרת עבה שנראים מעט גדולים מדי על פניו. צעיף צהוב בוהק בסריגת יד מלופף פעמיים סביב צווארו, כשהקצוות עם הפרנזים תלויים בצד ימין שלו. יש לו מקור שחור קטן והבעה רצינית ולמדנית."
    }
  },
  { 
    name: { en: "Cyberpunk Rebel", he: "מורדת סייברפאנק" },
    description: { 
        en: "A defiant young woman with a sharp neon pink bob haircut. Her LEFT eye is a glowing blue cybernetic implant with a digital iris. She wears a black cropped techwear jacket made of matte leather, featuring a glowing blue LED strip on the high collar. She has multiple silver rings in her ears and wears black tactical cargo pants with glowing blue buckles.",
        he: "אישה צעירה ומרדנית עם תספורת קארה ורוד ניאון חדה. עין שמאל שלה היא שתל קיברנטי כחול זוהר עם אישון דיגיטלי. היא לובשת ז'קט טכנולוגי קצר מעור מט שחור, הכולל פס לד כחול זוהר על הצווארון הגבוה. יש לה מספר עגילי כסף באוזניים והיא לובשת מכנסי דגמ\"ח טקטיים שחורים עם אבזמים כחולים זוהרים."
    }
  },
  { 
    name: { en: "Space Marine", he: "לוחם חלל" },
    description: { 
        en: "A battle-hardened soldier in massive, weathered forest-green power armor. The LEFT shoulder pad features deep metallic scratches and a white skull insignia. His helmet has a gold-tinted reflective visor that hides his face. On his RIGHT forearm, a small holographic display glows with tactical data. He carries a bulky futuristic rifle slung across his back.",
        he: "חייל מנוסה בקרבות בשריון כוח מסיבי בצבע ירוק יער עם סימני שחיקה. על כתפיית שמאל ישנן שריטות מתכתיות עמוקות וסמל גולגולת לבן. לקסדה שלו יש משקף מוזהב מחזיר אור המסתיר את פניו. על אמה ימין שלו, תצוגה הולוגרפית קטנה זוהרת עם נתונים טקטיים. הוא נושא רובה עתידני כבד תלוי על גבו."
    }
  },
  {
    name: { en: "Android Unit 7", he: "אנדרואיד יחידה 7" },
    description: {
        en: "A sophisticated humanoid robot with a seamless white ceramic-like shell. Dark grey mechanical joints are visible at the elbows and knees. A soft blue circular light glows in the center of its forehead. The serial number 'UNIT-07' is printed vertically in small black sans-serif font on its upper RIGHT arm. Its fingers are slender and end in silver metallic tips.",
        he: "רובוט דמוי אדם מתוחכם עם מעטפת לבנה חלקה דמוית קרמיקה. מפרקים מכניים בצבע אפור כהה נראים במרפקים ובברכיים. אור כחול עגול ועדין זוהר במרכז המצח שלו. המספר הסידורי 'UNIT-07' מודפס אנכית בגופן שחור קטן ללא סריף על זרוע ימין העליונה. אצבעותיו דקות ומסתיימות בקצות מתכת כסופים."
    }
  },
  { 
    name: { en: "Old Wizard", he: "מכשף זקן" },
    description: { 
        en: "A venerable elderly wizard with a majestic, waist-length white beard and bushy eyebrows. He wears a deep midnight blue velvet robe adorned with intricate silver star and moon embroidery specifically on the RIGHT shoulder and sleeve. He wears a weathered, pointed wizard hat in the same blue. A gnarled wooden staff with a glowing crystal top is held in his RIGHT hand.",
        he: "מכשף זקן ונכבד עם זקן לבן מלכותי המגיע עד המותניים וגבות עבות. הוא לובש גלימת קטיפה בצבע כחול לילה עמוק המעוטרת ברקמה מורכבת של כוכבים וירח כסופים ספציפית על כתף ושרוול ימין. הוא חובש כובע מכשף מחודד וישן באותו צבע כחול. מטה עץ מעוקל עם קריסטל זוהר בקצהו מוחזק בידו הימנית."
    }
  },
  {
    name: { en: "Elven Archer", he: "קשתית אלפית" },
    description: {
        en: "A graceful female elf with long, elegantly pointed ears and waist-length golden hair styled in intricate braids. She wears a form-fitting emerald green leather tunic and a dark brown hooded cloak. A quiver filled with white-feathered arrows is strapped over her RIGHT shoulder. A delicate silver circlet with a green gemstone sits perfectly on her forehead.",
        he: "אלפית חיננית עם אוזניים מחודדות ארוכות ואלגנטיות ושיער זהוב באורך המותניים המעוצב בצמות מורכבות. היא לובשת טוניקת עור בצבע ירוק אמרלד צמודה וגלימה חומה עם ברדס. אשפת חצים מלאה בחצים עם נוצות לבנות קשורה מעל כתף ימין שלה. נזר כסף עדין עם אבן חן ירוקה מונח בצורה מושלמת על מצחה."
    }
  },
  {
    name: { en: "Dwarf Warrior", he: "לוחם גמדי" },
    description: {
        en: "A short, broad-shouldered dwarf with a fiery red beard braided into three thick strands, each tipped with a heavy iron ring. He wears a heavy grey chainmail shirt and a dented iron helmet with curved horns. He wields a massive, double-headed iron warhammer with BOTH hands. A deep, jagged scar runs horizontally across the bridge of his nose.",
        he: "גמד נמוך ורחב כתפיים עם זקן ג'ינג'י לוהט הקלוע לשלוש צמות עבות, שבקצה כל אחת מהן טבעת ברזל כבדה. הוא לובש חולצת שריון שרשראות אפורה וכבדה וקסדת ברזל חבולה עם קרניים מעוקלות. הוא אוחז בפטיש מלחמה ענק מברזל בעל שני ראשים בשתי ידיו. צלקת עמוקה ומשוננת עוברת אופקית על גשר אפו."
    }
  },
  { 
    name: { en: "Noir Detective", he: "בלש פרטי (נואר)" },
    description: { 
        en: "A weary detective in his 40s with a tired gaze and 5-o'clock shadow. A thin vertical scar runs through his RIGHT cheek. He wears a classic beige trench coat over a wrinkled white shirt and a loosened black tie. A dark brown fedora hat is tilted low over his eyes. He is often seen with a glowing cigarette between his fingers, surrounded by wisps of smoke.",
        he: "בלש עייף בשנות ה-40 לחייו עם מבט תשוש וזיפי ערב. צלקת אנכית דקה עוברת בלחי ימין שלו. הוא לובש מעיל בלשים (טרנץ') בז' קלאסי מעל חולצה לבנה מקומטת ועניבה שחורה משוחררת. כובע פדורה חום כהה מוטה נמוך מעל עיניו. הוא נראה לעיתים קרובות עם סיגריה דולקת בין אצבעותיו, מוקף בתימרות עשן."
    }
  },
  {
    name: { en: "The Survivor", he: "השורד (פוסט-אפוקליפטי)" },
    description: {
        en: "A rugged, dirt-streaked man with unkempt hair and intense eyes. He wears a torn red-and-black flannel shirt with the sleeves rolled up. A weathered brown leather holster is strapped to his RIGHT thigh. A grubby, blood-stained white bandage is tightly wrapped around his LEFT forearm. He wears heavy, mud-caked hiking boots and carries a worn backpack.",
        he: "גבר מחוספס ומכוסה בפיח עם שיער פרוע ועיניים חודרות. הוא לובש חולצת פלנל קרועה בצבע אדום-שחור עם שרוולים מגולגלים. נרתיק אקדח מעור חום בלוי קשור לירך ימין שלו. תחבושת לבנה מלוכלכת עם כתמי דם מלופפת סביב אמה שמאלית שלו. הוא נועל נעלי הרים כבדות מכוסות בוץ ונושא תרמיל גב שחוק."
    }
  },
  {
    name: { en: "Tech Mogul Elena", he: "אלנה - אילת הייטק" },
    description: {
        en: "A powerful woman in her 30s with a sharp, minimalist aesthetic. She wears an avant-garde white asymmetric blazer where the RIGHT side is significantly longer than the left. Beneath it, a high-quality black silk camisole. She wears a bold gold geometric hexagon necklace. Her dark hair is slicked back perfectly. Her piercing blue eyes convey cold intelligence. She wears slim black trousers.",
        he: "אישה חזקה בשנות ה-30 לחייה עם אסתטיקה מינימליסטית וחדה. היא לובשת בלייזר לבן אוונגרדי וא-סימטרי שבו צד ימין ארוך משמעותית מהשמאלי. מתחתיו, גופיית משי שחורה איכותית. היא עונדת שרשרת זהב גיאומטרית בולטת בצורת משושה. שיערה הכהה משוך לאחור בצורה מושלמת. עיניה הכחולות החודרות משדרות אינטליגנציה קרה. היא לובשת מכנסיים שחורים צרים."
    }
  },
  {
    name: { en: "Fashion Icon Bella", he: "בלה - אייקון אופנה" },
    description: {
        en: "A stunning fashion icon with platinum blonde hair styled in voluminous Hollywood waves. She wears a dramatic crimson red silk haute couture gown with a plunging neckline and a high slit on the LEFT leg. Around her neck is a sparkling diamond choker. Her makeup features a sharp winged eyeliner and bold, glossy red lipstick. She stands in a regal, high-fashion pose.",
        he: "אייקון אופנה מהממת עם שיער בלונד פלטינה מעוצב בגלי הוליווד נפוחים. היא לובשת שמלת הוט קוטור דרמטית ממשי בצבע אדום ארגמן עם מחשוף עמוק ושסע גבוה ברגל שמאל. לצווארה קולר יהלומים מנצנץ. האיפור שלה כולל אייליינר חתולי חד ושפתון אדום בוהק ובולט. היא עומדת בפוזה מלכותית של אופנה עילית."
  }
  },

  // ─── Minecraft & Roblox Heroes ──────────────────────────────────────────────
  {
    name: { en: "Captain Glitch", he: "קפטן גליץ'" },
    description: {
      en: "Captain Glitch, a young teenage white boy with spiky brown hair and a confident, mischievous grin. He is wearing a futuristic black cyberpunk jacket with glowing cyan and purple neon trim stripes, and a glowing blue pixelated 'G' logo on the chest. He has large gaming headphones on his head with glowing LED rings. He is holding a futuristic controller. The character is surrounded by floating blue and purple glitch pixel particles.",
      he: "קפטן גליץ', נער לבן צעיר עם שיער חום מזוקר וחיוך בוטח ומשובב. הוא לובש ז'קט סייברפאנק שחור עתידני עם פסי ניאון זוהרים בצבע ציאן וסגול, ולוגו 'G' פיקסלי כחול זוהר על החזה. על ראשו אוזניות גיימינג ענקיות עם טבעות לד זוהרות. הוא מחזיק בשלט גיימינג עתידני. הדמות מוקפת בחלקיקי פיקסל כחולים וסגולים מטושטשים המרחפים סביבה."
    }
  },
  {
    name: { en: "Steve (Minecraft)", he: "סטיב (מיינקראפט)" },
    description: {
      en: "High-quality 3D render of Steve from Minecraft, wearing iconic teal t-shirt and blue jeans, holding a glowing diamond pickaxe over his shoulder, standing in a lush blocky forest landscape, cinematic lighting, detailed block textures, heroic pose, Unreal Engine 5 style, 8k resolution. Square pixelated face with short brown hair, tanned skin, and a short stubble beard.",
      he: "סטיב מהמשחק מיינקראפט, דמות המשחק הנצחית. פנים מרובעות ופיקסליות עם שיער חום קצר, עור שזוף וזקן קצר. לובש חולצת טורקיז אייקונית ומכנסי ג'ינס כחולים. אוחז במכוש יהלום זוהר מעל כתפו. עומד בנוף יערני מקוצבי, תאורה קולנועית, טקסטורות מפורטות."
    }
  },
  {
    name: { en: "Classic Noob (Roblox)", he: "נוב קלאסי (רובלוקס)" },
    description: {
      en: "The Classic Roblox Noob character: bright yellow skin on the head and arms, iconic blue torso, green legs, simple happy smiling face with small black dot eyes, standing in a vibrant plastic-toy world. Soft sunlight, high fidelity 3D render, cute and heroic atmosphere, Pixar animation style. Slightly blocky humanoid shape.",
      he: "הנוב הקלאסי של רובלוקס, הדמות האהובה והתמימה. עור צהוב בהיר על הראש והזרועות, גוף כחול אייקוני, רגליים ירוקות. פנים פשוטות עם חיוך שמח ועיניים נקודתיות קטנות. עומד בעולם צעצועי פלסטי צבעוני. תאורת שמש רכה, עיצוב תלת-ממדי איכותי."
    }
  },
  {
    name: { en: "Alex (Minecraft)", he: "אלקס (מיינקראפט)" },
    description: {
      en: "Minecraft Alex character, long flowing orange hair, green tunic shirt, brown pants, holding a bow and arrow drawn back ready to fire, dynamic action pose, sunset background over a blocky mountain range. Slim pixelated face, light skin tone, determined expression. Detailed fabric textures, volumetric lighting, 3D rendered art.",
      he: "אלקס ממיינקראפט, הגיבורה הג'ינג'ית האמיצה. שיער כתום ארוך וזורם, חולצת טוניקה ירוקה, מכנסיים חומים. אוחזת בקשת מתוחה מוכנה לירי בתנוחת פעולה דינמית. רקע שקיעה מעל הרי קוביות מפורטים. פנים פיקסליות עם עור בהיר והבעה נחושה."
    }
  },
  {
    name: { en: "Bacon Hair (Roblox)", he: "בייקון הייר (רובלוקס)" },
    description: {
      en: "Roblox Bacon Hair avatar, distinctive strip-pattern hair style resembling bacon strips, wearing a denim jacket and dark jeans, looking up at a giant futuristic city with determination, dramatic low angle shot. Realistic textures mixed with blocky aesthetic, 4k, cinematic composition. Classic Roblox blocky body proportions.",
      he: "דמות בייקון הייר מרובלוקס, האנדרדוג האולטימטיבי. תסרוקת פסים ייחודית הנראית כמו רצועות בייקון, לובש ז'קט ג'ינס ומכנסיים כהים. מביט בנחישות כלפי עיר עתידנית ענקית. זווית דרמטית. טקסטורות ריאליסטיות המשולבות עם אסתטיקת הקוביות של רובלוקס."
    }
  },
  {
    name: { en: "Iron Golem (Minecraft)", he: "גולם ברזל (מיינקראפט)" },
    description: {
      en: "Massive Iron Golem from Minecraft, rusty iron metal texture with green vines growing across its body, gently holding a red poppy flower in its enormous left hand, standing in a peaceful NPC village. Soft morning mist, cracked iron surface, moss and vine details, emotional and majestic atmosphere, hyper-realistic 3D render. Huge blocky humanoid shape.",
      he: "גולם הברזל ממיינקראפט, השומר השקט של הכפריים. יצור אנושי מקוצבי ענק עם טקסטורת ברזל חלוד וגפנים ירוקים הגדלים על גופו. מחזיק בעדינות פרג אדום בידו הענקית. עומד בכפר שליו בבוקר מאופף ערפל. אוירה רגשית ומלכותית."
    }
  },
  {
    name: { en: "Builderman (Roblox)", he: "בילדרמן (רובלוקס)" },
    description: {
      en: "Roblox Builderman character, wearing a orange construction hard hat and holding a large blueprint scroll in one hand and a hammer in the other, standing amidst a construction site of floating islands in the sky. Creative energetic atmosphere, sparks flying, high-tech meets blocky Roblox style, dynamic octane render. Classic Roblox blocky body proportions.",
      he: "בילדרמן מרובלוקס, מייצג היצירה והבנייה. דמות עם קסדת בנייה כתומה, מחזיק תרשים בלנת ידו אחת ופטיש ביד השנייה. עומד באתר בנייה של איים מרחפים בשמיים. אוירה יצירתית ואנרגטית, ניצוצות פורחים, סגנון רובלוקס מקוצבי."
    }
  },
  {
    name: { en: "Jesse (Minecraft Story Mode)", he: "ג'סי (מיינקראפט סטורי מוד)" },
    description: {
      en: "Jesse from Minecraft Story Mode, wearing signature blue and white suspenders over a white shirt, charismatic leader expression with a confident smile, holding a glowing enchanted sword, standing in front of a swirling purple Nether portal. Cinematic depth of field, Telltale games enhanced art style, 8k. Minecraft blocky character with expressive face.",
      he: "ג'סי ממיינקראפט סטורי מוד, הגיבור הנרטיבי. לובש כתפיות (שלייקס) כחולות ולבנות מעל חולצה לבנה. הבעת מנהיג כריזמטי עם חיוך בטוח. מחזיק חרב מכושפת זוהרת. עומד מול פורטל נת'ר מסתחרר. עומק שדה קולנועי, סגנון Telltale משוכלל."
    }
  },
  {
    name: { en: "Zizzy (Roblox Piggy)", he: "זיזי (רובלוקס פיגי)" },
    description: {
      en: "Zizzy from Roblox Piggy, anthropomorphic zebra character with black and white stripes, wearing a flowing purple dress and a large purple hat with a purple feather, holding a thin fencing sword in a combat stance. Dark moody background, dramatic rim lighting, heroic and determined expression, 3D horror-action character art style.",
      he: "זיזי מרובלוקס פיגי, לוחמת הזברה האמיצה. דמות זברה אנתרופומורפית עם פסים שחורים ולבנים, לובשת שמלה סגולה זורמת וכובע סגול גדול עם נוצה. מחזיקה חרב סיוף דקה בתנוחת לחימה. רקע מאופל ודרמטי, תאורת שוליים דרמטית."
    }
  },
  {
    name: { en: "The Guest (Roblox)", he: "האורח (רובלוקס)" },
    description: {
      en: "The mysterious Guest Roblox character, wearing a black Roblox baseball cap and a black jacket, pale white skin, standing alone in the rain with a mysterious aura, neon city lights reflecting on wet pavement below. Noir cyberpunk atmosphere with deep shadows, high quality 3D illustration, fog effects. Classic Roblox blocky proportions.",
      he: "הדמות המסתורית של האורח מרובלוקס, סמל לנוסטלגיה. לובש כובע בייסבול שחור עם לוגו רובלוקס ומעיל שחור. עור לבן חיוור. עומד לבד בגשם עם הילה מסתורית, אורות ניאון של העיר משתקפים על המדרכה הרטובה. אוירת נואר סייברפאנק."
    }
  },
  {
    name: { en: "Tamed Wolf (Minecraft)", he: "זאב מאולף (מיינקראפט)" },
    description: {
      en: "Cute tamed Minecraft Wolf with a bright red collar around its neck, sitting faithfully on a green grass block, fluffy white-grey fur with blocky geometry mixed with fluffy texture, bright blue sky background, adorable and heartwarming expression with perked ears. Macro photography style 3D render, warm sunlight.",
      he: "זאב מאולף ממיינקראפט, חבר הנאמן של השחקן. זאב לבן-אפור פרוותי עם קולר אדום בהיר. יושב בנאמנות על בלוק דשא ירוק עם אוזניים זקופות. שיער פלאפי המשולב עם גיאומטריה מקוצבית. שמיים כחולים בהירים ברקע, תאורת שמש חמה."
    }
  },

  // ─── Minecraft & Roblox Villains ────────────────────────────────────────────
  {
    name: { en: "Herobrine (Minecraft)", he: "הירוברין (מיינקראפט)" },
    description: {
      en: "Herobrine from Minecraft, looks exactly like Steve but with terrifying glowing solid white blank eyes with no pupils, emerging slowly from thick heavy fog deep in a dark cave. Ominous dark silhouette, horror atmosphere, dynamic dramatic shadows, unnervingly calm and powerful presence, photorealistic 3D render with cinematic lighting.",
      he: "הירוברין ממיינקראפט, האגדה האורבנית המפחידה. דומה בדיוק לסטיב אך עם עיניים לבנות ריקות וזוהרות ללא אישונים. מתגלה לאט מתוך ערפל עבה במעמקי מערה חשוכה. צלל מאיים, אוירת אימה, צלליות דרמטיות."
    }
  },
  {
    name: { en: "Ender Dragon (Minecraft)", he: "דרקון הסוף (מיינקראפט)" },
    description: {
      en: "The Ender Dragon swooping down dramatically, massive black scaly body with glowing purple eyes and purple bioluminescent wing membranes, exhaling a stream of purple dragon breath weapon, flying over tall obsidian pillars in The End dimension, starry endless void background, epic boss fight cinematic composition, fantasy art.",
      he: "דרקון הסוף ממיינקראפט, הבוס הסופי הקלאסי. דרקון שחור ענק עם עיניים סגולות זוהרות וממברנות כנפיים סגולות בולטות. פולט זרם של נשימת דרקון סגולה. עף מעל עמודי אובסידיאן ב'מימד הסוף'. רקע ריק כוכבי, קומפוזיציה אפית."
    }
  },
  {
    name: { en: "Penny Piggy (Roblox)", he: "פיגי / פני (רובלוקס)" },
    description: {
      en: "Penny Piggy from Roblox, anthropomorphic pig character with pink skin, wearing a torn red dress, one glowing red evil eye and one normal eye, holding a wooden baseball bat with both hands, standing in a dark creepy abandoned house hallway with peeling wallpaper. Jump scare atmosphere, horror game style 3D render, dramatic shadows.",
      he: "פיגי/פני מרובלוקס, הנבלת שהתחילה את טרנד האימה. חזירה אנתרופומורפית עם עור ורוד, לובשת שמלה אדומה קרועה. עין אחת אדומה רעה וזוהרת, עין שנייה רגילה. מחזיקה מחבט בייסבול עץ. עומדת במסדרון בית נטוש מחריד."
    }
  },
  {
    name: { en: "The Warden (Minecraft)", he: "השומר (מיינקראפט)" },
    description: {
      en: "The Warden from Minecraft, a terrifying enormous dark blue-black monster with bioluminescent cyan glowing patterns across its chest and side body, two large upward curved bone sensors on top of its head, standing menacingly deep in a dark sculk cave biome with blue particles. Blind but sensing through sound, hyper-detailed horror fantasy style, 8k render.",
      he: "השומר ממיינקראפט, המפלצת העיוורת והמבעיתה מהמעמקים. יצור כחול-שחור ענק עם דפוסים ציאן זוהרים ביולומינסנטיים על חזהו. שני חיישנים עצמיים גדולים מעוקלים כלפי מעלה על ראשו. עומד בצורה מאיימת במערת סקאלק חשוכה."
    }
  },
  {
    name: { en: "Seek (Roblox Doors)", he: "סיק (רובלוקס דורז)" },
    description: {
      en: "Seek from Roblox Doors, a tall humanoid figure entirely made of flowing black viscous liquid sludge, a single enormous realistic human eye on its face, running at high speed through a long hotel hallway lined with numbered doors, extreme motion blur effect, red emergency warning lights flashing, intense action horror scene.",
      he: "סיק מרובלוקס דורז', המפלצת המרדפת המפורסמת. דמות אנושית ענקית כולה עשויה נוזל שחור סמיך וזורם. עין אחת אנושית ריאליסטית וענקית במרכז הפנים. רץ במהירות עצומה במסדרון מלון ארוך. תאורת חירום אדומה מהבהבת."
    }
  },
  {
    name: { en: "Wither Storm (Minecraft Story Mode)", he: "סערת הוויתר (מיינקראפט)" },
    description: {
      en: "The Wither Storm from Minecraft Story Mode, a colossal three-headed black Wither monster that has grown to apocalyptic size, consuming entire chunks of the world with purple tractor beam tentacles pulling blocks from the ground and sky, apocalyptic stormy sky, massive scale visible against the horizon, epic disaster movie style 3D art.",
      he: "סערת הוויתר ממיינקראפט סטורי מוד, המפלצת הגדולה ביותר. גרסה ענקית ושחורה של הוויתר בעלת שלושה ראשים, בולעת עולמות שלמים. קרני משיכה סגולות מושכות בלוקים מהאדמה והשמיים. שמיים סוערים אפוקליפטיים."
    }
  },
  {
    name: { en: "Blue (Roblox Rainbow Friends)", he: "בלו (רובלוקס ריינבו פרנדס)" },
    description: {
      en: "Blue from Rainbow Friends Roblox, large tall blue monster with a big round head, a small yellow crown on top, one black button eye in the center of its face, mouth slightly open showing blunt teeth, drooling slightly, standing in a colorful abandoned children's playhouse environment. Slightly creepy but cartoonish aesthetic, vibrant primary colors, 3D character design.",
      he: "בלו מרובלוקס ריינבו פרנדס, המפלצת הראשית. מפלצת כחולה גבוהה וגדולה עם ראש עגול ענק, כתר צהוב קטן מלמעלה, עין כפתור שחורה אחת במרכז, פה פתוח מעט. מזיל ריר. עומד בבית משחקים ילדותי צבעוני ונטוש. אסתטיקה מפחידה אך קריקטורית."
    }
  },
  {
    name: { en: "1x1x1x1 (Roblox)", he: "1x1x1x1 (רובלוקס)" },
    description: {
      en: "1x1x1x1 Roblox legendary hacker villain, dark avatar figure surrounded by cascading digital glitch effects, floating green binary code fragments and corrupted data streams, standing in a completely corrupted virtual world environment with broken geometry. Matrix-style lighting with green tones, ominous and powerful hacker aesthetic, 3D render.",
      he: "1x1x1x1, ההאקר האגדי מרובלוקס, הנבל האולטימטיבי. דמות כהה מוקפת בגלישי (גליץ') דיגיטרליים, קטעי קוד בינארי ירוק מרחפים וזרמי נתונים פגומים. עומד בעולם וירטואלי שבור לחלוטין. תאורת מטריקס ירוקה, אסתטיקת האקר מאיים."
    }
  },
  {
    name: { en: "Charged Creeper (Minecraft)", he: "קריפר מוטען (מיינקראפט)" },
    description: {
      en: "A Charged Creeper from Minecraft, classic green pixelated blocky texture body with a distinctive sad face made of dark pixel squares, surrounded by a crackling blue electric lightning aura, standing ominously near a wooden house at night, about to explode, blue electric sparks arcing around it. Suspenseful atmosphere, dynamic dramatic lighting.",
      he: "קריפר מוטען ממיינקראפט, הסיוט של כל בנאי. גוף מקוצבי ירוק קלאסי עם פנים עצובות פיקסליות. מוקף בהילה חשמלית כחולה מבריקה, עומד בצורה מאיימת ליד בית עץ בלילה, עומד להתפוצץ. ניצוצות חשמליים כחולים מתעגלים סביבו."
    }
  },
  {
    name: { en: "Figure (Roblox Doors)", he: "פיגר (רובלוקס דורז')" },
    description: {
      en: "Figure from Roblox Doors, an extremely tall and imposing reddish-brown monster with no eyes whatsoever, a massive gaping mouth filled with rows of sharp uneven teeth, walking slowly through a dark grand library maze with tall bookshelves. Stealth horror atmosphere, complete darkness except for bioluminescent markings, sound wave visualization effects around its head, highly detailed 3D model.",
      he: "פיגר מרובלוקס דורז', המפלצת העיוורת מהספרייה. יצור גבוה ומאיים בצבע חום-אדמדם ללא עיניים כלל. פה ענק פעור מלא בשיניים חדות לא סדירות. מהלך לאט במבוך ספרייה ענקי וחשוך. אוירת אימת חמקנות, גלי קול סביב ראשו."
    }
  },

  // ── Fortnite ──────────────────────────────────────────────────────────
  {
    name: { en: "Jonesy (Fortnite)", he: "ג'ונסי (פורטנייט)" },
    description: {
      en: "Jonesy from Fortnite, a young man with short messy brown hair and brown eyes. He wears the classic 'Default' outfit: a plain teal t-shirt under an open tan cargo jacket, dark grey cargo pants with many pockets, and brown lace-up boots. He carries a pickaxe on his back. Cheerful and slightly clueless expression. Stylized 3D Fortnite game render aesthetic.",
      he: "ג'ונסי מפורטנייט, חייל ה'דיפולט' הקלאסי. שיער חום מבולגן ועיניים חומות. לובש חולצת טי טורקיז תחת ג'קט מטען פתוח בצבע חאקי, מכנסי מטען אפורים עם כיסים רבים ומגפיים חומים. גרזן גב. הבעה עליזה ומעט נאיבית. סגנון 3D פורטנייט."
    }
  },
  {
    name: { en: "Peely (Fortnite)", he: "פילי הבננה (פורטנייט)" },
    description: {
      en: "Peely from Fortnite, a giant anthropomorphic banana character with smooth bright yellow banana peel skin forming a one-piece suit. He has a wide friendly grin, large oval white eyes with black pupils, and small stubby arms and legs. Occasionally spots of brown bruising visible on the LEFT side. Cheerful and goofy Fortnite 3D game render style.",
      he: "פילי מפורטנייט, דמות בננה אנתרופומורפית ענקית עם קליפת בננה צהובה בוהקת חלקה המהווה חליפה שלמה. חיוך רחב וידידותי, עיניים גדולות ועגלגלות עם אישונים שחורים, זרועות ורגליים קצרצרות. לעיתים כתמי חבורה חומים בצד שמאל. סגנון 3D פורטנייט."
    }
  },
  {
    name: { en: "Midas (Fortnite)", he: "מידאס (פורטנייט)" },
    description: {
      en: "Midas from Fortnite, a stylish male villain with slicked-back golden blonde hair. He wears a perfectly tailored black tuxedo with gold lapels and a gold pocket square. His RIGHT hand is entirely made of solid gold (the 'golden touch'). He has sharp cheekbones, cold calculating eyes, and a smug expression. Gold watch on his LEFT wrist. Fortnite 3D stylized render.",
      he: "מידאס מפורטנייט, נבל אלגנטי עם שיער בלונד זהוב מסופר לאחור. לובש חליפת ערב שחורה מחויטת עם דשי זהב ומטפחת כיס זהב. ידו הימנית עשויה זהב מוצק לחלוטין ('מגע הזהב'). לחיות חדות, עיניים קרות וחישוביות, הבעה שחצנית. שעון זהב על יד שמאל. רנדר 3D פורטנייט."
    }
  },
  {
    name: { en: "Red Crewmate (Among Us)", he: "חבר צוות אדום (Among Us)" },
    description: {
      en: "The Red Crewmate from Among Us, a small round egg-shaped character colored entirely in solid red. They have a single large reflective glass visor covering their face, showing white highlights. They wear a small space backpack on their back. No visible limbs except short stubby legs. Simple, cute 2D cartoon animation style.",
      he: "חבר הצוות האדום מ-Among Us. דמות קטנה ועגולה בצורת ביצה, צבועה כולה באדום אחיד. ויזור זכוכית מחזיר אור גדול מכסה את הפנים. תרמיל חלל קטן על הגב. ללא גפיים נראות מלבד רגלים קצרצרות. סגנון קריקטורה 2D פשוט וחמוד."
    }
  },
  {
    name: { en: "Black Impostor (Among Us)", he: "המטעה השחור (Among Us)" },
    description: {
      en: "The Black Impostor from Among Us, visually identical to a crewmate but with a sinister twist: sharp red eyes glow behind the dark visor, and a long reptilian purple tongue flickers from beneath the visor. Their silhouette has a subtle extra jaw underneath. Black body color. Eerie lighting, sinister expression. 2D cartoon style.",
      he: "המטעה השחור מ-Among Us. זהה חזותית לחבר צוות אך עם טוויסט מאיים: עיניים אדומות זוהרות וחדות מבצבצות מאחורי הויזור הכהה, ולשון סגולה וזוחלית מציצה מתחתיו. צבע גוף שחור. תאורה מפחידה, הבעה זורמת. סגנון קריקטורה 2D."
    }
  },
  {
    name: { en: "CJ (GTA San Andreas)", he: "סי ג'יי (GTA San Andreas)" },
    description: {
      en: "CJ (Carl Johnson) from GTA San Andreas, a muscular Black man in his mid-20s with a clean-shaved head and dark brown eyes. He wears a white crew-neck tank top tucked into baggy dark blue jeans that sag below the waist, showing grey boxers. Clean white Nike-style high-top sneakers. A thick gold figaro chain around his neck. His expression is street-smart and determined. Stylized GTA game aesthetic.",
      he: "סי ג'יי (קרל ג'ונסון) מ-GTA San Andreas. גבר שחור שרירי באמצע שנות ה-20 עם ראש מגולח ועיניים חומות כהות. לובש גופיית טנק לבנה עם צווארון עגול בתוך ג'ינס כחול כהה רחב שמשתפל מתחת למותניים. נעלי הייטופ לבנות. שרשרת זהב עבה על צוואר. הבעה חכמה ורחובית. אסתטיקת GTA."
    }
  },
  {
    name: { en: "Trevor (GTA V)", he: "טרבור (GTA V)" },
    description: {
      en: "Trevor Philips from GTA V, a lean, erratic-looking white man in his mid-40s with a shaved head and intense, unhinged blue eyes with dark circles. He often wears a dirty grey t-shirt with rips on the LEFT shoulder and filthy khaki pants. Visible tattoos on both arms and neck. His face has a perpetual maniacal grin and several days of unshaven stubble. Stylized GTA V game render.",
      he: "טרבור פיליפס מ-GTA V. גבר לבן רזה ומוזר ממראה בשנות ה-40 האמצעיות עם ראש מגולח ועיניים כחולות עזות וחולות עם עיגולים כהים. לרוב לובש חולצת טי אפורה ומלוכלכת עם קרעים בכתף שמאל ומכנסי חאקי מטונפים. קעקועים על שני הזרועות והצוואר. פנים עם חיוך מאניה תמידי ושלושה ימים של זיפים. רנדר GTA V."
    }
  },

  // ── Anime ─────────────────────────────────────────────────────────────
  {
    name: { en: "Naruto Uzumaki", he: "נארוטו אוזומאקי" },
    description: {
      en: "Naruto Uzumaki, a teenage male ninja with spiky bright blonde hair and sky blue eyes. He has three distinctive whisker-like marks on EACH cheek (six total). He wears his iconic orange jumpsuit with dark blue shoulders and collar, and a black mesh undershirt visible at the neck. A forehead protector (hitai-ate) with a metal leaf symbol plate is tied with a blue cloth around his forehead. High-quality anime illustration style.",
      he: "נארוטו אוזומאקי, נינג'ה בגיל עשרה עם שיער בלונד זוהר ועיניים כחולות כשמיים. שלוש סימנים דמויי שפם על כל לחי (שישה סה\"כ). לובש סרבל כתום עם כתפיים וצווארון כחול כהה. מגן מצח עם לוחית מתכת מסמל עלה קשור בבד כחול. סגנון אנימה איכותי."
    }
  },
  {
    name: { en: "Sasuke Uchiha", he: "סאסוקה אוצ'יהה" },
    description: {
      en: "Sasuke Uchiha from Naruto, a teenage male with short blue-black hair with defined side bangs that fall over his LEFT eye. He has pale skin, charcoal dark eyes that sometimes reveal the red Sharingan (three tomoe). He wears a dark navy blue high-collared short-sleeve shirt and white shorts. He carries a sword (kusarigama) on his back. Cool, stoic, intense expression. High-quality anime style.",
      he: "סאסוקה אוצ'יהה מנארוטו. נינג'ה גבר עם שיער כחול-שחור קצר עם פוני צד שנופל מעל עין שמאל. עור חיוור, עיניים שחורות-פחם שלעיתים חושפות את השארינגן האדום. לובש חולצה נייבי כהה עם צווארון גבוה ומכנסיים לבנים. חרב על הגב. הבעה קרה ועצורה. סגנון אנימה."
    }
  },
  {
    name: { en: "Goku (Dragon Ball Z)", he: "גוקו (דרגון בול Z)" },
    description: {
      en: "Son Goku from Dragon Ball Z, an adult male with wild, upward-spiking jet-black hair that forms five distinct points. He has a muscular physique and kind, dark eyes. He wears the iconic orange and dark blue martial arts gi with a red belt tied around his waist. His boots are dark blue. He has a warm, fearless smile. In Super Saiyan form: golden upward electric hair and teal eyes. High-quality Dragon Ball anime style.",
      he: "גוקו מדרגון בול Z. גבר עם שיער שחור פרוע הכוון מעלה ביחמש נקודות בולטות. גוף שרירי ועיניים כהות ואדיבות. לובש את המדווה הכתומה-כחולה הקלאסית עם חגורה אדומה ונעליים כחולות. חיוך חם ונועז. בצורת סאיאן-על: שיער זהב חשמלי ועיניים ירוק-כחלחלות. סגנון אנימה דרגון בול."
    }
  },
  {
    name: { en: "Monkey D. Luffy (One Piece)", he: "לופי (One Piece)" },
    description: {
      en: "Monkey D. Luffy from One Piece, a lean young man with short messy black hair partially covered by a worn red straw hat with a red ribbon. He has a distinctive X-shaped scar under his LEFT eye (from a self-inflicted knife wound). He wears a plain red vest vest, blue shorts, and sandals. His arms and legs can stretch like rubber (optionally shown). Perpetual wide, fearless grin. High-quality One Piece anime aesthetic.",
      he: "לופי מ-One Piece. בחור צעיר ורזה עם שיער שחור קצר ומבולגן מכוסה חלקית בכובע קש אדום עם סרט אדום. צלקת X מיוחדת מתחת לעין שמאל. לובש גופייה אדומה, מכנסיים כחולים וסנדלים. זרועות ורגליים שיכולות להתמתח כגומי. חיוך רחב וחסר פחד. סגנון אנימה One Piece."
    }
  },
  {
    name: { en: "Roronoa Zoro (One Piece)", he: "זורו (One Piece)" },
    description: {
      en: "Roronoa Zoro from One Piece, a muscular young swordsman with short cropped green hair and a single gold hoop earring in his LEFT ear (with two small additional rings). He has a large X-shaped scar on his chest and a smaller scar over his LEFT eye (which is always closed). He carries THREE katanas: two in his hands and one in his MOUTH. He wears a plain white shirt open at the chest and dark green trousers. Stoic expression. High-quality One Piece anime style.",
      he: "זורו מ-One Piece. חרבן שרירי עם שיער ירוק חתוך קצר ועגיל חישוק זהב יחיד באוזן שמאל. צלקת X גדולה על החזה וצלקת קטנה על עין שמאל (תמיד עצומה). נושא שלוש קטאנות: שתיים בידיו ואחת בפיו. לובש חולצה לבנה פתוחה ומכנסי ירוק כהה. הבעה עצורה. סגנון אנימה One Piece."
    }
  },
  {
    name: { en: "Gojo Satoru (Jujutsu Kaisen)", he: "גוג'ו סאטורו (Jujutsu Kaisen)" },
    description: {
      en: "Gojo Satoru from Jujutsu Kaisen, a very tall slender man in his late 20s with snow-white fluffy hair. His most distinctive feature is a black blindfold wrapped around his eyes (or when shown open: brilliant cyan-blue Six Eyes). He wears the standard black Jujutsu High uniform: a high-collared long-sleeved black coat. He has a confident, playful smirk. High-quality Jujutsu Kaisen anime style.",
      he: "גוג'ו סאטורו מ-Jujutsu Kaisen. גבר גבוה ודק בסוף שנות ה-20 עם שיער לבן ורך. המאפיין הבולט ביותר: כיסוי עיניים שחור (או כשפתוח: עיניים ציאן-כחולות זוהרות 'שש עיניים'). לובש את מדווה הג'וג'וצו השחורה הרגילה עם צווארון גבוה. חיוך בטוח ושובבי. סגנון אנימה Jujutsu Kaisen."
    }
  },
  {
    name: { en: "Levi Ackerman (Attack on Titan)", he: "לוי אקרמן (Attack on Titan)" },
    description: {
      en: "Levi Ackerman from Attack on Titan, a short but extremely muscular man with short undercut black hair and sharp, piercing steel-grey eyes with permanent dark circles from lack of sleep. He wears the Survey Corps uniform: a tan jacket over a white button-up shirt and brown belts with ODM gear holsters on his hips. A forest green Scout Regiment cloak with the Wings of Freedom emblem is worn over the jacket. His expression is perpetually cold and unimpressed. High-quality Attack on Titan anime style.",
      he: "לוי אקרמן מ-Attack on Titan. גבר נמוך אך שרירי ביותר עם שיער שחור קצר ואנדרקאט ועיניים אפור-פלדה חדות עם עיגולים כהים קבועים. לובש את מדי גדוד הסיור: ג'קט חאקי מעל חולצה לבנה עם חגורות ורתמות ציוד ODM. גלימה ירוקה עם סמל כנפי החופש. הבעה קרה ועצורה לצמיתות. סגנון אנימה Attack on Titan."
    }
  },
  {
    name: { en: "Vegeta (Dragon Ball Z)", he: "וגטה (דרגון בול Z)" },
    description: {
      en: "Vegeta from Dragon Ball Z, a proud muscular male Saiyan warrior with distinctive flame-shaped upward-pointing black hair (or golden in Super Saiyan mode) and dark eyes with an imperious glare. He wears his iconic blue Saiyan battle armor with white chest plate, white shoulder and hip guards, white gloves and boots. The armor has a prominent gold Saiyan crest on the chest. Arms crossed, scowling expression of royal disdain. Dragon Ball Z anime style.",
      he: "וגטה מדרגון בול Z. לוחם סאיאן שרירי וגאוותן עם שיער שחור בצורת להבה כלפי מעלה (או זהב בצורת סאיאן-על). עיניים כהות עם מבט מלכותי. לובש את שריון הסאיאן הכחול הקלאסי עם חזיה לבנה, מגיני כתפיים, ירכיים, כפפות ומגפיים לבנים. שריון עם עיטור סאיאן זהב בחזה. ידיים שלובות, הבעת זלזול מלכותי. סגנון דרגון בול Z."
    }
  },

  // ── היסטוריות ומיתולוגיות ──────────────────────────────────────────────────────────────
  {
    name: { en: "Julius Caesar", he: "יוליוס קיסר" },
    description: {
      en: "Julius Caesar, a Roman general and statesman in his 50s with a lean, commanding face, receding short dark brown hair, and sharp dark eyes. He wears a magnificent purple-bordered white Toga Picta draped over one shoulder, fastened with a gold fibula. A golden laurel wreath crown sits on his head. He carries a golden eagle-topped Roman staff (scepter) in his RIGHT hand. Cinematic historical epic style.",
      he: "יוליוס קיסר, גנרל ומדינאי רומאי בשנות ה-50 לחייו עם פנים רזות ומפקדת, שיער חום כהה קצר ומדולדל ועיניים כהות ואסרטיביות. לובש טוגה לבנה עם שוליים סגוליים מפוארת הלפופה על כתף אחת וסוגרת עם סיכה זהב. כתר זר דפנה זהב על ראשו. שרביט רומאי עם ראש נשר זהב בידו הימנית. סגנון אפי היסטורי קולנועי."
    }
  },
  {
    name: { en: "Cleopatra", he: "קלאופטרה" },
    description: {
      en: "Cleopatra VII of Egypt, a regal woman in her late 20s with olive skin and sharp, intelligent black eyes lined with dramatic black kohl extending to her temples. Her jet-black hair is perfectly straight and falls to her chin in a geometric cut. She wears a pleated white linen dress (kalasiris) with a jeweled golden collar (wesekh), gold arm and wrist bands on BOTH arms, and a golden Nemes headdress with a cobra uraeus. Cinematic ancient Egyptian aesthetic.",
      he: "קלאופטרה השביעית של מצרים. אישה מלכותית בסוף שנות ה-20 לחייה עם עור זית ועיניים שחורות ונבונות המנוקרות בכוחל שחור דרמטי המתארך לעבר הרקות. שיערה שחור כפחם ישר לחלוטין ונופל לסנטרה בתספורת גיאומטרית. לובשת שמלת פשתן לבנה עם צווארון זהב מקושט, צמידי זהב על שתי הזרועות ומצנפת נמס זהב עם ורד (אוראוס). אסתטיקת מצרים עתיקה קולנועית."
    }
  },
  {
    name: { en: "Napoleon Bonaparte", he: "נפוליאון בונפרטה" },
    description: {
      en: "Napoleon Bonaparte, a compact but authoritative man in his early 40s with short dark brown hair and intense grey-blue eyes. He wears his signature dark blue double-breasted French Imperial Guard uniform with red and gold epaulettes on both shoulders. His iconic bicorne black hat is worn sideways (en bataille). His RIGHT hand is tucked into his jacket front. A Legion of Honor medal with a red ribbon is pinned to his LEFT chest. Cinematic historical style.",
      he: "נפוליאון בונפרטה. גבר קומפקטי אך סמכותי בשנות ה-40 המוקדמות לחייו עם שיער חום כהה קצר ועיניים אפור-כחלחלות עזות. לובש את המדים הכחולים-כפולים הקלאסיים שלו של המשמר הקיסרי הצרפתי עם אפולטים אדום-זהב על שתי הכתפיים. כובע בישורן שחור אגדי הנחבש לרוחב. ידו הימנית תקועה בחזית מעילו. מדליית לגיון הכבוד על חזה שמאל. סגנון היסטורי קולנועי."
    }
  },
  {
    name: { en: "Zeus (Greek Mythology)", he: "זאוס (מיתולוגיה יוונית)" },
    description: {
      en: "Zeus, the king of the Greek gods, as a massively built divine man appearing in his 50s with flowing white hair and a full majestic white beard. He wears a pure white toga-like drape held by a gold Zeus thunderbolt crest brooch on his RIGHT shoulder. He holds a crackling golden lightning bolt in his RIGHT hand. His eyes glow with electric white light. A golden crown of laurels on his head. Cinematic mythological epic style.",
      he: "זאוס, מלך האלים היוונים. גבר אלוהי בעל מבנה גוף עצמון הנראה בשנות ה-50 לחייו עם שיער לבן זוהר וזקן לבן מלא ומלכותי. לובש דרפד לבן טהור המחוזק בסיכת ברק זהב על כתף ימין. אוחז בברק זהב מבעבע בידו הימנית. עיניו זוהרות באור לבן חשמלי. כתר זית זהב על ראשו. סגנון מיתולוגי אפי קולנועי."
    }
  },
  {
    name: { en: "Anubis (Egyptian Mythology)", he: "אנוביס (מיתולוגיה מצרית)" },
    description: {
      en: "Anubis, the Egyptian god of the dead, depicted as a tall figure with the muscular body of a man and the head of a sleek black jackal with tall pointed ears lined with gold inside. He wears a gleaming golden Egyptian collar (wesekh) and a white linen kilt with a gold-buckled belt. In his LEFT hand, he holds the Was-scepter (a tall staff topped with an animal head). In his RIGHT, the ankh symbol. His eyes glow amber gold. Cinematic Egyptian mythology style.",
      he: "אנוביס, אל המתים המצרי. דמות גבוהה עם גוף שרירי של גבר וראש של שועל (ג'קל) שחור ואלגנטי עם אוזניים מחודדות וגבוהות מרופדות בפנים בזהב. לובש צווארון מצרי זהוב מבריק (ווסאח') וחצאית פשתן לבנה עם חגורת אבזם זהב. בידו השמאלית שרביט עם ראש חיה. בידו הימנית סמל הענח'. עיניו זוהרות בענבר זהב. סגנון מיתולוגיה מצרית קולנועי."
    }
  },
  {
    name: { en: "Thor (Norse Mythology)", he: "ת'ור (מיתולוגיה נורדית)" },
    description: {
      en: "Thor, the Norse god of thunder, as an enormous, powerfully built man with long wild red-blonde hair and a thick braided red-blonde beard. He wears battle-worn circular steel Norse armor with fur pauldrons on BOTH shoulders. His eyes are electric blue. Mjolnir (a short-handled war hammer with a flat square head) is swung in his RIGHT hand. A lightning bolt crackles from the hammer. A winged silver Nordic helmet on his head. Cinematic Norse epic style.",
      he: "ת'ור, אל הרעם הנורדי. גבר ענק ובעל מבנה גוף רב-עוצמה עם שיער ארוך ופרוע ים-אדמדם וזקן קלוע עבה. לובש שריון פלדה נורדי עגלגל ומושחת קרב עם סנדלי פרווה על שתי הכתפיים. עיניו כחולות חשמליות. מג'ולניר (פטיש מלחמה בעל ידית קצרה וראש ריבועי שטוח) מסתחרר בידו הימנית. ברק קורע מהפטיש. קסדה נורדית כסופה עם כנפיים על הראש. סגנון נורדי אפי."
    }
  },
  {
    name: { en: "Athena (Greek Mythology)", he: "אתנה (מיתולוגיה יוונית)" },
    description: {
      en: "Athena, the Greek goddess of wisdom, as a tall, regal woman with calm grey eyes and dark hair braided and pinned beneath a gleaming Corinthian bronze combat helmet worn tilted back on her head. She wears overlapping bronze scale armor (linothorax) over a white chiton dress. A circular shield (aspis) with the Gorgon Medusa face etched on it is on her LEFT arm. She holds a long golden spear in her RIGHT hand. An owl perches on her LEFT shoulder. Cinematic Greek mythology style.",
      he: "אתנה, אלת החכמה היוונית. אישה גבוהה ומלכותית עם עיניים אפורות שקטות ושיער כהה קלוע ותחוב מתחת לקסדת קרב קורינתית ברונזה מבריקה. לובשת שריון ברונזה דמויי קשקשים מדורגים מעל שמלת כיטון לבנה. מגן עגול (אספיס) עם פניה של מדוזה הגורגון חרוטות עליו על זרוע שמאל. מחזיקה רומח ארוך זהוב בידה הימנית. ינשוף יושב על כתפה השמאלית. סגנון מיתולוגיה יוונית."
    }
  }
];

const SetupForm: React.FC<SetupFormProps> = ({ config, setConfig, onSubmit, isLoading, lang }) => {
  const conceptImageInputRef = useRef<HTMLInputElement>(null);
  const startImageInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [showPresets, setShowPresets] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const t = translations[lang];

  // Load custom characters from local storage
  useEffect(() => {
    try {
        const saved = localStorage.getItem(CUSTOM_CHARS_KEY);
        if (saved) {
            setCustomCharacters(JSON.parse(saved));
        }
    } catch (e) {
        console.error("Failed to load custom characters", e);
    }
  }, []);

  const handleChange = (field: keyof SeriesConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyTemplate = (template: SeriesTemplate) => {
      setConfig(prev => ({
          ...prev,
          ...template.config,
          characters: template.config.characters || [] // Ensure characters are copied
      }));
      setShowTemplates(false);
  };

  const handleConceptImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setConfig(prev => ({
            ...prev,
            conceptImage: base64Data,
            conceptImageMimeType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearConceptImage = () => {
      setConfig(prev => ({
          ...prev,
          conceptImage: undefined,
          conceptImageMimeType: undefined
      }));
      if (conceptImageInputRef.current) conceptImageInputRef.current.value = '';
  };

  const handleStartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              setConfig(prev => ({
                  ...prev,
                  startImage: base64Data,
                  startImageMimeType: file.type
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const clearStartImage = () => {
      setConfig(prev => ({
          ...prev,
          startImage: undefined,
          startImageMimeType: undefined
      }));
      if (startImageInputRef.current) startImageInputRef.current.value = '';
  };

  // --- Character Logic ---

  const addCharacter = () => {
      const newChar: Character = {
          id: crypto.randomUUID(),
          name: '',
          description: ''
      };
      setConfig(prev => ({
          ...prev,
          characters: [...prev.characters, newChar]
      }));
  };

  const addPresetCharacter = (preset: LocalizedPreset) => {
      const newChar: Character = {
          id: crypto.randomUUID(),
          name: preset.name[lang],
          description: preset.description[lang]
      };
      setConfig(prev => ({
          ...prev,
          characters: [...prev.characters, newChar]
      }));
      setShowPresets(false);
  };

  const addSavedCharacter = (savedChar: Character) => {
      const newChar: Character = {
          ...savedChar,
          id: crypto.randomUUID() // New ID for current usage
      };
      setConfig(prev => ({
          ...prev,
          characters: [...prev.characters, newChar]
      }));
      setShowPresets(false);
  };

  const handleSaveCharacter = (char: Character) => {
      if (!char.name || !char.description) {
          alert(t.fillCharToSave);
          return;
      }
      
      const charToSave: Character = { ...char }; // Clone
      const updatedList = [charToSave, ...customCharacters];
      
      setCustomCharacters(updatedList);
      localStorage.setItem(CUSTOM_CHARS_KEY, JSON.stringify(updatedList));
      
      setSavedSuccessId(char.id);
      setTimeout(() => setSavedSuccessId(null), 2000);
  };

  const handleDeleteSavedCharacter = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const updatedList = customCharacters.filter(c => c.id !== id);
      setCustomCharacters(updatedList);
      localStorage.setItem(CUSTOM_CHARS_KEY, JSON.stringify(updatedList));
  };

  const removeCharacter = (id: string) => {
      setConfig(prev => ({
          ...prev,
          characters: prev.characters.filter(c => c.id !== id)
      }));
  };

  const updateCharacter = (id: string, field: keyof Character, value: any) => {
      setConfig(prev => ({
          ...prev,
          characters: prev.characters.map(c => c.id === id ? { ...c, [field]: value } : c)
      }));
  };

  const handleCharImageUpload = (e: React.ChangeEvent<HTMLInputElement>, charId: string) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              updateCharacter(charId, 'image', base64Data);
              updateCharacter(charId, 'imageMimeType', file.type);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUrlInputChange = (charId: string, val: string) => {
      setUrlInputs(prev => ({ ...prev, [charId]: val }));
  };

  const fetchImageFromUrl = async (charId: string) => {
      const url = urlInputs[charId];
      if (!url) return;

      setLoadingUrls(prev => ({ ...prev, [charId]: true }));
      try {
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              updateCharacter(charId, 'image', base64Data);
              updateCharacter(charId, 'imageMimeType', blob.type);
          };
          reader.readAsDataURL(blob);
      } catch (e) {
          console.error("Error fetching image from URL", e);
          alert("Failed to load image from URL. It might be blocked by CORS. Try downloading and uploading it instead.");
      } finally {
          setLoadingUrls(prev => ({ ...prev, [charId]: false }));
      }
  };

  const clearCharImage = (charId: string) => {
      updateCharacter(charId, 'image', undefined);
      updateCharacter(charId, 'imageMimeType', undefined);
  };

  const handleRandomIdea = async () => {
    setIsGeneratingIdea(true);
    try {
      const idea = await generateRandomSeriesIdea(config.genre, config.contentLanguage);
      if (idea) {
        handleChange('topic', idea);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingIdea(false);
  };

  const hasAdvancedValues = !!(config.negativePrompt || (config.colorPalette && config.colorPalette.length > 0) || config.sceneMood);

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex flex-col sticky top-20" style={{ maxHeight: 'calc(100vh - 5.5rem)' }}>
      <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
        <Clapperboard className="w-6 h-6" />
        {t.setupTitle}
      </h2>

      {/* TEMPLATES BUTTON */}
      <div className="mb-6">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 border border-indigo-700 rounded-xl p-4 flex items-center justify-between group transition-all"
          >
             <div className="flex items-center gap-3">
                <LayoutTemplate className="w-6 h-6 text-indigo-300" />
                <div className="text-left rtl:text-right">
                    <span className="block font-bold text-white group-hover:text-indigo-200">{t.templatesTitle}</span>
                    <span className="text-xs text-indigo-300">{t.templatesHelp}</span>
                </div>
             </div>
             <Grid className="w-5 h-5 text-indigo-400" />
          </button>
      </div>

      {/* TEMPLATES GRID */}
      {showTemplates && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-4">
              {SERIES_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 rounded-lg p-3 transition-all cursor-pointer flex flex-col gap-2"
                       onClick={() => handleApplyTemplate(tpl)}>
                      <div className="flex items-center gap-2">
                          <span className="text-2xl">{tpl.thumbnailIcon}</span>
                          <h4 className="font-bold text-sm text-slate-200">{tpl.name[lang]}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-tight">
                          {tpl.description[lang]}
                      </p>
                      <div className="mt-auto pt-2 flex gap-1">
                          <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">
                             {GENRE_LABELS[lang][tpl.config.genre!] || tpl.config.genre}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <div className="space-y-5">
        
        {/* Content Language */}
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {t.contentLangLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.contentLanguage}
                    onChange={(e) => handleChange('contentLanguage', e.target.value as Language)}
                >
                    <option value="he">{t.langHe}</option>
                    <option value="en">{t.langEn}</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">{t.contentLangHelp}</p>
             </div>

             {/* TARGET ENGINE */}
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> {t.engineLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.targetEngine}
                    onChange={(e) => handleChange('targetEngine', e.target.value as TargetEngine)}
                >
                    {Object.values(TargetEngine).map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                    ))}
                </select>
             </div>
        </div>

        {/* Topic & Concept Image */}
        <div className="space-y-3">
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-400">{t.topicLabel}</label>
                {config.topic && (
                    <button
                        onClick={() => handleChange('topic', '')}
                        className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-red-400 transition-colors"
                        title="Clear text"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
            <button
                onClick={handleRandomIdea}
                disabled={isGeneratingIdea}
                className="flex items-center gap-1.5 text-xs bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800 transition-all"
            >
                {isGeneratingIdea ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <Sparkles className="w-3 h-3" />
                )}
                {isGeneratingIdea ? t.generatingIdea : t.randomIdeaBtn}
            </button>
          </div>

          {/* Concept Image Upload */}
          <div className="relative">
             {!config.conceptImage ? (
                 <div 
                    onClick={() => conceptImageInputRef.current?.click()}
                    className="flex items-center gap-3 p-3 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500 transition-all group mb-2"
                 >
                    <div className="bg-slate-800 p-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                        <span className="text-sm text-slate-400 group-hover:text-indigo-300 font-medium block">
                            {t.conceptImgLabel}
                        </span>
                        <span className="text-xs text-slate-500 block">
                            {t.conceptImgHelp}
                        </span>
                    </div>
                 </div>
             ) : (
                 <div className="relative mb-2 w-full h-32 rounded-lg overflow-hidden border border-indigo-500/50 group">
                    <img 
                        src={`data:${config.conceptImageMimeType};base64,${config.conceptImage}`}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        alt="Concept"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={clearConceptImage}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-600"
                        >
                            <Trash2 className="w-3 h-3" />
                            {t.removeCharacter}
                        </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white backdrop-blur-sm">
                        Concept Image
                    </div>
                 </div>
             )}
             <input 
                type="file" 
                ref={conceptImageInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleConceptImageUpload} 
            />
          </div>

          <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows={2}
            placeholder={t.topicPlaceholder}
            value={config.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
          />
        </div>

        {/* Start Image Upload */}
        <div className="space-y-3 mt-4 border-t border-slate-700 pt-4">
             <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Images className="w-4 h-4" /> {t.visualAssetsTitle}
             </h3>
             
             {/* Start Image */}
             <div className="relative">
                 {!config.startImage ? (
                     <div 
                        onClick={() => startImageInputRef.current?.click()}
                        className="flex items-center gap-3 p-3 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500 transition-all group mb-2"
                     >
                        <div className="bg-slate-800 p-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                            <span className="text-sm text-slate-400 group-hover:text-indigo-300 font-medium block">
                                {t.startImgLabel}
                            </span>
                            <span className="text-xs text-slate-500 block">
                                {t.startImgHelp}
                            </span>
                        </div>
                     </div>
                 ) : (
                    <div className="relative mb-2 w-full h-32 rounded-lg overflow-hidden border border-indigo-500/50 group">
                        <img 
                            src={`data:${config.startImageMimeType};base64,${config.startImage}`}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            alt="Start Frame"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={clearStartImage}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-600"
                            >
                                <Trash2 className="w-3 h-3" />
                                {t.removeCharacter}
                            </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white backdrop-blur-sm">
                            {t.startImgLabel}
                        </div>
                     </div>
                 )}
                 <input 
                    type="file" 
                    ref={startImageInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleStartImageUpload} 
                />
             </div>
        </div>

        {/* --- CHARACTERS SECTION --- */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> {t.charSectionTitle}
                </h3>
                <div className="flex gap-2">
                  <button 
                      onClick={() => setShowPresets(!showPresets)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm flex items-center gap-1"
                  >
                      <BookOpen className="w-3 h-3" />
                      {showPresets ? t.closePresets : t.addPreset}
                  </button>
                  <button 
                      onClick={addCharacter}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
                  >
                      {t.addCharacter}
                  </button>
                </div>
            </div>

            {/* PRESETS PANEL */}
            {showPresets && (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 max-h-80 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 flex flex-col gap-4">
                
                {/* My Characters */}
                {customCharacters.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide px-1 sticky top-0 bg-slate-900 z-10">{t.myCharacters}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                             {customCharacters.map((char, idx) => (
                                <div 
                                    key={idx}
                                    className="relative flex flex-col items-start gap-1 p-2 rounded-md bg-slate-800 hover:bg-indigo-900/30 border border-slate-700 hover:border-indigo-500/50 transition-all text-left group cursor-pointer"
                                    onClick={() => addSavedCharacter(char)}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        {char.image && (
                                            <img src={`data:${char.imageMimeType};base64,${char.image}`} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                                        )}
                                        <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200 line-clamp-1 flex-1">
                                            {char.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight w-full">
                                        {char.description}
                                    </span>
                                    <button 
                                        onClick={(e) => handleDeleteSavedCharacter(char.id, e)}
                                        className="absolute top-1 right-1 rtl:right-auto rtl:left-1 bg-slate-900/80 text-slate-400 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={t.deleteSaved}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* System Presets */}
                <div>
                     <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide px-1 sticky top-0 bg-slate-900 z-10">{t.systemPresets}</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {PRESET_CHARACTERS.map((preset, idx) => (
                        <button 
                            key={idx}
                            onClick={() => addPresetCharacter(preset)}
                            className="flex flex-col items-start gap-1 p-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all text-left group"
                        >
                            <span className="text-xs font-bold text-slate-300 group-hover:text-white">
                                {preset.name[lang]}
                            </span>
                            <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                                {preset.description[lang]}
                            </span>
                        </button>
                        ))}
                    </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
                {config.characters.map((char, index) => (
                    <div key={char.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 relative group">
                        <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 flex items-center gap-1">
                             <button 
                                onClick={() => handleSaveCharacter(char)}
                                className="text-slate-500 hover:text-indigo-400 p-1 relative group/save"
                                title={t.saveChar}
                            >
                                {savedSuccessId === char.id ? <span className="text-green-500 font-bold text-[10px]">{t.charSaved}</span> : <Save className="w-4 h-4" />}
                            </button>
                             <button 
                                onClick={() => removeCharacter(char.id)}
                                className="text-slate-500 hover:text-red-400 p-1"
                                title={t.removeCharacter}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-bold placeholder-slate-500"
                                    placeholder={t.charNamePlaceholder}
                                    value={char.name}
                                    onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                                />
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs min-h-[60px]"
                                    placeholder={t.charDescPlaceholder}
                                    value={char.description}
                                    onChange={(e) => updateCharacter(char.id, 'description', e.target.value)}
                                />
                            </div>

                            {/* Character Image Handling */}
                            <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-1">
                                    {t.charImgLabel}
                                </label>
                                {!char.image ? (
                                    <div className="flex flex-col gap-2">
                                        <label className="cursor-pointer border border-dashed border-slate-600 rounded-lg p-2 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-indigo-500 transition-all h-20">
                                            <ImageIcon className="w-4 h-4 text-slate-400 mb-1" />
                                            <span className="text-[9px] text-slate-500">{t.clickToUpload}</span>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleCharImageUpload(e, char.id)}
                                            />
                                        </label>
                                        
                                        {/* URL Input */}
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="text" 
                                                placeholder="https://..."
                                                className="flex-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-indigo-500"
                                                value={urlInputs[char.id] || ''}
                                                onChange={(e) => handleUrlInputChange(char.id, e.target.value)}
                                            />
                                            <button 
                                                onClick={() => fetchImageFromUrl(char.id)}
                                                disabled={!urlInputs[char.id] || loadingUrls[char.id]}
                                                className="bg-slate-700 hover:bg-indigo-600 text-white p-1 rounded disabled:opacity-50"
                                                title={t.loadUrl}
                                            >
                                                {loadingUrls[char.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-28 group/img">
                                        <img 
                                            src={`data:${char.imageMimeType};base64,${char.image}`} 
                                            alt={char.name}
                                            className="w-full h-full object-cover rounded-lg border border-indigo-500/50"
                                        />
                                        <button 
                                            onClick={() => clearCharImage(char.id)}
                                            className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 hover:bg-red-600 backdrop-blur-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {config.characters.length === 0 && (
                     <div className="text-center py-4 text-slate-500 text-sm italic border border-dashed border-slate-700 rounded-lg">
                        {t.charSectionTitle}
                     </div>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                   <MessageSquarePlus className="w-3 h-3" />
                   {t.charInstrLabel}
                </label>
                <textarea
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    rows={2}
                    placeholder={t.charInstrPlaceholder}
                    value={config.characterInstructions || ''}
                    onChange={(e) => handleChange('characterInstructions', e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Genre */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Film className="w-4 h-4" /> {t.genreLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.genre}
                    onChange={(e) => handleChange('genre', e.target.value as Genre)}
                >
                    {Object.values(Genre).map((g) => (
                    <option key={g} value={g}>{GENRE_LABELS[lang][g] || g}</option>
                    ))}
                </select>
            </div>

            {/* Episode Count */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <List className="w-4 h-4" /> {t.epCountLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.episodeCount}
                    onChange={(e) => handleChange('episodeCount', parseInt(e.target.value))}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} {t.episodes}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Visual Style */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Video className="w-4 h-4" /> {t.styleLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.style}
                    onChange={(e) => handleChange('style', e.target.value as VisualStyle)}
                >
                    {Object.values(VisualStyle).map((style) => (
                    <option key={style} value={style}>{STYLE_LABELS[lang][style] || style}</option>
                    ))}
                </select>
            </div>

            {/* Scenes Per Episode */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> {t.scenesCountLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.scenesPerEpisode}
                    onChange={(e) => handleChange('scenesPerEpisode', parseInt(e.target.value))}
                >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {t.scenes}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {/* Camera Angle */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> {t.cameraLabel}
                </label>
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={config.camera}
                    onChange={(e) => handleChange('camera', e.target.value as CameraAngle)}
                >
                    {Object.values(CameraAngle).map((cam) => (
                    <option key={cam} value={cam}>{CAMERA_LABELS[lang][cam] || cam}</option>
                    ))}
                </select>
            </div>

            {/* Video Duration */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Timer className="w-4 h-4" /> {t.durationLabel}
                    </label>
                    <span className="text-indigo-400 font-bold text-sm bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-800">
                        {config.videoDuration} {t.seconds}
                    </span>
                </div>
                <input
                    type="range"
                    min="5"
                    max="10"
                    step="1"
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    value={config.videoDuration}
                    onChange={(e) => handleChange('videoDuration', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-slate-500 px-1 mt-1">
                    <span>5 {t.seconds}</span>
                    <span>10 {t.seconds}</span>
                </div>
            </div>
        </div>

        {/* Dialogue Toggle Section */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-400" />
                    <div>
                        <span className="text-sm font-medium text-slate-200 block">{t.includeDialogueLabel}</span>
                        <span className="text-xs text-slate-500">{t.includeDialogueHelp}</span>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={config.includeDialogue}
                        onChange={(e) => handleChange('includeDialogue', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {/* Nested option: Embed Dialogue */}
            {config.includeDialogue && (
                <>
                    <div className="flex items-center justify-between border-t border-slate-700 pt-3 pl-2 pr-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <Subtitles className="w-4 h-4 text-slate-400" />
                            <div>
                                <span className="text-xs font-medium text-slate-300 block">{t.embedDialogueLabel}</span>
                                <span className="text-xs text-slate-500">{t.embedDialogueHelp}</span>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer scale-90 origin-right rtl:origin-left">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={config.embedDialogueInPrompt || false}
                                onChange={(e) => handleChange('embedDialogueInPrompt', e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-700 pt-3 pl-2 pr-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <Captions className="w-4 h-4 text-slate-400" />
                            <div>
                                <span className="text-xs font-medium text-slate-300 block">{t.showSubtitlesLabel}</span>
                                <span className="text-[10px] text-slate-500">{t.showSubtitlesHelp}</span>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer scale-90 origin-right rtl:origin-left">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={config.showSubtitles || false}
                                onChange={(e) => handleChange('showSubtitles', e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                    </div>
                </>
            )}
        </div>

        {/* --- Advanced Settings Accordion --- */}
        <div className="rounded-xl border border-slate-700/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              {t.advancedSettings}
              {hasAdvancedValues && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" title="Has values" />
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="p-4 space-y-4 border-t border-slate-700/60 bg-slate-900/40">
              {/* --- Negative Prompt --- */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" /> {t.negativePromptLabel}
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                  value={config.negativePrompt || ''}
                  onChange={e => handleChange('negativePrompt', e.target.value)}
                  placeholder={t.negativePromptPlaceholder}
                  dir="ltr"
                />
              </div>

              {/* --- Color Palette --- */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" /> {t.colorPaletteLabel}
                </label>
                <p className="text-[10px] text-slate-500">{t.colorPaletteHelp}</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    ['#FF6B6B','#4ECDC4','#45B7D1'],
                    ['#C0392B','#2C3E50','#F39C12'],
                    ['#8B4513','#228B22','#DAA520'],
                    ['#9B59B6','#E74C3C','#1ABC9C'],
                    ['#2C3E50','#ECF0F1','#E74C3C'],
                  ].map((palette, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChange('colorPalette', palette)}
                      className="flex items-center gap-1 p-1 rounded-lg border border-slate-700 hover:border-indigo-500 transition-all bg-slate-800"
                      title={palette.join(', ')}
                    >
                      {palette.map(c => (
                        <span key={c} style={{ background: c }} className="w-4 h-4 rounded-full inline-block" />
                      ))}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  value={(config.colorPalette || []).join(', ')}
                  onChange={e => handleChange('colorPalette', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder={t.colorPalettePlaceholder}
                  dir="ltr"
                />
              </div>

              {/* --- Scene Mood --- */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" /> {t.sceneMoodLabel}
                </label>
                <p className="text-[10px] text-slate-500">{t.sceneMoodHelp}</p>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  value={config.sceneMood || ''}
                  onChange={e => handleChange('sceneMood', e.target.value)}
                >
                  <option value="">— {lang === 'he' ? 'ללא הגדרה' : 'No mood set'} —</option>
                  {(['mood_epic','mood_tense','mood_warm','mood_dark','mood_romantic','mood_funny','mood_melancholy','mood_inspiring'] as const).map(k => (
                    <option key={k} value={(t as any)[k]}>{(t as any)[k]}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* --- Aspect Ratio Visual Selector --- */}
        <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                <MonitorPlay className="w-4 h-4" /> {t.ratioLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: '16:9' as const, icon: MonitorPlay, label: lang === 'he' ? 'לרוחב' : 'Landscape', sub: '16:9' },
                { value: '9:16' as const, icon: Smartphone,   label: lang === 'he' ? 'לאורך' : 'Portrait',  sub: '9:16' },
                { value: '1:1' as const,  icon: Square,         label: 'Instagram',                           sub: '1:1'  },
                { value: '4:5' as const,  icon: RectangleVertical, label: 'Instagram+',                      sub: '4:5'  },
              ] as { value: '16:9'|'9:16'|'1:1'|'4:5', icon: React.ComponentType<{className?:string}>, label: string, sub: string }[]).map(r => {
                const Icon = r.icon;
                const active = config.aspectRatio === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleChange('aspectRatio', r.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      active
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div className="text-left rtl:text-right">
                      <span className="block text-xs font-bold">{r.label}</span>
                      <span className="block text-[10px] opacity-60">{r.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
        </div>

      </div>
      </div>
      <div className="px-4 pb-4 pt-3 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex-shrink-0">
        <button
          onClick={onSubmit}
          disabled={isLoading || (!config.topic && !config.conceptImage)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isLoading 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              {t.generatingPlan}
            </>
          ) : (
            <>
              {t.createPlanBtn}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupForm;
