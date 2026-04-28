import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from './supabase';

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg: "#F5EFE6", cardBack: "#1A2A1C",
  terracotta: "#C1603A", sage: "#7A9E7E", sand: "#D4B896",
  ink: "#1E1E1E", cream: "#FAF6F0", muted: "#8B7355", gold: "#C9A86C",
};

// ─── PRACTICES DATA ───────────────────────────────────────────────────────────
const ALL_PRACTICES = [
  { id: 1, emoji: "🪴", title: "Tend One Small Thing", subtitle: "Water a plant. Wipe a leaf. Watch it.", duration: "5–10 min", category: "Grounding", color: "#7A9E7E", front_detail: "No green thumb needed. Just presence.", science_title: "Attention Restoration Theory", science: "Caring for living things activates the parasympathetic nervous system — your rest-and-digest mode. Studies show even brief nature contact drops cortisol by up to 21%. Tending something small rewires the brain's reward loop away from productivity anxiety and toward quiet satisfaction. The key variable is not the plant — it's the directed, gentle attention.", how_it_helps: "Gives your mind one simple, beautiful task. No outcome. No metric. No email. Just life quietly doing its thing." },
  { id: 2, emoji: "✍️", title: "Three Sentences", subtitle: "Write three true things from today.", duration: "5 min", category: "Reflection", color: "#C1603A", front_detail: "Not a journal. Not a list. Just three honest sentences.", science_title: "Expressive Writing & Affect Labeling", science: "Dr. James Pennebaker's 30+ years of research at UT Austin found that brief expressive writing reduces rumination, improves immune function, and lowers psychological distress. Naming emotions calms the amygdala by engaging the prefrontal cortex. Three sentences is empirically sufficient.", how_it_helps: "Converts the noise of your day into signal. Creates a felt sense of closure. Gives you back your own story." },
  { id: 3, emoji: "🎵", title: "One Song, Full Attention", subtitle: "Sit. Play one song. Do nothing else.", duration: "3–5 min", category: "Presence", color: "#7B6E8D", front_detail: "No skipping. No scrolling. Just listen like it matters.", science_title: "Default Mode Network Reset", science: "Deep listening to music activates the default mode network — the same region involved in creativity, empathy, daydreaming, and self-understanding. A 2023 study found focused music listening reduces anxiety 65% more than passive background music. Your brain craves intentional sensory input, not ambient noise.", how_it_helps: "Interrupts the mental loop of work. Gives your nervous system a defined container of beauty. One song is a complete experience." },
  { id: 4, emoji: "🌫️", title: "5-5-5 Breath", subtitle: "In for 5. Hold for 5. Out for 5.", duration: "5 min", category: "Calm", color: "#6B8EA6", front_detail: "Do it standing by a window. Feel the shift.", science_title: "Vagal Nerve Stimulation", science: "Box breathing directly stimulates the vagus nerve, shifting from sympathetic (fight/flight) to parasympathetic (calm/restore). Heart rate variability improves measurably after just 5 minutes. This technique is used by Navy SEALs and trauma therapists alike.", how_it_helps: "Physically interrupts the stress response cycle. You cannot cognitively override anxiety — but you can breathe your way through it." },
  { id: 5, emoji: "🖊️", title: "Slow Sketch", subtitle: "Draw one object near you. Slowly.", duration: "10–20 min", category: "Making", color: "#C1603A", front_detail: "A mug. A shoe. A hand. Slow is the point, not the drawing.", science_title: "Flow State & Right-Brain Activation", science: "Betty Edwards' foundational research demonstrates that observational drawing forces a shift from the verbal-analytical left hemisphere to the spatial-intuitive right hemisphere. This produces measurable flow states — complete absorption where time distorts, the inner critic quiets, and self-consciousness dissolves.", how_it_helps: "You don't need talent. Skill is irrelevant. The point is the absorbed attention that comes from truly looking at something for the first time." },
  { id: 6, emoji: "🧂", title: "Cook One New Thing", subtitle: "One ingredient. One technique. No recipe needed.", duration: "15–30 min", category: "Making", color: "#C8825A", front_detail: "Toast spices. Caramelize an onion. Taste constantly.", science_title: "Embodied Creativity & Reward Anticipation", science: "Cooking activates multiple sensory cortices simultaneously — smell, touch, taste, sight, proprioception — creating multisensory integration, a deeply grounding state. The anticipation of eating something you made releases dopamine before you even taste it.", how_it_helps: "Grounds you in your body and senses after a day of abstract, screen-mediated, disembodied work. Produces something real. Something you can eat." },
  { id: 7, emoji: "🚶", title: "The Noticing Walk", subtitle: "Walk 15 min. Find 5 things you've never noticed.", duration: "15 min", category: "Presence", color: "#7A9E7E", front_detail: "Same block, new eyes. That's the entire practice.", science_title: "Novelty-Seeking & Neuroplasticity", science: "A landmark 2019 Stanford study showed that even familiar environments, explored with deliberate perceptual attention, stimulate hippocampal activity associated with memory consolidation and mood regulation. Walking specifically enhances bilateral brain processing.", how_it_helps: "Breaks perceptual habituation. Teaches your nervous system that your ordinary world is genuinely full of interest." },
  { id: 8, emoji: "🌿", title: "Forage Something Beautiful", subtitle: "Find one natural object. Place it where you'll see it.", duration: "10–20 min", category: "Grounding", color: "#6B9E6B", front_detail: "A leaf. A stone. A feather. A genuinely weird stick.", science_title: "Biophilia & Aesthetic Experience", science: "E.O. Wilson's biophilia hypothesis — supported by 40 years of environmental psychology — shows humans have a deep innate bond with natural patterns. Deliberately selecting and handling natural objects activates the somatosensory cortex in ways screen interaction cannot replicate.", how_it_helps: "Creates a physical anchor for your day. Something from outside that you brought inside. A small ritual of attention and curation." },
  { id: 9, emoji: "🎲", title: "Learn One Weird Fact", subtitle: "Pick a rabbit hole. Follow it. No productivity goals.", duration: "15 min", category: "Curiosity", color: "#9B7BB8", front_detail: "Octopus cognition. Medieval bread laws. Whale songs. Anything.", science_title: "Curiosity & Intrinsic Motivation", science: "Dr. Matthias Gruber's research at UC Davis shows curiosity-driven learning activates the dopamine system and hippocampus simultaneously, making information stick 40% better. Following intrinsic curiosity systematically rebuilds the intrinsic motivation that repetitive work environments erode over time.", how_it_helps: "Reminds your brain that it loves learning. That you are more than your job description. That the world is genuinely strange and beautiful." },
  { id: 10, emoji: "🤲", title: "Make Something Ugly", subtitle: "Clay, paper, doodles. No goal of it being good.", duration: "15–30 min", category: "Making", color: "#C1603A", front_detail: "The uglier the better. That is the point entirely.", science_title: "Non-Evaluative Creative Expression", science: "Art therapy research consistently shows that process-focused making significantly reduces activity in the prefrontal cortex — the area responsible for self-judgment and evaluation. The brain enters a state near identical to meditation. Imperfection is the active therapeutic mechanism.", how_it_helps: "Undoes the perfectionism that work relentlessly reinforces. Gives you permission to make something that exists purely for expression." },
  { id: 11, emoji: "☕", title: "Ritual Drink, Full Presence", subtitle: "Make your drink slowly. Drink it with nothing else.", duration: "10 min", category: "Presence", color: "#A0785A", front_detail: "Tea. Coffee. Water. Warm broth. Slow it all down.", science_title: "Mindful Ritual & Sensory Anchoring", science: "Deliberate sensory rituals activate the insula — a brain region central to interoception and self-connection. Research shows that ritualized consumption increases perceived pleasure and presence independent of the substance consumed.", how_it_helps: "Creates a clear transition between work mode and self mode. The ritual signals safety to your nervous system. You are here." },
  { id: 12, emoji: "🌅", title: "Watch the Light Change", subtitle: "Sit by a window. Watch light move for 10 minutes.", duration: "10 min", category: "Calm", color: "#D4945A", front_detail: "Golden hour. Cloud shadows. Anything moving in natural light.", science_title: "Temporal Perception & Awe", science: "Dacher Keltner's awe research at UC Berkeley shows witnessing slow natural phenomena expands perceived time and increases prosocial emotion. This 'perceived time expansion' directly counters the time scarcity that chronic stress creates. You literally experience more time.", how_it_helps: "Resets your relationship with time. Reminds you the world moves at its own pace, completely indifferent to your inbox." },
  { id: 13, emoji: "📖", title: "Read One Poem", subtitle: "Find one poem. Read it twice. Sit with it.", duration: "5–10 min", category: "Reflection", color: "#9B7BB8", front_detail: "You don't need to understand it. Just feel it.", science_title: "Aesthetic Language & Emotional Processing", science: "Reading poetry activates the same brain regions as music and autobiographical memory simultaneously. Its unique combination of linguistic precision and emotional ambiguity invites active meaning-making rather than passive consumption. The brain is forced to slow down and re-read.", how_it_helps: "Exercises your capacity for nuance. Gives language back its texture after a day of functional, transactional words." },
  { id: 14, emoji: "🧘", title: "Body Scan", subtitle: "Lie down. Slowly notice each part of your body.", duration: "10 min", category: "Calm", color: "#6B8EA6", front_detail: "Toes to crown. No fixing. Just noticing what's there.", science_title: "Interoceptive Awareness & Stress Regulation", science: "Jon Kabat-Zinn's MBSR protocol, studied across hundreds of clinical trials, shows body scanning reduces cortisol, improves sleep quality, and significantly lowers anxiety scores. Interoceptive awareness is one of the strongest predictors of emotional regulation ability.", how_it_helps: "Reconnects you to your physical self after a day spent entirely in your head. Your body has been carrying the day. This is how you check in." },
  { id: 15, emoji: "🌱", title: "Plant a Seed", subtitle: "Any seed. Any pot. Any dirt. Watch over days.", duration: "15 min", category: "Grounding", color: "#7A9E7E", front_detail: "The waiting is the practice. Not the growing.", science_title: "Anticipatory Joy & Soil Microbiome", science: "Anticipated positive events activate the ventral striatum as powerfully as the event itself. Mycobacterium vaccae in soil triggers serotonin production when absorbed through skin. Gardening is biochemically antidepressant.", how_it_helps: "Gives you something living to look forward to that isn't a deadline or a deliverable. A commitment to something that grows in its own time." },
  { id: 16, emoji: "🎨", title: "Color Something", subtitle: "A coloring page. Print one for free. Just color.", duration: "15–20 min", category: "Making", color: "#E8845A", front_detail: "Choose colors instinctively. Don't plan. Don't think.", science_title: "Repetitive Fine Motor & Relaxation Response", science: "Coloring reduces amygdala activity and activates the frontal lobe in patterns associated with focused calm. The repetitive, spatially-contained hand movement triggers the relaxation response in a mechanism near identical to meditation.", how_it_helps: "A structured creative act that requires just enough focus to quiet mental noise, but not so much that it becomes effortful." },
  { id: 17, emoji: "🌊", title: "Cold Water on Your Face", subtitle: "Splash cold water on your face. Slowly. Three times.", duration: "2 min", category: "Calm", color: "#6B8EA6", front_detail: "Stand at the sink. Be completely, stupidly present.", science_title: "Mammalian Dive Reflex & Vagal Activation", science: "Cold water on the face activates the mammalian dive reflex — a deeply conserved evolutionary response that immediately slows heart rate and activates the vagus nerve. Heart rate drops 10–25% within seconds. Used in DBT for acute emotional dysregulation.", how_it_helps: "An instant, tool-free physiological reset. The simplest possible intervention. Just water and a sink." },
  { id: 18, emoji: "🎭", title: "Talk to a Stranger", subtitle: "A neighbor, shopkeeper, or someone at a cafe.", duration: "10–15 min", category: "Connection", color: "#C1603A", front_detail: "Not networking. Not catching up. Just actual talking.", science_title: "Weak Ties & Subjective Wellbeing", science: "UBC researchers found that brief positive interactions with 'weak ties' — acquaintances, service workers, strangers — increase daily wellbeing as much as interactions with close friends. Belonging is not reserved for intimacy.", how_it_helps: "Breaks the social tunnel vision of work relationships. Reminds you the world is full of people who are not your colleagues." },
  { id: 19, emoji: "🌙", title: "Gratitude Without a List", subtitle: "Think of one specific moment from today. Hold it.", duration: "5 min", category: "Reflection", color: "#9B7BB8", front_detail: "Not gratitude in general. One very specific thing.", science_title: "Specificity & Positive Affect Durability", science: "Dr. Martin Seligman's positive psychology research shows specificity is the crucial variable in gratitude's effectiveness. Vague gratitude habituates rapidly. Specific gratitude reactivates episodic memory and prolongs positive affect significantly longer.", how_it_helps: "Finds the real good without bypassing the hard. Anchors attention in what actually happened today, not an abstraction." },
  { id: 20, emoji: "🏺", title: "Rearrange One Shelf", subtitle: "One shelf. Move things. See what it becomes.", duration: "10–15 min", category: "Making", color: "#A0785A", front_detail: "This is curation. You are the editor of your own space.", science_title: "Environmental Mastery & Agency Restoration", science: "Research on environmental mastery shows that making small, intentional changes to your physical environment restores a sense of agency and competence. This directly counteracts learned helplessness, a common psychological cost of overstructured work environments.", how_it_helps: "You made a decision. It had no meeting. No approval. The result is immediately visible. That is its own category of satisfaction." },
  { id: 21, emoji: "🦋", title: "Sit Outside for 10 Minutes", subtitle: "No phone. No agenda. Just outside.", duration: "10 min", category: "Presence", color: "#7A9E7E", front_detail: "Morning, noon, or evening. All equally restorative.", science_title: "Green Micro-Doses & Cortisol", science: "A 2019 Frontiers in Psychology study found that just 20 minutes in nature significantly reduces cortisol and amygdala activity. Even 10 minutes of purposeful outdoor sitting produces measurable changes in physiological stress markers. Urban nature counts.", how_it_helps: "Your nervous system knows it's outside. You don't have to do anything. Just be there. That's enough." },
  { id: 22, emoji: "🎸", title: "Hum or Sing Something", subtitle: "Shower, kitchen, car. Make sound. Any sound.", duration: "5–10 min", category: "Making", color: "#7B6E8D", front_detail: "Not performing. Not recording. Just making sound.", science_title: "Vocal Resonance & Vagal Tone", science: "Humming and singing create internal vibrations that directly stimulate the vagus nerve through laryngeal resonance. Research shows singing raises oxytocin, reduces cortisol, and improves mood — with zero dependence on musical skill or an audience.", how_it_helps: "Your body was built to make sound. This is not a performance. It is physiological self-regulation that also happens to be joyful." },
  { id: 23, emoji: "📷", title: "One Intentional Photo", subtitle: "Find one beautiful thing. Photograph it carefully.", duration: "10–15 min", category: "Presence", color: "#C8825A", front_detail: "Not for anyone. One image. Made carefully. What did you actually look at?", science_title: "Savoring & Positive Memory Encoding", science: "Fred Bryant's savoring research shows that deliberately attending to positive experiences significantly increases their mood impact and long-term memory consolidation. Photography extends the savoring window far beyond what unaided attention typically sustains.", how_it_helps: "Slows you down enough to actually see something. Not document it. Not post it. Actually see it." },
  { id: 24, emoji: "🧩", title: "Work an Analog Puzzle", subtitle: "Crossword, jigsaw, wood puzzle. Hands on something real.", duration: "15–30 min", category: "Curiosity", color: "#9B7BB8", front_detail: "The kind that doesn't send you notifications.", science_title: "Fluid Intelligence & Structured Leisure", science: "Analog puzzles engage visuospatial reasoning and working memory while completely blocking digital interruption. Research on structured leisure shows they restore cognitive resources more effectively than passive rest or unstructured screen time.", how_it_helps: "Gives your mind a challenge that doesn't involve another person's expectations or your professional identity." },
  { id: 25, emoji: "🕯️", title: "Light a Candle, Sit in It", subtitle: "One candle. No other lights. Sit in it for 10 minutes.", duration: "10 min", category: "Calm", color: "#D4945A", front_detail: "No other lights. Just the flame. Be with the flame.", science_title: "Firelight & Ancestral Safety Signals", science: "Evolutionary psychology research shows that humans across all cultures exhibit reduced blood pressure, respiratory rate, and heightened prosocial calm in the presence of firelight. Candlelight mimics the ancestral campfire — a deeply encoded signal that the day is done and you are safe.", how_it_helps: "Tells your nervous system: the day is over. You survived it. You are safe now." },
  { id: 26, emoji: "🗣️", title: "Voice Memo to Yourself", subtitle: "Record 3 minutes of honest thoughts. Don't listen back.", duration: "5 min", category: "Reflection", color: "#C1603A", front_detail: "Like thinking out loud, but slightly slower and more honest.", science_title: "Verbal Processing & Narrative Closure", science: "Speaking about experiences simultaneously activates Broca's area and engages the hippocampus in narrative formation — the process of making events into story. This verbal processing creates psychological closure more effectively than rumination, which loops without resolution.", how_it_helps: "Sometimes you just need to say it. Not to anyone in particular. Just to say it out loud and let it leave." },
  { id: 27, emoji: "🌾", title: "Stretch One Tight Place", subtitle: "Find where you're holding tension. Stay there 2 minutes.", duration: "5–10 min", category: "Grounding", color: "#7A9E7E", front_detail: "Neck. Shoulders. Jaw. Hips. You know where.", science_title: "Proprioception & Somatic Tension Release", science: "Prolonged static stretching activates Golgi tendon organs, triggering autogenic inhibition — a protective spinal reflex that compels muscular release. Directing interoceptive attention to the sensation simultaneously interrupts cortical rumination loops.", how_it_helps: "You have been clenching all day without knowing it. This is how you find where, and how you let it go." },
  { id: 28, emoji: "🍃", title: "Make One Thing Beautiful", subtitle: "Arrange flowers, fruit, or objects for no reason.", duration: "10–15 min", category: "Making", color: "#6B9E6B", front_detail: "A table, a windowsill, a desk. Just for you. No audience.", science_title: "Aesthetic Agency & Orbitofrontal Activation", science: "Creating visual beauty activates the orbitofrontal cortex — the brain region associated with reward valuation and aesthetic experience. Deliberate aesthetic arrangement produces stronger and longer-lasting wellbeing effects than passive aesthetic consumption.", how_it_helps: "You made something beautiful that no one asked for and no one may ever see. That is its own complete category of satisfaction." },
  { id: 29, emoji: "📝", title: "Write a Letter You Won't Send", subtitle: "To anyone. From anywhere honest inside you.", duration: "15–20 min", category: "Reflection", color: "#9B7BB8", front_detail: "Past you. Future you. Someone you miss. Someone you've forgiven.", science_title: "Unsent Letter Technique & Emotional Completion", science: "Psychotherapy research shows unsent letter techniques process unresolved emotion more effectively than direct conversation. The removal of social consequence creates radical permission for honesty and emotional completion.", how_it_helps: "Completes conversations you couldn't finish. Frees up emotional working memory that was quietly still holding them open." },
  { id: 30, emoji: "🧺", title: "Do One Chore Meditatively", subtitle: "Fold laundry. Wash dishes. Sweep. Fully slowly.", duration: "10–20 min", category: "Presence", color: "#A0785A", front_detail: "The goal is not clean. The goal is full, unhurried attention.", science_title: "Mindful Task Engagement & Flow Induction", science: "A 2015 Florida State University study found that dishwashing mindfully — attending to warmth, smell, sound, and texture — reduced nervousness by 27% and increased mental inspiration significantly. Repetitive physical tasks with low cognitive load are natural containers for present-moment absorption.", how_it_helps: "Finds the contemplative in the ordinary. The boring chore becomes the practice. The house gets clean as a side effect." },
  { id: 31, emoji: "🌍", title: "Learn 5 Words in Another Language", subtitle: "Any language. Say them aloud. Learn them for no reason.", duration: "10 min", category: "Curiosity", color: "#6B8EA6", front_detail: "Not for travel. Not for a reason. Just for the beauty of it.", science_title: "Language Learning & Cognitive Flexibility", science: "Even minimal second-language exposure activates the anterior cingulate cortex and dorsolateral prefrontal cortex — regions associated with cognitive flexibility, error monitoring, and executive control. Novel phonemes literally force the brain out of its habitual processing pathways.", how_it_helps: "Opens a door to a world that thinks differently. Reminds you that meaning is constructed, not fixed." },
  { id: 32, emoji: "🧦", title: "Disrupt One Small Habit", subtitle: "Different route. Non-dominant hand. Change one small thing.", duration: "5 min", category: "Curiosity", color: "#9B7BB8", front_detail: "Tiny disruption. Surprisingly large signal to the brain.", science_title: "Behavioral Flexibility & Cortical Re-engagement", science: "Disrupting automatized behaviors forces the prefrontal cortex back online — out of autopilot and into active engagement. Research shows even tiny variations in daily routine measurably increase attentional engagement and novelty processing throughout the day.", how_it_helps: "Wakes up the part of you that stopped noticing. Reminds your brain that anything — even the familiar — can become interesting." },
  { id: 33, emoji: "🌬️", title: "Open a Window, Just Breathe", subtitle: "Open a window. Stand in front of it. Breathe.", duration: "5 min", category: "Calm", color: "#6B8EA6", front_detail: "Outside air. Outside sounds. Outside light. Just stand there.", science_title: "Olfactory-Limbic Pathway & Air Quality", science: "Fresh air contains phytoncides, negative ions, and varied olfactory compounds that activate the limbic system directly through the olfactory bulb — the only sensory system with a direct pathway to the emotional brain. Indoor air recirculation correlates with increased fatigue and depressed mood.", how_it_helps: "Changes the literal chemical environment of your brain. Takes less than five minutes. You already have a window." },
  { id: 34, emoji: "🖋️", title: "Copy a Paragraph by Hand", subtitle: "Find a paragraph you love. Transcribe it slowly.", duration: "10 min", category: "Making", color: "#C1603A", front_detail: "A book, a poem, a letter. Copy it word by word. Feel each one.", science_title: "Slow Reading, Haptic Memory & Deep Encoding", science: "Handwriting simultaneously engages visual, motor, and linguistic cortices — a unique multimodal encoding that typing entirely lacks. Research shows handwritten content is retained with significantly greater depth and personal resonance. The physical act of inscription changes your relationship to the words.", how_it_helps: "Slows you down to the speed of meaning. You feel every word differently when your hand traces it." },
  { id: 35, emoji: "🦉", title: "Watch Something Small & Wild", subtitle: "A bird. An ant. A bee. Follow it with full attention.", duration: "10–15 min", category: "Presence", color: "#7A9E7E", front_detail: "From outside or a window. Just watch one thing, fully.", science_title: "Focused Attention & Micro-Awe", science: "Research on micro-awe by Keltner and colleagues shows that careful, sustained attention to small natural events activates the same awe circuitry as grand experiences. Five or more minutes of focused attention on non-human life measurably improves mood and reduces self-referential thinking.", how_it_helps: "Something is fully alive out there, completely absorbed in its own existence, with no awareness of you at all. That is a profound kind of perspective." },
  { id: 36, emoji: "🧁", title: "Make Someone Something", subtitle: "Bake, write, draw, make anything small. Give it away.", duration: "20–30 min", category: "Connection", color: "#E8845A", front_detail: "It doesn't have to be good. It does have to be real.", science_title: "Prosocial Creativity & Helper's High", science: "Giving activates the mesolimbic dopamine system — the brain's core reward pathway — producing what researchers call helper's high. Creative production combined with giving creates a compound wellbeing effect documented to be greater than either act alone.", how_it_helps: "Breaks the gravitational pull of self-focus. Makes something that exists entirely for someone else. That is a complete act." },
  { id: 37, emoji: "🎪", title: "Watch a Craft Video, Fully", subtitle: "Glassblowing. Woodworking. Paper marbling. Watch it all.", duration: "10–15 min", category: "Curiosity", color: "#A0785A", front_detail: "No skipping to the good part. The whole process is the point.", science_title: "Vicarious Flow & Mirror Neuron Activation", science: "Observing skilled craft activates mirror neuron networks associated with the motor patterns of the craft — producing a vicarious flow state. Focused craft observation reduces anxiety and increases creative self-efficacy, the belief that you yourself are capable of making things.", how_it_helps: "Reminds you that humans are capable of extraordinary patience and skill. That things that take time are the most beautiful things." },
  { id: 38, emoji: "🌒", title: "Moon or Star Check", subtitle: "Step outside at night. Look up. Five minutes.", duration: "5 min", category: "Calm", color: "#2C4A30", front_detail: "No star-identification app. No facts. Just looking.", science_title: "Cosmic Awe & Self-Transcendence", science: "Keltner's awe research identifies vast stimuli — phenomena that dwarf human scale — as the most potent triggers of self-transcendence, a state associated with reduced anxiety, increased generosity, expanded time perception, and reduced default self-referential network activity.", how_it_helps: "Nothing recalibrates perspective like the actual sky at actual night. Your problems don't become small — you just become proportionately larger." },
  { id: 39, emoji: "🧃", title: "Drink Water, Consciously", subtitle: "One full glass. Slowly. One sip at a time.", duration: "5 min", category: "Grounding", color: "#7A9E7E", front_detail: "You are probably dehydrated. This is genuinely medicinal.", science_title: "Dehydration, Cognition & Interoception", science: "Mild dehydration of just 1–2% of body water impairs mood, attention, and working memory more significantly than most cognitive interventions can compensate for. Drinking water slowly while attending to the sensation activates interoceptive awareness pathways simultaneously.", how_it_helps: "Radically simple. Profoundly underrated. Your brain is 73% water. It has been asking for this all afternoon." },
  { id: 40, emoji: "🗺️", title: "Plan a Tiny Future Adventure", subtitle: "Somewhere 30 minutes away. Plan it like it matters.", duration: "10 min", category: "Curiosity", color: "#9B7BB8", front_detail: "A park you've never entered. A cafe. A bookshop. A viewpoint.", science_title: "Anticipatory Positive Affect & Future Self", science: "Research shows that anticipated experiential events generate wellbeing equivalent to the experience itself. Having even a small near-term positive event to anticipate reduces depressive symptoms and increases daily energy and motivation.", how_it_helps: "Gives your future self a gift. Makes your life feel meaningfully larger than it did this morning." },
  { id: 41, emoji: "🧲", title: "Organize One Small Drawer", subtitle: "One drawer. Empty it. Only put back what earns its place.", duration: "15 min", category: "Making", color: "#A0785A", front_detail: "This is editing. Curation. Not cleaning.", science_title: "Environmental Complexity & Cognitive Load", science: "Cluttered environments increase cortisol and sustained cognitive load. Research by neuroscientists at Princeton shows visual clutter directly competes for neural resources with focused thought, even when we're not conscious of it.", how_it_helps: "Creates a small area of order. Demonstrates that you have the power to make your environment reflect your intentions." },
  { id: 42, emoji: "🎋", title: "Sit in Silence for 10 Minutes", subtitle: "No music. No podcast. No background anything.", duration: "10 min", category: "Calm", color: "#6B8EA6", front_detail: "Find the quietest place you have. Sit there. Do nothing.", science_title: "Default Mode Network & Restorative Silence", science: "A 2013 study found that two hours of silence generated new neurons in the hippocampus — the brain region associated with memory, learning, and emotional integration. In an age of constant auditory input, silence is a genuinely scarce and potent restorative resource.", how_it_helps: "Stops the input. Creates space for integration. Lets your mind wander into its own interior rather than someone else's content." },
  { id: 43, emoji: "💌", title: "Write to Your Past Self", subtitle: "Write a letter to you from five years ago.", duration: "15 min", category: "Reflection", color: "#9B7BB8", front_detail: "What would you have needed to hear? Say it.", science_title: "Self-Compassion & Temporal Self-Appraisal", science: "Kristin Neff's self-compassion research shows that writing to a past self activates self-compassion circuits — the same neural systems involved in compassion toward others. Temporal self-appraisal reduces self-criticism and increases psychological resilience.", how_it_helps: "Generates compassion for the person who didn't yet know what you now know. That compassion often transfers, unexpectedly, to the present." },
  { id: 44, emoji: "🌺", title: "Smell Something Beautiful", subtitle: "Flowers, coffee, rain, bread, citrus peel. Just smell.", duration: "5 min", category: "Presence", color: "#E8845A", front_detail: "Slowly. Intentionally. More than once.", science_title: "Olfaction, Emotion & Memory", science: "The olfactory system is the only sensory system with a direct anatomical connection to the amygdala and hippocampus — bypassing the thalamic relay used by all other senses. This makes smell uniquely powerful for emotional memory, mood regulation, and rapid nervous system state change.", how_it_helps: "One of the fastest known routes to a different emotional state. Takes no time. Requires no equipment. You have a nose." },
  { id: 45, emoji: "🧵", title: "Work with Your Hands on Something Tiny", subtitle: "Knot, braid, stitch, fold. Small and precise.", duration: "15–20 min", category: "Making", color: "#C1603A", front_detail: "Precision is meditative. Small scale creates calm.", science_title: "Fine Motor Control & Focused Attention", science: "Precise fine motor tasks activate the cerebellum and motor cortex in patterns associated with focused, calm states. The specificity of scale — working small — narrows attentional bandwidth and naturally excludes extraneous thought. This is the neurological basis of crafts like sewing and origami as stress reduction.", how_it_helps: "The smaller the scale of making, the larger the sense of absorbed presence. Your whole mind fits inside something tiny." },
  { id: 46, emoji: "🌊", title: "Listen to Water", subtitle: "Running tap, rain, a stream, ocean sounds. Just listen.", duration: "10 min", category: "Calm", color: "#6B8EA6", front_detail: "Close your eyes. Let it be the only thing.", science_title: "Pink Noise, 1/f Patterns & Neural Synchrony", science: "Water sounds exhibit 1/f (pink noise) frequency patterns — the same statistical structure found in neural oscillations during restful states. Research shows exposure to 1/f noise synchronizes brain waves, reduces sympathetic nervous system activity, and promotes relaxed alertness.", how_it_helps: "Your brain literally resonates with water. This is not metaphor. It is neuroscience." },
  { id: 47, emoji: "🖼️", title: "Spend Time with One Artwork", subtitle: "Find one painting, photo, or sculpture. Really look.", duration: "10–15 min", category: "Presence", color: "#9B7BB8", front_detail: "Online, in a book, on a wall. One piece. Ten minutes.", science_title: "Slow Looking & Visual Contemplation", science: "Harvard art educator Philip Yenawine's research shows that sustained looking at a single artwork — even for ten minutes — develops tolerance for ambiguity, deepens observational skills, and generates genuine aesthetic emotion that brief viewing does not.", how_it_helps: "Teaches you to stay with something. To look longer than is comfortable. To let meaning emerge rather than be grabbed." },
  { id: 48, emoji: "🌿", title: "Make Herbal Tea from Scratch", subtitle: "Dried herbs, hot water. Go slowly. Notice everything.", duration: "10–15 min", category: "Making", color: "#7A9E7E", front_detail: "Chamomile, mint, ginger, lavender. Whatever you have.", science_title: "Phytochemistry, Ritual & Embodied Presence", science: "Several common culinary herbs contain compounds with documented anxiolytic effects — apigenin in chamomile, linalool in lavender, rosmarinic acid in lemon balm. Combined with slow preparation ritual and olfactory activation from steeping, the multi-pathway effect is significant.", how_it_helps: "Chemistry and ceremony in one cup. You made medicine with your hands. Slowly. On purpose." },
  { id: 49, emoji: "🧸", title: "Do Something Playful and Pointless", subtitle: "Blow bubbles. Skip. Make a paper airplane. Play.", duration: "10 min", category: "Presence", color: "#E8845A", front_detail: "Deliberately, unabashedly, unproductively pointless.", science_title: "Adult Play & Prefrontal Deactivation", science: "Stuart Brown's play research shows that adult play — activity done for its own sake with no outcome attached — produces prefrontal deactivation patterns associated with children at play. Play is not frivolous; it is a primary mechanism for neural flexibility, creativity, and resilience maintenance in adults.", how_it_helps: "You forgot that you are allowed to be ridiculous. This is the reminder. You are still allowed." },
  { id: 50, emoji: "📻", title: "Listen to Radio from Somewhere Else", subtitle: "Pick a city. Find their local radio. Listen.", duration: "15 min", category: "Curiosity", color: "#7B6E8D", front_detail: "Tokyo jazz. Nairobi news. Icelandic pop. Anywhere else.", science_title: "Vicarious Travel & Perspective Expansion", science: "Exposure to unfamiliar cultural contexts — even passively — activates perspective-taking neural networks and temporarily disrupts the egocentric processing that chronic stress and habitual routine entrench. Even simulated distance from your immediate context improves creative thinking.", how_it_helps: "Someone is having a completely different Tuesday on the other side of the planet right now. That is worth a few minutes of your attention." },
  { id: 51, emoji: "🏔️", title: "Look at Something Far Away", subtitle: "Out a window or outside. Let your eyes rest on distance.", duration: "5 min", category: "Calm", color: "#6B8EA6", front_detail: "No screens. No near objects. Just distance.", science_title: "Ciliary Muscle Rest & Nervous System State", science: "Extended close-focus work chronically contracts the ciliary muscles of the eye and correlates with increased sympathetic nervous system activation. Focusing on distant objects — ideally 20 or more feet away — releases ciliary tension and is associated with a measurable shift toward parasympathetic states.", how_it_helps: "Your eyes have been straining to see things that are very close and very urgent. The horizon is neither. Let them rest." },
  { id: 52, emoji: "🌀", title: "Doodle for 15 Minutes", subtitle: "No subject, no plan. Let the pen go where it wants.", duration: "15 min", category: "Making", color: "#9B7BB8", front_detail: "Patterns, spirals, shapes. Nothing has to mean anything.", science_title: "Unstructured Drawing & Default Mode Activation", science: "Unlike observational drawing, purposeless doodling activates the default mode network — the brain's creative, self-referential, meaning-making system. Research showed that doodling during a task improved recall by 29%, suggesting it maintains optimal arousal rather than indicating inattention.", how_it_helps: "Lets the hand think. Lets meaning emerge from motion rather than from intention. The most democratic creative act there is." },
  { id: 53, emoji: "🌾", title: "Walk Barefoot on Grass", subtitle: "Find some grass. Remove your shoes. Just stand.", duration: "10 min", category: "Grounding", color: "#7A9E7E", front_detail: "Or sand, or soil. Direct contact. Just stand.", science_title: "Earthing & Somatic Grounding", science: "The proprioceptive and interoceptive stimulation of barefoot standing on irregular natural surfaces is well-documented to reduce cortisol. Emerging earthing research suggests direct skin contact with the Earth's surface may facilitate additional anti-inflammatory benefits.", how_it_helps: "Your feet have been inside shoes inside buildings for most of your life. The earth is still there. It remembers you." },
  { id: 54, emoji: "🫀", title: "Check in With Your Body", subtitle: "Pause. What is your body actually feeling right now?", duration: "5 min", category: "Grounding", color: "#C1603A", front_detail: "Temperature. Tension. Hunger. Weight. Tiredness. Breath.", science_title: "Interoception & Emotional Regulation", science: "Interoceptive accuracy — the ability to perceive internal body signals — is one of the strongest predictors of emotional regulation, empathy, and subjective wellbeing. Most adults operating under chronic stress have severely reduced interoceptive awareness, having learned to ignore the body to maintain productivity.", how_it_helps: "Your body has been sending signals all day. This is five minutes of actually listening to them before the day ends." },
  { id: 55, emoji: "🎯", title: "Practice Something for 15 Min", subtitle: "Anything with a skill curve. Just practice.", duration: "15 min", category: "Making", color: "#C8825A", front_detail: "Juggling. Card tricks. A chord. Anything learnable.", science_title: "Deliberate Practice & Intrinsic Reward", science: "Anders Ericsson's deliberate practice research shows that focused, feedback-rich practice in any domain activates intrinsic reward circuits independent of external validation. The experience of getting marginally better at anything is neurologically reinforcing, regardless of the domain.", how_it_helps: "Reminds you that you are capable of growth outside your professional identity. That learning is inherently pleasurable." },
  { id: 56, emoji: "🌻", title: "Put a Flower Somewhere New", subtitle: "One flower. One new place. Just because.", duration: "10 min", category: "Making", color: "#E8845A", front_detail: "Garden, grocery store, a field, a weed in a crack. It counts.", science_title: "Aesthetic Placement & Environmental Enrichment", science: "Research on environmental enrichment shows the deliberate introduction of novel, beautiful stimuli into an environment produces sustained positive effects on mood, attention, and creative capacity. The act of placement is itself a creative decision that activates aesthetic neural networks.", how_it_helps: "You changed the room. You put beauty somewhere it wasn't. That is a small act of making the world slightly more like it should be." },
  { id: 57, emoji: "🎻", title: "Sit with Unfamiliar Music", subtitle: "Something you'd never choose. Just sit with it.", duration: "15 min", category: "Curiosity", color: "#7B6E8D", front_detail: "Classical, folk, jazz, gnawa, gamelan. Anywhere but your usual.", science_title: "Aesthetic Challenge & Openness to Experience", science: "Research shows that deliberately engaging with unfamiliar musical styles exercises the openness to experience dimension of personality, which is strongly correlated with creativity, wellbeing, and cognitive flexibility. The initial confusion is the practice.", how_it_helps: "Exercises the part of you that can hold 'I don't understand this yet' without closing the door. That capacity matters far beyond music." },
  { id: 58, emoji: "🧁", title: "Make a Playlist for a Feeling", subtitle: "Name the feeling first. Then find every song for it.", duration: "15 min", category: "Curiosity", color: "#7B6E8D", front_detail: "The curation is the practice. Not just the listening.", science_title: "Music Selection as Metacognition", science: "Intentional music selection for a target emotional state requires identifying your current affect, imagining the desired state, and bridging between them through sonic memory. This is emotional regulation through metacognitive musical curation — a remarkably sophisticated act.", how_it_helps: "You are becoming your own emotional musicologist. The playlist is a map of where you want to go." },
  { id: 59, emoji: "📞", title: "Call a Friend with No Agenda", subtitle: "Just to hear their voice. Nothing to catch up on.", duration: "15–20 min", category: "Connection", color: "#C1603A", front_detail: "Not a plan. Not a problem to solve. Just a voice.", science_title: "Social Connection & Longevity", science: "Social connection is the single strongest predictor of longevity across all major population studies. Unexpected positive contact — calling without being called — is weighted more heavily by recipients than routine contact. Unscheduled warmth registers as genuine care.", how_it_helps: "You both needed this. Neither of you was going to initiate it. You did. That matters more than you know." },
  { id: 60, emoji: "🌅", title: "Dance Alone in Your Kitchen", subtitle: "One song. No one watching. Let your body lead.", duration: "5 min", category: "Presence", color: "#E8845A", front_detail: "Your kitchen is a dance floor. It always has been.", science_title: "Spontaneous Movement & Bilateral Integration", science: "Spontaneous dance combines rhythmic entrainment, bilateral motor activation, and playful disinhibition — producing simultaneous dopamine, serotonin, and endorphin release. The absence of an audience removes performance anxiety entirely, leaving only the physiological benefits.", how_it_helps: "No one is watching. This is yours. Your body was designed to move to music. Let it remember." },
];

