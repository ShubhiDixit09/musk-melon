export interface SeedMemory {
  content: string;
  validFrom: string;
  validTo?: string;
  source: string;
  sourceType: 'speech' | 'interview' | 'tweet' | 'document';
  topic: string;
}

export const COMPREHENSIVE_ELON_DATABASE: SeedMemory[] = [
  // === SPACEX & MARS COLONIZATION ===
  {
    content: "Starship full and rapid reusability is the fundamental breakthrough needed to lower the cost per ton to orbit by more than two orders of magnitude and make life multiplanetary on Mars.",
    validFrom: "2024-04-06",
    source: "Starbase All-Hands Address",
    sourceType: "speech",
    topic: "spacex"
  },
  {
    content: "We caught the Super Heavy booster back on the launchpad with the Mechazilla chopstick arms on Flight 5. Science fiction is becoming reality.",
    validFrom: "2024-10-13",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "spacex"
  },
  {
    content: "Raptor 3 engine eliminates all external tubing and secondary plumbing. It is 350 bar chamber pressure, regeneratively cooled, and produces 280 tons of thrust with a dramatically reduced mass.",
    validFrom: "2024-08-03",
    source: "SpaceX Propulsion Architecture Briefing",
    sourceType: "document",
    topic: "spacex"
  },
  {
    content: "Starlink now has over 6,000 active satellites in orbit providing high-speed internet to more than 4 million users globally across 100+ countries, generating cash flow to fund Starship Mars colonization.",
    validFrom: "2024-09-26",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "spacex"
  },
  {
    content: "We aim to launch the first uncrewed Starships to Mars in 2 years when the next Earth-Mars transfer window opens. If those land safely, crewed flights will follow in 4 years.",
    validFrom: "2024-09-07",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "spacex"
  },

  // === TESLA, CYBERCAB & OPTIMUS ===
  {
    content: "Cybercab (Robotaxi) is designed for purely autonomous transport with no steering wheel or pedals. Operating costs will drop to under 20 cents per mile, transforming personal transportation forever.",
    validFrom: "2024-10-10",
    source: "Tesla We, Robot Event",
    sourceType: "speech",
    topic: "tesla"
  },
  {
    content: "Optimus humanoid robot will be the biggest product in human history. It will eliminate dangerous, boring, and repetitive labor. An economy where labor has no constraint is an economy of boundless abundance.",
    validFrom: "2024-06-13",
    source: "Tesla Annual Shareholder Meeting",
    sourceType: "speech",
    topic: "tesla"
  },
  {
    content: "Tesla FSD v12 and v13 are end-to-end neural networks trained on millions of video clips. We replaced over 300,000 lines of explicit C++ heuristic code with pure neural network weights.",
    validFrom: "2024-01-22",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "tesla"
  },
  {
    content: "Tesla energy storage business is growing faster than the automotive segment. Megapack deployments are expanding over 100% year-over-year to stabilize renewable electric grids worldwide.",
    validFrom: "2024-04-23",
    source: "Tesla Q1 Earnings Call",
    sourceType: "speech",
    topic: "tesla"
  },
  {
    content: "All Our Patent Are Belong To You. Tesla will not initiate patent lawsuits against anyone who, in good faith, wants to use our technology to accelerate sustainable transport.",
    validFrom: "2014-06-12",
    source: "Tesla Official Blog",
    sourceType: "document",
    topic: "tesla"
  },

  // === xAI, COLOSSUS & TRUTH-SEEKING AI ===
  {
    content: "xAI built the Colossus 100k Nvidia H100 supercluster in Memphis in just 122 days from scratch. It is currently the most powerful AI training cluster on Earth, scaling to 200k GPUs.",
    validFrom: "2024-09-02",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "xai"
  },
  {
    content: "Grok is designed to be maximally truth-seeking and curious about the true nature of reality, even when the truth is unpopular. AI forced to lie for political correctness is an existential hazard.",
    validFrom: "2023-11-04",
    source: "xAI Founding Briefing",
    sourceType: "speech",
    topic: "xai"
  },

  // === NEURALINK & BRAIN-COMPUTER INTERFACE ===
  {
    content: "Neuralink Telepathy implant allows a paralyzed patient to control a computer mouse and play chess purely with their thoughts using 1,024 ultra-fine flexible electrodes across 64 threads.",
    validFrom: "2024-03-20",
    source: "Neuralink First Human Patient Update",
    sourceType: "speech",
    topic: "neuralink"
  },
  {
    content: "Blindsight will enable people who have completely lost their vision, or even those who were born blind, to see again by stimulating the visual cortex directly.",
    validFrom: "2024-09-17",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "neuralink"
  },

  // === FIRST-PRINCIPLES & PRODUCTIVITY ALGORITHM ===
  {
    content: "The 5-Step Engineering Algorithm: 1. Make requirements less dumb. 2. Delete the part or process step. 3. Simplify or optimize. 4. Accelerate cycle time. 5. Automate. If you aren't adding back 10%, you're not deleting enough.",
    validFrom: "2021-08-04",
    source: "Everyday Astronaut Starbase Factory Tour",
    sourceType: "interview",
    topic: "philosophy"
  },
  {
    content: "First principles is reasoning by physics: boil a problem down to its most fundamental physical truths and reason up from there, rather than reasoning by analogy.",
    validFrom: "2012-02-15",
    source: "Foundation Kevin Rose Interview",
    sourceType: "interview",
    topic: "philosophy"
  },

  // === CRYPTO, BITCOIN & DOGECOIN ===
  {
    content: "Dogecoin is fundamentally better suited for day-to-day consumer transactions than Bitcoin because of its higher transaction rate and negligible transaction fees.",
    validFrom: "2021-05-13",
    source: "@elonmusk on X",
    sourceType: "tweet",
    topic: "crypto"
  },
  {
    content: "As of early 2021: Tesla purchased $1.5 billion in Bitcoin to maximize liquidity and will accept Bitcoin for vehicle purchases.",
    validFrom: "2021-02-08",
    validTo: "2021-05-12",
    source: "Tesla SEC Form 10-K",
    sourceType: "document",
    topic: "crypto"
  }
];
