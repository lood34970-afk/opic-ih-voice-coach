const PERSONAL_TOPIC_MAIN_POINTS = Object.freeze({
  'Living with family in an apartment': Object.freeze([
    'The learner lives with his wife and their long-haired Chihuahua, Huchu, in a modern apartment on the 12th floor.',
    'The apartment has four main spaces: a main bedroom, living room, guest room, and dressing room. His wife prefers a clean, modern style.',
    'His favorite room is the main bedroom because it has their bed and Nintendo Switch 2, and he enjoys relaxing and playing games there with his wife.',
    'Their previous home had one fewer room and felt cramped; the current home is larger and makes him feel more relaxed.'
  ]),
  'Watching movies': Object.freeze([
    'He likes action movies and romantic comedies and usually watches them with his wife at a theater near their home.',
    'He recently enjoyed a Spider-Man movie, especially a scene where Spider-Man fully used his heightened senses to fight his enemies.',
    "The action was so impressive that he imagined how exciting it would be to have Spider-Man's abilities."
  ]),
  'Going to parks': Object.freeze([
    'He often visits Hapgang Park and Jeonwolsan Park near his home with his wife.',
    'They usually walk there and sometimes go camping or have a barbecue.',
    "A memorable visit was camping at Hapgang Park with his wife and friends, sitting around a campfire, and making s'mores together."
  ]),
  'Watching performances': Object.freeze([
    'He enjoys live performances, especially rock festivals, and his favorite band is jisokuryClub.',
    'He recently attended the Busan Rock Festival with his wife.',
    "The crowd's energy was memorable because it seemed to make the performers more excited, and he enjoyed sharing that atmosphere with everyone."
  ]),
  'Going to concerts': Object.freeze([
    'He enjoys rock concerts and festivals, and his favorite band is jisokuryClub.',
    'He recently attended the Busan Rock Festival with his wife.',
    "He loved the energy of the audience and felt that their excitement gave the performers even more energy."
  ]),
  'Playing games': Object.freeze([
    'His favorite game is Borderlands. He mainly plays on a PlayStation or Nintendo Switch.',
    'He usually plays alone but sometimes plays two-player or cooperative games with his wife.',
    'He and his wife once spent more than three hours repeatedly trying to defeat a difficult Borderlands boss. Winning was exhausting but gave him a strong sense of accomplishment.'
  ]),
  'Watching TV': Object.freeze([
    'His favorite TV program is the Korean cooking show Please Take Care of My Refrigerator, which he watches with his wife while eating.',
    'He especially enjoys Kim Poong, whose rushed cooking process and unusually funny-looking dishes make him laugh.',
    "The entertaining twist is that guests are often surprised because Kim Poong's food tastes much better than it looks."
  ]),
  'Listening to music': Object.freeze([
    'He mainly listens to alternative rock and modern rock. His favorite band is jisokuryClub.',
    'His favorite song is Peanut Butter Sandwich because its lyrics describe unrequited love in a witty, humorous way.',
    'He used to play clarinet in an orchestra and enjoyed classical music, but he became interested in rock after joining a college band club.'
  ]),
  'Taking care of a pet': Object.freeze([
    'Huchu is a long-haired Chihuahua with a mostly black coat and brown and white markings.',
    'He is sensitive but becomes affectionate when treats are available. An automatic feeder gives him meals while the learner is away.',
    'The learner first met Huchu as a tiny puppy in 2013; he looked almost as small as a baby chick.',
    'Huchu does not seem to enjoy walking much, but he appears to enjoy camping. A peaceful camping trip with the learner and his wife is a happy memory.'
  ]),
  Jogging: Object.freeze([
    'He walks or jogs two or three times a week, usually with his wife at Hapgang Park.',
    'He started after watching a documentary about the health benefits and continued because exercise makes him feel refreshed and supports both physical and mental health.',
    'The trail follows a river and is pleasant for running, but it gets crowded in the evening, so he prefers running early in the morning.'
  ]),
  Walking: Object.freeze([
    'He walks or jogs two or three times a week, usually with his wife at Hapgang Park.',
    'He started after watching a documentary about the health benefits and continued because exercise makes him feel refreshed and supports both physical and mental health.',
    'The riverside trail can get crowded with runners in the evening, so he prefers the quieter early morning.'
  ]),
  'Domestic travel': Object.freeze([
    'He recently traveled to Jeju Island with his wife to participate in a trail-running race.',
    'He enjoyed the beautiful natural scenery and felt refreshed while running.',
    'The most memorable moment was passing a horse farm with horses running nearby, which made him feel as if he were running together with them.'
  ]),
  'Overseas travel': Object.freeze([
    "He recently traveled to Switzerland with his parents, wife, younger sister, and brother-in-law to celebrate his father's retirement.",
    "The six family members hiked near the Matterhorn in Zermatt because hiking in Switzerland was on his father's bucket list.",
    'At first clouds hid the mountain, but they cleared during the hike and revealed the Matterhorn. Sharing that moving moment made the trip unforgettable.'
  ])
});

export function getPersonalMainPoints(topic) {
  return PERSONAL_TOPIC_MAIN_POINTS[String(topic || '').trim()] || [];
}