// ─── Date & Shuffle ───────────────────────────────────────────────────────────
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}
function seededShuffle(arr, seed) {
  const a = [...arr]; let s = Math.abs(seed) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 15), s | 1) ^ (s + Math.imul(s ^ (s >>> 7), s | 61))) >>> 0;
    [a[i], a[s % (i + 1)]] = [a[s % (i + 1)], a[i]];
  }
  return a;
}
function getDailySelection(key) { return seededShuffle(ALL_PRACTICES, strHash(key)).slice(0, 12); }

// ─── Supabase Auth & Log Helpers ──────────────────────────────────────────────
function mapUser(u) {
  if (!u) return null;
  return {
    uid: u.id,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
    email: u.email,
    avatar: u.user_metadata?.avatar_url || null,
    provider: u.app_metadata?.provider || 'email',
    createdAt: u.created_at,
  };
}

async function fetchLog(uid) {
  const { data } = await supabase
    .from('practice_logs')
    .select('date_key, entries')
    .eq('user_id', uid);
  if (!data) return {};
  return Object.fromEntries(data.map(r => [r.date_key, r.entries]));
}

async function syncLog(uid, dateKey, entries) {
  await supabase
    .from('practice_logs')
    .upsert(
      { user_id: uid, date_key: dateKey, entries, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date_key' }
    );
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #F5EFE6; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #D4B89666; border-radius: 4px; }
  .modal-flip-wrap { transition: transform .55s cubic-bezier(.23,1,.32,1); transform-style: preserve-3d; position:absolute; inset:0; }
  .modal-flip-wrap.flipped { transform: rotateY(180deg); }
  .modal-face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; border-radius:24px; overflow:hidden; }
  .modal-back-face { transform: rotateY(180deg); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(60px); } to { opacity:1; transform:translateY(0); } }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #FAF6F0 inset !important; -webkit-text-fill-color: #1E1E1E !important; }
`;

// ─── Input Component ──────────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder, error, rightEl }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: P.muted, display: "block", marginBottom: 5 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: rightEl || isPassword ? "11px 42px 11px 14px" : "11px 14px",
            fontFamily: "'Crimson Pro',serif", fontSize: 15, color: P.ink,
            background: P.cream, border: `1.5px solid ${error ? "#C1603A" : P.sand}`,
            borderRadius: 12, outline: "none", transition: "border .2s",
          }}
          onFocus={e => e.target.style.borderColor = P.terracotta}
          onBlur={e => e.target.style.borderColor = error ? "#C1603A" : P.sand}
        />
        {isPassword && (
          <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: P.muted, fontSize: 14, padding: 0 }}>
            {show ? "hide" : "show"}
          </button>
        )}
        {rightEl && !isPassword && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{rightEl}</div>}
      </div>
      {error && <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: P.terracotta, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ─── Auth Button ──────────────────────────────────────────────────────────────
function AuthBtn({ children, onClick, variant = "primary", disabled, style: s = {} }) {
  const base = {
    width: "100%", padding: "13px", borderRadius: 14, fontFamily: "'Crimson Pro',serif",
    fontSize: 16, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", transition: "all .2s", opacity: disabled ? .6 : 1, ...s,
  };
  const variants = {
    primary: { background: P.terracotta, color: "#fff", boxShadow: "0 4px 16px rgba(193,96,58,.3)" },
    outline: { background: "transparent", color: P.ink, border: `1.5px solid ${P.sand}`, boxShadow: "none" },
    google: { background: P.cream, color: P.ink, border: `1.5px solid ${P.sand}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

// ─── ONBOARDING SCREEN ────────────────────────────────────────────────────────
function OnboardingScreen({ onNext }) {
  const [step, setStep] = useState(0);
  const slides = [
    { emoji: "🌿", title: "One small thing.", body: "Every day, a single intentional practice — backed by science, sized for a real life. No equipment. No routine overhaul. Just one thing." },
    { emoji: "🔬", title: "Built on research.", body: "Every practice is rooted in neuroscience and psychology. Flip any card to see the study behind it and exactly why it helps you." },
    { emoji: "📅", title: "Track your journey.", body: "Mark what you do. Watch your calendar fill in. Build a history of intentional living that's yours, across every device." },
  ];
  const s = slides[step];

  return (
    <div style={{ minHeight: "100vh", background: P.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "60px 28px 40px" }}>
      <style>{G}</style>
      <div style={{ textAlign: "center", animation: "fadeUp .5s ease" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: P.terracotta, marginBottom: 48 }}>one thing.</div>
        <div style={{ fontSize: 72, marginBottom: 28, animation: "fadeUp .5s ease" }}>{s.emoji}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: P.ink, margin: "0 0 14px", lineHeight: 1.2 }}>{s.title}</h2>
        <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 17, color: P.muted, lineHeight: 1.65, margin: 0 }}>{s.body}</p>
      </div>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? P.terracotta : P.sand, transition: "all .3s", cursor: "pointer" }} />
          ))}
        </div>
        {step < slides.length - 1
          ? <AuthBtn onClick={() => setStep(s => s + 1)}>Continue</AuthBtn>
          : <AuthBtn onClick={onNext}>Get started</AuthBtn>}
        {step === slides.length - 1 && (
          <button onClick={onNext} style={{ width: "100%", marginTop: 12, background: "transparent", border: "none", fontFamily: "'Crimson Pro',serif", fontSize: 14, color: P.muted, cursor: "pointer", padding: "8px 0" }}>
            I already have an account
          </button>
        )}
      </div>
    </div>
  );
}

// ─── AUTH SCREEN (Sign up / Sign in) ─────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("signup"); // signup | signin | forgot
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Please enter your name";
    if (!email.includes("@")) e.email = "Enter a valid email address";
    if (mode !== "forgot" && password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setErrors({});

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) { setErrors({ email: error.message }); setLoading(false); return; }
      onAuth(mapUser(data.user));
    } else if (mode === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setErrors({ password: "Incorrect email or password" }); setLoading(false); return; }
      onAuth(mapUser(data.user));
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) { setErrors({ email: error.message }); setLoading(false); return; }
      setForgotSent(true);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    // Page will redirect — auth state picked up by onAuthStateChange on return
  };

  if (forgotSent) {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
        <style>{G}</style>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center", animation: "fadeUp .4s ease" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: P.ink, marginBottom: 12 }}>Check your inbox</h2>
          <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 16, color: P.muted, lineHeight: 1.6, marginBottom: 28 }}>
            We've sent a reset link to <strong>{email}</strong>. Follow it to create a new password.
          </p>
          <AuthBtn onClick={() => { setForgotSent(false); setMode("signin"); }}>Back to sign in</AuthBtn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: P.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <style>{G}</style>
      <div style={{ maxWidth: 380, width: "100%", animation: "slideUp .4s ease" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: P.terracotta }}>one thing.</div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: P.muted, fontStyle: "italic" }}>for joy, every day</div>
        </div>

        {/* Card */}
        <div style={{ background: P.cream, borderRadius: 24, border: `1px solid ${P.sand}66`, boxShadow: "0 8px 40px rgba(0,0,0,.08)", padding: "28px 24px 24px" }}>

          {/* Mode tabs */}
          {mode !== "forgot" && (
            <div style={{ display: "flex", background: P.bg, borderRadius: 12, padding: 3, marginBottom: 24 }}>
              {["signup", "signin"].map(m => (
                <button key={m} onClick={() => { setMode(m); setErrors({}); }} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: mode === m ? P.cream : "transparent", color: mode === m ? P.ink : P.muted, fontFamily: "'Crimson Pro',serif", fontSize: 14, fontWeight: mode === m ? "600" : "400", cursor: "pointer", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,.08)" : "none", transition: "all .2s" }}>
                  {m === "signup" ? "Create account" : "Sign in"}
                </button>
              ))}
            </div>
          )}

          {mode === "forgot" && (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => { setMode("signin"); setErrors({}); }} style={{ background: "none", border: "none", color: P.muted, fontFamily: "'Crimson Pro',serif", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12 }}>← Back</button>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: P.ink, margin: "0 0 6px" }}>Reset your password</h3>
              <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, color: P.muted, margin: 0, lineHeight: 1.5 }}>Enter your email and we'll send a reset link.</p>
            </div>
          )}

          {/* Google button */}
          {mode !== "forgot" && (
            <>
              <AuthBtn variant="google" onClick={handleGoogle} disabled={googleLoading}>
                {googleLoading
                  ? <span style={{ fontFamily: "'Crimson Pro',serif", color: P.muted }}>Connecting to Google...</span>
                  : <><GoogleIcon /><span>Continue with Google</span></>}
              </AuthBtn>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
                <div style={{ flex: 1, height: 1, background: P.sand }} />
                <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: P.muted, fontStyle: "italic" }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: P.sand }} />
              </div>
            </>
          )}

          {/* Fields */}
          {mode === "signup" && (
            <Input label="Your name" value={name} onChange={setName} placeholder="How should we greet you?" error={errors.name} />
          )}
          <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
          {mode !== "forgot" && (
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder={mode === "signup" ? "At least 6 characters" : "Your password"} error={errors.password} />
          )}

          {/* Forgot link */}
          {mode === "signin" && (
            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
              <button onClick={() => { setMode("forgot"); setErrors({}); }} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro',serif", fontSize: 13, color: P.muted, cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                Forgot password?
              </button>
            </div>
          )}

          <AuthBtn onClick={handleSubmit} disabled={loading} style={{ marginTop: mode === "forgot" ? 8 : 0 }}>
            {loading ? "Just a moment..." : mode === "signup" ? "Create my account" : mode === "signin" ? "Sign in" : "Send reset link"}
          </AuthBtn>

          {mode === "signup" && (
            <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11.5, color: P.muted, textAlign: "center", marginTop: 14, marginBottom: 0, lineHeight: 1.5 }}>
              By creating an account you agree to our Terms and Privacy Policy. Your data is yours and stays private.
            </p>
          )}
        </div>

        {/* Skip */}
        <button onClick={() => onAuth(null)} style={{ width: "100%", marginTop: 14, background: "transparent", border: "none", fontFamily: "'Crimson Pro',serif", fontSize: 13.5, color: P.muted, cursor: "pointer", padding: "10px 0" }}>
          Continue without an account
        </button>
      </div>
    </div>
  );
}

// ─── ACCOUNT SCREEN ───────────────────────────────────────────────────────────
function AccountScreen({ user, log, onSignOut, onUpdateUser }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const totalDays = Object.keys(log).filter(k => log[k]?.length > 0).length;
  const totalPractices = Object.values(log).flat().length;
  const categories = {};
  Object.values(log).flat().forEach(e => { categories[e.category] = (categories[e.category] || 0) + 1; });
  const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  const initials = (user?.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Today";

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    onUpdateUser({ ...user, name: name.trim() });
    setEditing(false);
    setSaving(false);
  };

  return (
    <div style={{ animation: "fadeUp .3s ease" }}>
      {/* Profile card */}
      <div style={{ background: P.cream, borderRadius: 20, border: `1px solid ${P.sand}55`, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: `linear-gradient(135deg, ${P.terracotta}, #8B3A20)`, padding: "28px 20px 20px", position: "relative" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 24, fontFamily: "'Playfair Display',serif", color: "#fff", fontWeight: 700 }}>
            {initials}
          </div>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "none", fontFamily: "'Crimson Pro',serif", fontSize: 16, background: "rgba(255,255,255,.15)", color: "#fff", outline: "none" }} placeholder="Your name" />
              <button onClick={handleSave} disabled={saving} style={{ background: "rgba(255,255,255,.25)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 14px", fontFamily: "'Crimson Pro',serif", fontSize: 13, cursor: "pointer" }}>{saving ? "..." : "Save"}</button>
              <button onClick={() => { setEditing(false); setName(user?.name || ""); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 18, padding: "4px 6px" }}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{user?.name || "Guest"}</div>
              {user && <button onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,.2)", border: "none", color: "rgba(255,255,255,.8)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontFamily: "'Crimson Pro',serif", cursor: "pointer" }}>Edit</button>}
            </div>
          )}
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 4 }}>
            {user ? user.email : "No account"} {user?.provider === "google" && <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 10, padding: "1px 8px", fontSize: 10, marginLeft: 6 }}>Google</span>}
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11.5, color: P.muted, fontStyle: "italic", marginBottom: 14 }}>Member since {memberSince}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { value: totalDays, label: totalDays === 1 ? "day" : "days" },
              { value: totalPractices, label: "practices" },
              { value: topCat ? topCat[0] : "none", label: "fave category" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", background: P.bg, borderRadius: 12, padding: "12px 8px" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: i === 2 ? 11 : 22, fontWeight: 700, color: P.terracotta, lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: P.muted, fontStyle: "italic", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings rows */}
      {[
        { icon: "🔔", label: "Daily reminder", sub: "Set a time to be nudged", action: "Coming soon" },
        { icon: "📤", label: "Export your data", sub: "Download your full practice history", action: "Export" },
        { icon: "🔒", label: "Change password", sub: user?.provider === "google" ? "Managed by Google" : "Update your password", action: user?.provider === "google" ? null : "Change" },
      ].map((row, i) => (
        <div key={i} style={{ background: P.cream, borderRadius: 14, border: `1px solid ${P.sand}44`, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>{row.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, fontWeight: 600, color: P.ink }}>{row.label}</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11.5, color: P.muted, fontStyle: "italic" }}>{row.sub}</div>
          </div>
          {row.action && <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: P.muted, background: P.bg, borderRadius: 10, padding: "4px 10px" }}>{row.action}</span>}
        </div>
      ))}

      {/* Sign out / Sign in */}
      <div style={{ marginTop: 20 }}>
        {user ? (
          <AuthBtn variant="outline" onClick={onSignOut}>Sign out</AuthBtn>
        ) : (
          <AuthBtn onClick={() => onSignOut("signin")}>Sign in or create account</AuthBtn>
        )}
      </div>

      {user && (
        <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11.5, color: P.muted, textAlign: "center", marginTop: 12, fontStyle: "italic", lineHeight: 1.5 }}>
          Your data is stored locally on this device. Sign in across devices coming soon.
        </p>
      )}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ label, color, size = 9 }) {
  return (
    <span style={{ background: color + "25", color, border: `1px solid ${color}40`, borderRadius: 20, padding: `1px ${size + 2}px`, fontSize: size, fontFamily: "'Crimson Pro',serif", fontStyle: "italic", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── Mini Card ────────────────────────────────────────────────────────────────
function MiniCard({ practice, index, onOpen, done }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), index * 50); return () => clearTimeout(t); }, [index]);
  return (
    <div onClick={() => onOpen(practice)} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)", transition: `opacity .4s ease ${index * .04}s, transform .4s ease ${index * .04}s`, cursor: "pointer", userSelect: "none", borderRadius: 14, background: P.cream, border: `1.5px solid ${practice.color}33`, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: practice.color }} />
      <div style={{ padding: "11px 12px 10px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ marginBottom: 5 }}><Pill label={practice.category} color={practice.color} /></div>
        <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>{practice.emoji}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: P.ink, lineHeight: 1.25, marginBottom: 3 }}>{practice.title}</div>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11.5, color: P.muted, fontStyle: "italic", lineHeight: 1.3, marginBottom: 8 }}>{practice.subtitle}</div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: P.muted }}>⏱ {practice.duration}</span>
          {done ? <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: practice.color }}>✓ done</span> : <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: P.muted, opacity: .5 }}>tap →</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Card Modal ───────────────────────────────────────────────────────────────
function CardModal({ practice, allCards, onClose, onComplete, isDone }) {
  const [flipped, setFlipped] = useState(false);
  const [current, setCurrent] = useState(practice);
  const [anim, setAnim] = useState(null);
  const touchY = useRef(null), touchX = useRef(null);
  const idx = allCards.findIndex(p => p.id === current.id);

  const go = useCallback((dir) => {
    const next = dir === "next" ? allCards[idx + 1] : allCards[idx - 1];
    if (!next) return;
    setAnim(dir);
    setTimeout(() => { setCurrent(next); setFlipped(false); setAnim(null); }, 200);
  }, [idx, allCards]);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); if (e.key === "ArrowUp" || e.key === "ArrowRight") go("next"); if (e.key === "ArrowDown" || e.key === "ArrowLeft") go("prev"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, go]);

  const onTS = e => { touchY.current = e.touches[0].clientY; touchX.current = e.touches[0].clientX; };
  const onTE = e => {
    if (touchY.current === null) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    const dx = Math.abs(touchX.current - e.changedTouches[0].clientX);
    if (Math.abs(dy) > 60 && dx < 80) go(dy > 0 ? "next" : "prev");
    touchY.current = null;
  };

  const done = isDone(current);
  const slideStyle = anim === "next" ? { opacity: 0, transform: "translateY(-30px)" } : anim === "prev" ? { opacity: 0, transform: "translateY(30px)" } : { opacity: 1, transform: "translateY(0)" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(20,18,14,.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div style={{ position: "relative", width: "min(420px, 92vw)", height: "min(600px, 84vh)", ...slideStyle, transition: "opacity .18s, transform .2s" }} onClick={e => e.stopPropagation()} onTouchStart={onTS} onTouchEnd={onTE}>
        <div style={{ position: "absolute", inset: 0, perspective: 1200 }}>
          <div className={`modal-flip-wrap${flipped ? " flipped" : ""}`}>
            {/* FRONT */}
            <div className="modal-face" style={{ background: P.cream, display: "flex", flexDirection: "column" }}>
              <div style={{ height: 5, background: current.color }} />
              <div style={{ background: current.color, padding: "20px 22px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Pill label={current.category} color="rgba(255,255,255,.9)" size={11} />
                  <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: "rgba(255,255,255,.55)" }}>{idx + 1} / {allCards.length}</span>
                </div>
                <div style={{ fontSize: 52, marginTop: 10, marginBottom: 5, lineHeight: 1 }}>{current.emoji}</div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 5px", lineHeight: 1.15 }}>{current.title}</h2>
                <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 15, color: "rgba(255,255,255,.82)", fontStyle: "italic", margin: 0, lineHeight: 1.3 }}>{current.subtitle}</p>
              </div>
              <div style={{ padding: "16px 22px 10px", flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 16, color: P.muted, lineHeight: 1.65, margin: "0 0 10px", flex: 1 }}>{current.front_detail}</p>
                <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: P.muted, opacity: .5 }}>⏱ {current.duration}</div>
              </div>
              <div style={{ padding: "0 22px 18px", display: "flex", gap: 10 }}>
                <button onClick={() => setFlipped(true)} style={{ flex: 1, background: current.color, border: "none", color: "#fff", borderRadius: 22, padding: "12px", fontFamily: "'Crimson Pro',serif", fontSize: 15, cursor: "pointer", fontWeight: 600 }}>The science →</button>
                <button onClick={() => onComplete(current)} style={{ flex: 1, background: done ? "#2C3B2D" : "transparent", border: `2px solid ${done ? "#2C3B2D" : P.sand}`, color: done ? "#fff" : P.muted, borderRadius: 22, padding: "12px", fontFamily: "'Crimson Pro',serif", fontSize: 15, cursor: "pointer", transition: "all .2s" }}>{done ? "✓ Done" : "Mark done"}</button>
              </div>
            </div>
            {/* BACK */}
            <div className="modal-face modal-back-face" style={{ background: P.cardBack, display: "flex", flexDirection: "column" }}>
              <div style={{ height: 5, background: current.color }} />
              <div style={{ padding: "18px 22px 12px", borderBottom: `1px solid ${current.color}22` }}>
                <button onClick={() => setFlipped(false)} style={{ background: "transparent", border: "none", color: current.color, fontFamily: "'Crimson Pro',serif", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 8 }}>← back</button>
                <div style={{ marginBottom: 5 }}><span style={{ background: current.color + "30", color: current.color, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontFamily: "'Crimson Pro',serif", letterSpacing: 1, textTransform: "uppercase" }}>The Science</span></div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#F0E8DA", margin: "5px 0 0", lineHeight: 1.25 }}>{current.science_title}</h3>
              </div>
              <div style={{ padding: "14px 22px", flex: 1, overflow: "auto" }}>
                <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14.5, color: "#C0A880", lineHeight: 1.7, margin: "0 0 16px" }}>{current.science}</p>
                <div style={{ background: current.color + "18", border: `1px solid ${current.color}30`, borderRadius: 12, padding: "13px 15px" }}>
                  <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, fontStyle: "italic", color: current.color, lineHeight: 1.55, margin: 0 }}>💡 {current.how_it_helps}</p>
                </div>
              </div>
              <div style={{ padding: "0 22px 18px" }}>
                <button onClick={() => onComplete(current)} style={{ width: "100%", background: done ? current.color : "transparent", border: `2px solid ${current.color}`, color: done ? "#fff" : current.color, borderRadius: 22, padding: "12px", fontFamily: "'Crimson Pro',serif", fontSize: 15, cursor: "pointer", transition: "all .2s", fontWeight: 600 }}>
                  {done ? "✓ Marked done today" : "Mark as done today"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: -14, right: -14, width: 34, height: 34, borderRadius: "50%", background: P.cream, border: `2px solid ${P.sand}`, color: P.muted, fontSize: 18, lineHeight: "30px", textAlign: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}>×</button>
        {/* Nav dots */}
        <div style={{ position: "absolute", bottom: -44, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {allCards.map((p, i) => <div key={p.id} onClick={() => { setCurrent(allCards[i]); setFlipped(false); }} style={{ width: i === idx ? 14 : 5, height: 5, borderRadius: 3, background: i === idx ? "#fff" : "rgba(255,255,255,.3)", transition: "all .3s", cursor: "pointer" }} />)}
          </div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: "rgba(255,255,255,.35)", fontStyle: "italic" }}>swipe up for next</div>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────
function FeaturedCard({ practice, onOpen, done }) {
  return (
    <div onClick={() => onOpen(practice)} style={{ background: P.cream, borderRadius: 20, border: `1.5px solid ${P.sand}`, boxShadow: "0 6px 28px rgba(193,96,58,.1)", overflow: "hidden", marginBottom: 22, cursor: "pointer" }}>
      <div style={{ background: practice.color, padding: "16px 18px 13px" }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.65)", marginBottom: 3 }}>Today's Practice</div>
        <div style={{ fontSize: 40, marginBottom: 4 }}>{practice.emoji}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 900, color: "#fff", margin: "0 0 3px", lineHeight: 1.2 }}>{practice.title}</h2>
        <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14.5, color: "rgba(255,255,255,.82)", fontStyle: "italic", margin: 0, lineHeight: 1.3 }}>{practice.subtitle}</p>
      </div>
      <div style={{ padding: "13px 18px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, color: P.muted, margin: "0 0 3px", lineHeight: 1.5 }}>{practice.front_detail}</p>
          <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: P.muted, opacity: .6 }}>⏱ {practice.duration}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0, marginLeft: 12 }}>
          <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, color: practice.color, background: practice.color + "15", border: `1px solid ${practice.color}40`, borderRadius: 20, padding: "6px 14px" }}>Open →</span>
          {done && <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: practice.color }}>✓ done today</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ log }) {
  const [cur, setCur] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const { y, m } = cur;
  const todayKey = getTodayKey();
  const monthLabel = new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const dk = d => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const totalDays = Object.keys(log).filter(k => log[k]?.length > 0).length;
  const totalPractices = Object.values(log).flat().length;

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: P.ink, marginBottom: 4 }}>Your Journey</div>
      <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
        {[{ v: totalDays, l: totalDays === 1 ? "day" : "days" }, { v: totalPractices, l: "practices" }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: i === 0 ? P.terracotta : P.sage }}>{s.v}</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: P.muted, fontStyle: "italic" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => setCur(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })} style={{ background: "transparent", border: `1px solid ${P.sand}`, color: P.muted, borderRadius: 20, padding: "4px 13px", fontFamily: "'Crimson Pro',serif", fontSize: 13, cursor: "pointer" }}>←</button>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: P.ink }}>{monthLabel}</span>
        <button onClick={() => setCur(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })} style={{ background: "transparent", border: `1px solid ${P.sand}`, color: P.muted, borderRadius: 20, padding: "4px 13px", fontFamily: "'Crimson Pro',serif", fontSize: 13, cursor: "pointer" }}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: "'Crimson Pro',serif", fontSize: 9.5, color: P.muted, fontStyle: "italic" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 22 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const k = dk(d); const entry = log[k]; const has = entry?.length > 0; const isToday = k === todayKey;
          return (
            <div key={k} style={{ aspectRatio: "1", borderRadius: 7, background: has ? P.terracotta : isToday ? P.sand + "44" : P.cream, border: isToday ? `2px solid ${P.terracotta}` : `1px solid ${P.sand}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, fontWeight: isToday ? "700" : "400", color: has ? "#fff" : isToday ? P.terracotta : P.muted }}>{d}</span>
              {has && <span style={{ fontSize: 8 }}>{entry[0]?.emoji || "✓"}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: P.ink, marginBottom: 10 }}>Completed practices</div>
      {Object.keys(log).filter(k => log[k]?.length > 0).sort((a, b) => b.localeCompare(a)).slice(0, 20).map(k => {
        const entries = log[k];
        const label = new Date(k + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        return (
          <div key={k} style={{ marginBottom: 9, padding: "11px 14px", background: P.cream, borderRadius: 12, border: `1px solid ${P.sand}44` }}>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10.5, color: P.muted, marginBottom: 6, fontStyle: "italic" }}>{label}</div>
            {entries.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: i < entries.length - 1 ? 6 : 0 }}>
                <span style={{ fontSize: 17 }}>{e.emoji}</span>
                <div>
                  <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, fontWeight: 600, color: P.ink, lineHeight: 1.2 }}>{e.title}</div>
                  <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10.5, color: P.muted, fontStyle: "italic" }}>{e.category} · {e.duration}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {totalDays === 0 && <div style={{ textAlign: "center", padding: "24px 0", fontFamily: "'Crimson Pro',serif", fontSize: 14, color: P.muted, fontStyle: "italic" }}>Complete your first practice to begin your log.</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth state: null = not checked, false = guest, object = logged in
  const [authState, setAuthState] = useState("loading"); // "loading" | "onboarding" | "auth" | "app"
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [log, setLog] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Boot: check existing session
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("otj_onboarded");

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = mapUser(session.user);
        setUser(u);
        const l = await fetchLog(u.uid);
        setLog(l);
        setAuthState("app");
      } else if (hasSeenOnboarding) {
        setAuthState("app"); // guest
      } else {
        setAuthState("onboarding");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = mapUser(session.user);
        setUser(u);
        const l = await fetchLog(u.uid);
        setLog(l);
        setAuthState("app");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingDone = () => {
    localStorage.setItem("otj_onboarded", "1");
    setAuthState("auth");
  };

  const handleAuth = async (u) => {
    if (u) {
      setUser(u);
      const l = await fetchLog(u.uid);
      setLog(l);
    } else {
      setUser(null);
      setLog({});
    }
    setAuthState("app");
  };

  const handleSignOut = async (action) => {
    if (action === "signin") {
      setAuthState("auth");
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setLog({});
    setView("home");
    setAuthState("auth");
  };

  const handleUpdateUser = (updated) => {
    setUser(updated);
  };

  const todayKey = getTodayKey();
  const daily = getDailySelection(todayKey);
  const featured = daily[0];
  const alts = daily.slice(1);
  const isDone = useCallback((p) => {
    const tlog = log[todayKey] || [];
    return tlog.some(e => e.id === p.id);
  }, [log, todayKey]);

  const handleComplete = useCallback((practice) => {
    const uid = user?.uid;
    setLog(prev => {
      const cur = prev[todayKey] || [];
      const already = cur.some(e => e.id === practice.id);
      const updated = already
        ? cur.filter(e => e.id !== practice.id)
        : [...cur, { id: practice.id, emoji: practice.emoji, title: practice.title, category: practice.category, duration: practice.duration }];
      const next = { ...prev, [todayKey]: updated };
      if (uid) syncLog(uid, todayKey, updated);
      if (!already) { setToast(`${practice.emoji} Added to your journal`); setTimeout(() => setToast(null), 2600); }
      return next;
    });
  }, [todayKey, user]);

  const openModal = (p, cards) => setModal({ practice: p, cards: cards || daily });

  const totalDays = Object.keys(log).filter(k => log[k]?.length > 0).length;
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const initials = (user?.name || "").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // ── Render gates ────────────────────────────────────────────────────────────
  if (authState === "loading") {
    return <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><style>{G}</style><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: P.terracotta }}>one thing.</div></div>;
  }
  if (authState === "onboarding") return <OnboardingScreen onNext={handleOnboardingDone} />;
  if (authState === "auth") return <AuthScreen onAuth={handleAuth} />;

  // ── Main App ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: P.bg, paddingBottom: 76 }}>
      <style>{G}</style>

      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: P.cardBack, color: "#F0E8DA", borderRadius: 22, padding: "10px 22px", fontFamily: "'Crimson Pro',serif", fontSize: 14, zIndex: 600, boxShadow: "0 4px 20px rgba(0,0,0,.25)", whiteSpace: "nowrap", animation: "fadeUp .3s ease" }}>
          {toast}
        </div>
      )}

      {modal && (
        <CardModal practice={modal.practice} allCards={modal.cards} onClose={() => setModal(null)} onComplete={handleComplete} isDone={isDone} />
      )}

      {/* Header */}
      <div style={{ background: P.cream, borderBottom: `1px solid ${P.sand}55`, padding: "12px 18px 10px", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: P.terracotta, letterSpacing: -0.5 }}>one thing.</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 9.5, color: P.muted, letterSpacing: .5, fontStyle: "italic" }}>for joy, every day</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {totalDays > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: P.terracotta }}>{totalDays}</div>
                <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 9, color: P.muted, fontStyle: "italic" }}>{totalDays === 1 ? "day" : "days"}</div>
              </div>
            )}
            {/* Avatar / sign-in button */}
            <button onClick={() => setView("account")} style={{ width: 36, height: 36, borderRadius: "50%", background: user ? P.terracotta : P.sand + "88", border: `2px solid ${user ? P.terracotta + "55" : P.sand}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {user
                ? <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>{initials || "?"}</span>
                : <span style={{ fontSize: 16 }}>👤</span>}
            </button>
          </div>
        </div>
        {/* Logged in as banner */}
        {user && view !== "account" && (
          <div style={{ maxWidth: 520, margin: "6px auto 0", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.sage, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: P.muted, fontStyle: "italic" }}>Signed in as {user.name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "22px 16px 16px" }}>

        {view === "home" && (
          <>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: P.ink, lineHeight: 1.1 }}>{dayName}</div>
              <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13.5, color: P.muted, fontStyle: "italic" }}>{dateStr} · your daily moment</div>
            </div>
            <FeaturedCard practice={featured} onOpen={(p) => openModal(p, daily)} done={isDone(featured)} />
            <div style={{ marginBottom: 13 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: P.ink, marginBottom: 2 }}>Or pick something else today</div>
              <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: P.muted, margin: "0 0 13px", fontStyle: "italic" }}>Tap any card to open it. Flip inside for the science. Swipe up for the next.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {alts.slice(0, 6).map((p, i) => <MiniCard key={p.id} practice={p} index={i} onOpen={(p) => openModal(p, alts)} done={isDone(p)} />)}
            </div>
          </>
        )}

        {view === "explore" && (
          <>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: P.ink }}>Today's 12</div>
              <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12.5, color: P.muted, margin: "4px 0 0", fontStyle: "italic" }}>Your curated set for {dateStr}. A fresh 12 arrive tomorrow.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {daily.map((p, i) => <MiniCard key={p.id} practice={p} index={i} onOpen={(p) => openModal(p, daily)} done={isDone(p)} />)}
            </div>
          </>
        )}

        {view === "calendar" && <CalendarView log={log} />}

        {view === "account" && (
          <>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: P.ink, marginBottom: 18 }}>Account</div>
            <AccountScreen user={user} log={log} onSignOut={handleSignOut} onUpdateUser={handleUpdateUser} />
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: P.cream, borderTop: `1px solid ${P.sand}77`, zIndex: 200, display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 520, width: "100%", display: "flex" }}>
          {[
            { key: "home", icon: "🏡", label: "Today" },
            { key: "explore", icon: "🗂️", label: "Explore" },
            { key: "calendar", icon: "📅", label: "Journey" },
            { key: "account", icon: user ? null : "👤", label: "Account", avatarInitials: user ? initials : null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setView(tab.key)} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {tab.avatarInitials
                ? <div style={{ width: 22, height: 22, borderRadius: "50%", background: view === tab.key ? P.terracotta : P.muted + "88", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "'Playfair Display',serif", fontSize: 9, fontWeight: 700, color: "#fff" }}>{tab.avatarInitials}</span></div>
                : <span style={{ fontSize: 17 }}>{tab.icon}</span>}
              <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: view === tab.key ? P.terracotta : P.muted, fontWeight: view === tab.key ? "600" : "400" }}>{tab.label}</span>
              {view === tab.key && <div style={{ width: 3, height: 3, borderRadius: 2, background: P.terracotta }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
