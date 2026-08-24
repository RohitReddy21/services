import type {
  CategoryContent,
  ServiceCategory,
  ServiceCategoryId,
  ServiceDetail,
} from "@/types/service";

export const serviceCategories: ServiceCategory[] = [
  {
    id: "air-conditioning",
    name: "Air Conditioning",
    slug: "air-conditioning",
    shortDescription:
      "Installation, repairs, servicing and maintenance for all AC systems.",
    icon: "snowflake",
  },
  {
    id: "refrigeration",
    name: "Refrigeration",
    slug: "refrigeration",
    shortDescription:
      "Commercial and industrial refrigeration for kitchens, retail and cold storage.",
    icon: "fridge",
  },
];

const serviceImage = (name: string) => `/images/services/${name}.png`;

const img = {
  wall: serviceImage("wall-mounted-ac"),
  cassette: serviceImage("cassette-ac"),
  outdoor: serviceImage("outdoor-condenser-units"),
  install: serviceImage("ac-installation"),
  repair: serviceImage("hvac-repair-technician"),
  cold: serviceImage("cold-storage"),
  kitchen: serviceImage("commercial-refrigeration"),
  fridge: serviceImage("commercial-fridge"),
  freezer: serviceImage("commercial-freezer"),
  ice: serviceImage("ice-machine"),
  industrial: serviceImage("industrial-refrigeration"),
  display: serviceImage("display-fridge"),
};

export const services: ServiceDetail[] = [
  // ---------------- AIR CONDITIONING ----------------
  {
    id: "ac-wall-mounted",
    categoryId: "air-conditioning",
    name: "Wall Mounted Air Conditioning",
    slug: "wall-mounted",
    shortDescription:
      "Efficient, stylish and powerful cooling solutions for homes and businesses.",
    image: img.wall,
    heroImage: img.wall,
    description:
      "Wall mounted air conditioning units are the most popular choice for homes, offices and small commercial spaces, offering quiet, energy-efficient cooling and heating with a discreet indoor profile.",
    applications: ["Bedrooms & living rooms", "Home offices", "Small retail units", "Meeting rooms"],
    commonProblems: ["Unit not cooling effectively", "Ice building up on the coil", "Unusual noise or vibration", "Remote control or display faults"],
  },
  {
    id: "ac-cassette",
    categoryId: "air-conditioning",
    name: "Cassette Air Conditioning",
    slug: "cassette",
    shortDescription:
      "Discreet ceiling-recessed units delivering even, 360° airflow distribution.",
    image: img.cassette,
    heroImage: img.cassette,
    description:
      "Cassette air conditioning is fitted flush into a suspended ceiling, distributing air evenly across a room from a compact, unobtrusive grille — ideal where wall space is limited or aesthetics matter.",
    applications: ["Open-plan offices", "Retail showrooms", "Restaurants", "Reception areas"],
    commonProblems: ["Condensate pump failure & leaks", "Uneven airflow from one or more vanes", "Grille or louvre motor faults", "Reduced cooling capacity"],
  },
  {
    id: "ac-vrv",
    categoryId: "air-conditioning",
    name: "VRV Systems",
    slug: "vrv",
    shortDescription:
      "Variable Refrigerant Volume systems for precise, zoned climate control at scale.",
    image: img.outdoor,
    heroImage: img.outdoor,
    description:
      "VRV (Variable Refrigerant Volume) systems allow a single outdoor condenser to serve multiple indoor units independently, giving precise zoned control across large or multi-room buildings.",
    applications: ["Multi-storey offices", "Hotels", "Large retail units", "Mixed-use developments"],
    commonProblems: ["Refrigerant leaks across long pipe runs", "Zone-level temperature imbalance", "Outdoor unit compressor faults", "BMS/controller communication errors"],
  },
  {
    id: "ac-vrf",
    categoryId: "air-conditioning",
    name: "VRF Systems",
    slug: "vrf",
    shortDescription:
      "Variable Refrigerant Flow systems combining efficiency with simultaneous heating and cooling.",
    image: img.outdoor,
    heroImage: img.outdoor,
    description:
      "VRF (Variable Refrigerant Flow) technology enables simultaneous heating and cooling across different zones from one system, reducing running costs in larger commercial buildings.",
    applications: ["Corporate headquarters", "Educational buildings", "Healthcare facilities", "Large restaurants"],
    commonProblems: ["Heat recovery module faults", "Pipework insulation failure", "Inverter compressor errors", "System-wide efficiency loss"],
  },
  {
    id: "ac-multi-split",
    categoryId: "air-conditioning",
    name: "Multi-Split Systems",
    slug: "multi-split",
    shortDescription:
      "One outdoor condenser powering multiple indoor units for flexible room-by-room cooling.",
    image: img.outdoor,
    heroImage: img.outdoor,
    description:
      "Multi-split systems connect up to five indoor units to a single outdoor condenser, giving homes and small businesses independent room-by-room control without multiple outdoor units.",
    applications: ["Multi-room homes", "Small offices", "Cafes", "Clinics"],
    commonProblems: ["One indoor unit underperforming vs. others", "Outdoor unit short-cycling", "Pipework leaks between rooms", "Circuit board or sensor faults"],
  },
  {
    id: "ac-commercial",
    categoryId: "air-conditioning",
    name: "Commercial Air Conditioning",
    slug: "commercial",
    shortDescription:
      "Robust, scalable AC solutions engineered for commercial premises.",
    image: img.outdoor,
    heroImage: img.outdoor,
    description:
      "We design, install and maintain commercial air conditioning systems for offices, retail units and hospitality venues, balancing comfort, energy efficiency and reliability.",
    applications: ["Office buildings", "Retail chains", "Restaurants & bars", "Warehouses"],
    commonProblems: ["Inconsistent temperatures across floors", "Rising energy consumption", "Ageing plant reaching end of life", "Compliance & F-Gas record gaps"],
  },
  {
    id: "ac-residential",
    categoryId: "air-conditioning",
    name: "Residential Air Conditioning",
    slug: "residential",
    shortDescription:
      "Comfortable, quiet home cooling and heating tailored to your property.",
    image: img.wall,
    heroImage: img.wall,
    description:
      "Residential air conditioning installations designed around your home's layout, giving quiet, efficient comfort in the rooms that matter most, with tidy pipework and minimal disruption.",
    applications: ["Detached & semi-detached homes", "Apartments", "Home offices", "Loft conversions"],
    commonProblems: ["Room not reaching set temperature", "Noisy outdoor unit", "Water dripping from indoor unit", "Wi-Fi/app control not connecting"],
  },
  {
    id: "ac-installation",
    categoryId: "air-conditioning",
    name: "Air Conditioning Installation",
    slug: "installation",
    shortDescription:
      "Professional, fully compliant installation from survey through to handover.",
    image: img.install,
    heroImage: img.install,
    description:
      "Our F-Gas certified engineers handle every stage of your air conditioning installation — site survey, system sizing, pipework, electrical connection, commissioning and handover.",
    applications: ["New system installs", "Extensions & refurbishments", "System upgrades", "New-build fit-outs"],
    commonProblems: ["Incorrectly sized existing system", "Poor pipe routing from previous installs", "Missing commissioning documentation", "Non-compliant electrical isolation"],
  },
  {
    id: "ac-repairs",
    categoryId: "air-conditioning",
    name: "Air Conditioning Repairs",
    slug: "repairs",
    shortDescription:
      "Fast, reliable fault diagnosis and repair to get your system running again.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "From refrigerant leaks to electrical faults, our engineers diagnose and repair air conditioning breakdowns efficiently, using genuine parts and industry-standard practices.",
    applications: ["Breakdown callouts", "Intermittent faults", "Post-installation issues", "Insurance-related repairs"],
    commonProblems: ["System not turning on", "Error codes on display", "Loss of cooling or heating", "Leaking indoor or outdoor unit"],
  },
  {
    id: "ac-servicing",
    categoryId: "air-conditioning",
    name: "Air Conditioning Servicing",
    slug: "servicing",
    shortDescription:
      "Scheduled servicing to keep your system efficient, hygienic and reliable.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "Regular servicing keeps air conditioning systems running efficiently, extends equipment lifespan and helps maintain warranty and F-Gas compliance requirements.",
    applications: ["Annual service contracts", "Pre-summer readiness checks", "Landlord & letting compliance", "Warranty-required servicing"],
    commonProblems: ["Reduced airflow from a dirty filter", "Musty smells from indoor units", "Falling efficiency over time", "Overdue F-Gas records"],
  },
  {
    id: "ac-maintenance",
    categoryId: "air-conditioning",
    name: "Air Conditioning Maintenance",
    slug: "maintenance",
    shortDescription:
      "Planned preventative maintenance to avoid costly breakdowns.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "A planned maintenance programme catches small issues before they become expensive breakdowns, keeping your air conditioning reliable across every season.",
    applications: ["Multi-site maintenance contracts", "Commercial facilities", "Retail estates", "Property management"],
    commonProblems: ["Recurring minor faults", "Unplanned downtime", "Inconsistent contractor coverage", "No maintenance history on record"],
  },
  {
    id: "ac-diagnostics",
    categoryId: "air-conditioning",
    name: "AC Diagnostics",
    slug: "diagnostics",
    shortDescription:
      "Thorough fault-finding using proper diagnostic equipment, not guesswork.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "When a system isn't performing as it should, our engineers carry out a structured diagnostic assessment covering refrigerant pressures, electrics and airflow to pinpoint the root cause.",
    applications: ["Unexplained performance issues", "Pre-purchase system checks", "Recurring fault investigation", "Second-opinion assessments"],
    commonProblems: ["Fluctuating temperatures", "Repeated call-outs without resolution", "Unexplained energy usage spikes", "Intermittent shutdowns"],
  },
  {
    id: "ac-replacement-upgrade",
    categoryId: "air-conditioning",
    name: "AC Replacement / Upgrade",
    slug: "replacement-upgrade",
    shortDescription:
      "Replace ageing systems with modern, efficient equipment.",
    image: img.install,
    heroImage: img.install,
    description:
      "We help you replace outdated or inefficient air conditioning with modern, energy-efficient systems — including guidance on the right specification for your space.",
    applications: ["End-of-life system replacement", "R22 refrigerant phase-out upgrades", "Energy efficiency upgrades", "Capacity upgrades"],
    commonProblems: ["System using obsolete refrigerant", "Rising repair costs on old equipment", "Outdated, inefficient technology", "Capacity no longer meets demand"],
  },
  {
    id: "ac-emergency",
    categoryId: "air-conditioning",
    name: "Emergency AC Services",
    slug: "emergency",
    shortDescription:
      "Rapid-response support when your system fails unexpectedly.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "System failure at the wrong time can disrupt a home or business. Our emergency air conditioning service prioritises rapid assessment and repair to minimise downtime.",
    applications: ["Total system failure", "Server room / critical cooling", "Commercial kitchens", "Out-of-hours breakdowns"],
    commonProblems: ["Complete loss of cooling", "Burning smell or smoke", "Water leak causing damage", "Tripping electrical circuits"],
  },

  // ---------------- REFRIGERATION ----------------
  {
    id: "ref-fridges",
    categoryId: "refrigeration",
    name: "Fridges",
    slug: "fridges",
    shortDescription: "Installation, repair and servicing for commercial fridges of every size.",
    image: img.fridge,
    heroImage: img.fridge,
    description:
      "From single-door units to large commercial fridges, we install, service and repair refrigeration equipment that keeps food safe and businesses compliant.",
    applications: ["Restaurants & cafes", "Convenience stores", "Catering kitchens", "Office kitchens"],
    commonProblems: ["Temperature running too high", "Excessive frost or condensation", "Door seal wear", "Compressor running constantly"],
  },
  {
    id: "ref-freezers",
    categoryId: "refrigeration",
    name: "Freezers",
    slug: "freezers",
    shortDescription: "Reliable freezer installation, repair and maintenance for food safety.",
    image: img.freezer,
    heroImage: img.freezer,
    description:
      "We keep commercial freezers running at the correct temperature with professional installation, repair and maintenance, protecting stock and meeting food safety standards.",
    applications: ["Catering businesses", "Retail freezer units", "Butchers & fishmongers", "Central production kitchens"],
    commonProblems: ["Ice build-up on evaporator coil", "Freezer not reaching set temperature", "Door not sealing properly", "Fan or defrost timer faults"],
  },
  {
    id: "ref-cold-rooms",
    categoryId: "refrigeration",
    name: "Cold Rooms",
    slug: "cold-rooms",
    shortDescription: "Design, installation and servicing of walk-in cold rooms.",
    image: img.cold,
    heroImage: img.cold,
    description:
      "We design, install and maintain walk-in cold rooms for businesses that need reliable, larger-scale chilled storage, from panel assembly through to refrigeration commissioning.",
    applications: ["Restaurants & hotels", "Food wholesalers", "Supermarkets", "Central kitchens"],
    commonProblems: ["Panel seal or door gasket failure", "Condensation and mould inside the room", "Temperature drift across the space", "Evaporator icing"],
  },
  {
    id: "ref-blast-chillers",
    categoryId: "refrigeration",
    name: "Blast Chillers",
    slug: "blast-chillers",
    shortDescription: "Rapid-chill equipment servicing to protect food safety compliance.",
    image: img.cold,
    heroImage: img.cold,
    description:
      "Blast chillers rapidly reduce food temperature for safe storage. We install and maintain this critical kitchen equipment to keep it performing to HACCP standards.",
    applications: ["Commercial kitchens", "Central production units", "Catering companies", "Hotels"],
    commonProblems: ["Chill cycle taking longer than expected", "Inconsistent core temperature results", "Control panel/probe faults", "Door seal or hinge wear"],
  },
  {
    id: "ref-ice-machines",
    categoryId: "refrigeration",
    name: "Ice Machines",
    slug: "ice-machines",
    shortDescription: "Installation, descaling and repair for commercial ice machines.",
    image: img.ice,
    heroImage: img.ice,
    description:
      "We install, clean and repair commercial ice machines, helping bars, restaurants and hotels maintain consistent ice production and hygiene standards.",
    applications: ["Bars & restaurants", "Hotels", "Healthcare facilities", "Retail"],
    commonProblems: ["Low or no ice production", "Cloudy or misshapen ice", "Water supply or drainage faults", "Scale build-up affecting output"],
  },
  {
    id: "ref-display-fridges",
    categoryId: "refrigeration",
    name: "Display Fridges",
    slug: "display-fridges",
    shortDescription: "Glass-front display refrigeration for retail and hospitality.",
    image: img.display,
    heroImage: img.display,
    description:
      "Display fridges need to look good and perform reliably. We install and maintain glass-front refrigeration that keeps merchandising fresh, visible and food-safe.",
    applications: ["Convenience stores", "Delis & bakeries", "Supermarkets", "Cafes"],
    commonProblems: ["Fogged or misted glass", "Uneven cooling across shelves", "Lighting or fan faults", "Door closer misalignment"],
  },
  {
    id: "ref-walk-in-fridges",
    categoryId: "refrigeration",
    name: "Walk-In Fridges",
    slug: "walk-in-fridges",
    shortDescription: "Larger-scale walk-in chilled storage, installed and maintained.",
    image: img.kitchen,
    heroImage: img.kitchen,
    description:
      "Walk-in fridges provide the chilled storage capacity growing kitchens and retailers need. We handle installation, servicing and repair to keep them running reliably.",
    applications: ["Restaurants", "Supermarkets", "Wholesalers", "Catering operations"],
    commonProblems: ["Temperature not holding steady", "Door seal or hinge issues", "Refrigerant leaks", "Excess condensation build-up"],
  },
  {
    id: "ref-walk-in-freezers",
    categoryId: "refrigeration",
    name: "Walk-In Freezers",
    slug: "walk-in-freezers",
    shortDescription: "Large-capacity frozen storage installation and repair.",
    image: img.freezer,
    heroImage: img.freezer,
    description:
      "For businesses needing significant frozen storage, we install and maintain walk-in freezers built for consistent, reliable low-temperature performance.",
    applications: ["Food distributors", "Supermarkets", "Central kitchens", "Cold chain logistics"],
    commonProblems: ["Ice build-up on floor or walls", "Door not sealing in cold conditions", "Defrost cycle malfunction", "Compressor overload"],
  },
  {
    id: "ref-commercial",
    categoryId: "refrigeration",
    name: "Commercial Refrigeration",
    slug: "commercial",
    shortDescription: "End-to-end refrigeration solutions for commercial kitchens and retail.",
    image: img.kitchen,
    heroImage: img.kitchen,
    description:
      "We deliver complete commercial refrigeration solutions — from single units to full kitchen fit-outs — installed and maintained to keep businesses compliant and running smoothly.",
    applications: ["Restaurants & bars", "Retail & convenience stores", "Hotels", "Catering businesses"],
    commonProblems: ["Multiple units underperforming", "Rising energy costs", "Compliance record gaps", "Ageing estate-wide equipment"],
  },
  {
    id: "ref-industrial",
    categoryId: "refrigeration",
    name: "Industrial Refrigeration",
    slug: "industrial",
    shortDescription: "Large-scale refrigeration systems for industrial and logistics sites.",
    image: img.industrial,
    heroImage: img.industrial,
    description:
      "Industrial refrigeration systems demand specialist expertise. We install and maintain large-scale plant for food production, distribution and cold chain facilities.",
    applications: ["Food manufacturing", "Distribution centres", "Cold storage warehouses", "Logistics hubs"],
    commonProblems: ["Plant-wide efficiency loss", "Ammonia/refrigerant system faults", "Compressor or condenser failure", "Compliance and safety inspection gaps"],
  },
  {
    id: "ref-installation",
    categoryId: "refrigeration",
    name: "Refrigeration Installation",
    slug: "installation",
    shortDescription: "Professional installation across all refrigeration equipment types.",
    image: img.install,
    heroImage: img.install,
    description:
      "Our engineers handle full-scope refrigeration installation — from site survey and system design through to commissioning and compliance documentation.",
    applications: ["New kitchen fit-outs", "Retail refurbishments", "Equipment upgrades", "New-build developments"],
    commonProblems: ["Incorrect unit sizing for the space", "Poor ventilation or drainage planning", "Missing commissioning paperwork", "Non-compliant installation"],
  },
  {
    id: "ref-repairs",
    categoryId: "refrigeration",
    name: "Refrigeration Repairs",
    slug: "repairs",
    shortDescription: "Fast fault diagnosis and repair to protect stock and compliance.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "Refrigeration faults put stock and compliance at risk. Our engineers respond quickly to diagnose and repair issues, minimising downtime and food loss.",
    applications: ["Breakdown call-outs", "Temperature alarm response", "Post-installation issues", "Insurance-related repairs"],
    commonProblems: ["Unit not reaching temperature", "Unusual noise from compressor", "Leaking water or refrigerant", "Alarm codes on display"],
  },
  {
    id: "ref-servicing",
    categoryId: "refrigeration",
    name: "Refrigeration Servicing",
    slug: "servicing",
    shortDescription: "Scheduled servicing to protect food safety and equipment lifespan.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "Regular refrigeration servicing keeps equipment running efficiently and helps meet food safety and hygiene requirements across your site.",
    applications: ["Annual service contracts", "Environmental health compliance", "Warranty-required servicing", "Multi-site programmes"],
    commonProblems: ["Falling efficiency over time", "Dirty condenser coils", "Overdue compliance records", "Inconsistent contractor coverage"],
  },
  {
    id: "ref-maintenance",
    categoryId: "refrigeration",
    name: "Refrigeration Maintenance",
    slug: "maintenance",
    shortDescription: "Planned preventative maintenance to avoid costly downtime.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "A planned maintenance programme catches issues early, protecting stock, reducing energy waste and avoiding unplanned refrigeration downtime.",
    applications: ["Multi-site maintenance contracts", "Retail & hospitality groups", "Food production sites", "Property management"],
    commonProblems: ["Recurring minor faults", "Unplanned equipment downtime", "No maintenance history on record", "Inconsistent service quality"],
  },
  {
    id: "ref-diagnostics",
    categoryId: "refrigeration",
    name: "Refrigeration Diagnostics",
    slug: "diagnostics",
    shortDescription: "Structured fault-finding using proper diagnostic equipment.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "When refrigeration isn't performing as expected, our engineers carry out structured diagnostics covering refrigerant, electrics and airflow to find the true root cause.",
    applications: ["Unexplained performance issues", "Recurring fault investigation", "Pre-purchase equipment checks", "Second-opinion assessments"],
    commonProblems: ["Fluctuating temperatures", "Repeated call-outs without resolution", "Unexplained energy spikes", "Intermittent alarms"],
  },
  {
    id: "ref-emergency",
    categoryId: "refrigeration",
    name: "Emergency Refrigeration Services",
    slug: "emergency",
    shortDescription: "Rapid-response support to protect stock when equipment fails.",
    image: img.repair,
    heroImage: img.repair,
    description:
      "A refrigeration breakdown can put stock and revenue at risk within hours. Our emergency service prioritises fast assessment and repair to protect your business.",
    applications: ["Total refrigeration failure", "Cold room/freezer breakdowns", "Out-of-hours call-outs", "Stock-critical situations"],
    commonProblems: ["Complete loss of cooling", "Rapid temperature rise", "Water leak causing damage", "Tripping electrical circuits"],
  },
  {
    id: "ref-cold-room-maintenance",
    categoryId: "refrigeration",
    name: "Cold Room Maintenance",
    slug: "cold-room-maintenance",
    shortDescription: "Dedicated maintenance programmes for walk-in cold rooms.",
    image: img.cold,
    heroImage: img.cold,
    description:
      "Cold rooms require consistent upkeep to maintain temperature integrity and hygiene. We provide dedicated maintenance programmes tailored to your storage needs.",
    applications: ["Food wholesalers", "Restaurants & hotels", "Supermarkets", "Central kitchens"],
    commonProblems: ["Door seal degradation", "Temperature drift over time", "Condensation and mould risk", "Evaporator fan wear"],
  },
  {
    id: "ref-display-cabinet",
    categoryId: "refrigeration",
    name: "Display Cabinet Refrigeration",
    slug: "display-cabinet",
    shortDescription: "Specialist servicing for merchandising and display refrigeration.",
    image: img.display,
    heroImage: img.display,
    description:
      "Display cabinets combine refrigeration performance with presentation. We service and repair merchandising units to keep them efficient, clear and food-safe.",
    applications: ["Bakeries & delis", "Supermarkets", "Convenience retail", "Cafes"],
    commonProblems: ["Misted or fogged glass", "Uneven shelf temperatures", "LED lighting faults", "Fan or thermostat issues"],
  },
];

export const categoryContent: Record<ServiceCategoryId, CategoryContent> = {
  "air-conditioning": {
    whatWeProvide: [
      "Energy efficient cooling & heating",
      "Quiet, low-noise operation",
      "Smart & app-based control options",
      "Professional, compliant installation",
      "Ongoing repairs & maintenance",
      "Flexible service scheduling",
    ],
    idealFor: [
      { label: "Homes", icon: "home" },
      { label: "Offices", icon: "building" },
      { label: "Shops", icon: "store" },
      { label: "Restaurants", icon: "utensils" },
      { label: "Businesses", icon: "briefcase" },
    ],
    process: [
      { step: 1, title: "Enquiry & Assessment", description: "Tell us what you need — our team reviews your request and equipment details." },
      { step: 2, title: "Site Survey", description: "An engineer assesses your space, existing system and requirements where needed." },
      { step: 3, title: "Service Confirmation", description: "We confirm scope, scheduling and any details ahead of your appointment." },
      { step: 4, title: "Professional Service", description: "Our certified engineers carry out the work to industry standards." },
      { step: 5, title: "Quality Check", description: "We test and verify performance before completing the job." },
      { step: 6, title: "Aftercare", description: "You receive a summary of work completed and any ongoing recommendations." },
    ],
    faqs: [
      { question: "Are your engineers certified?", answer: "Yes, all AGS engineers are F-Gas certified and fully trained on the systems they work with." },
      { question: "How quickly can you attend?", answer: "Response times depend on the service and your location, but we prioritise emergency requests." },
      { question: "Do you work on all AC brands?", answer: "Our engineers are experienced across all major residential and commercial air conditioning brands." },
      { question: "Will I get a price before work starts?", answer: "Our team will confirm service details and any applicable charges with you directly before work begins." },
    ],
    reviews: [
      { id: "rev-ac-1", author: "James P.", location: "Manchester", rating: 5, text: "Excellent installation, tidy work and the engineer explained everything clearly.", date: "2026-05-14" },
      { id: "rev-ac-2", author: "Amelia R.", location: "London", rating: 5, text: "Quick response for an emergency repair on a very hot day. Really appreciated it.", date: "2026-06-02" },
    ],
  },
  refrigeration: {
    whatWeProvide: [
      "Food-safety focused servicing",
      "Rapid breakdown response",
      "HACCP-aware maintenance records",
      "Professional, compliant installation",
      "Multi-site contract options",
      "Genuine parts & components",
    ],
    idealFor: [
      { label: "Restaurants", icon: "utensils" },
      { label: "Retail & Shops", icon: "store" },
      { label: "Hotels", icon: "building" },
      { label: "Food Production", icon: "briefcase" },
      { label: "Businesses", icon: "home" },
    ],
    process: [
      { step: 1, title: "Enquiry & Assessment", description: "Tell us about your equipment and what you need — we review the details." },
      { step: 2, title: "Site Survey", description: "An engineer assesses your equipment and site requirements where needed." },
      { step: 3, title: "Service Confirmation", description: "We confirm scope, scheduling and any details ahead of your appointment." },
      { step: 4, title: "Professional Service", description: "Our engineers carry out the work to food-safety and industry standards." },
      { step: 5, title: "Quality Check", description: "We verify temperatures and performance before completing the job." },
      { step: 6, title: "Aftercare", description: "You receive a summary of work completed and any compliance documentation." },
    ],
    faqs: [
      { question: "Can you respond to emergencies out of hours?", answer: "Yes, our emergency refrigeration service is available for urgent, stock-critical breakdowns." },
      { question: "Do you provide compliance documentation?", answer: "Yes, servicing and maintenance visits include records to support your food safety compliance." },
      { question: "Do you cover multi-site businesses?", answer: "We support multi-site maintenance contracts for retail, hospitality and food production groups." },
      { question: "Will I get a price before work starts?", answer: "Our team will confirm service details and any applicable charges with you directly before work begins." },
    ],
    reviews: [
      { id: "rev-ref-1", author: "Sarah J.", location: "Bristol", rating: 5, text: "AGS provided an excellent service. Our cold room is working perfectly and the engineer was very professional.", date: "2026-06-10" },
      { id: "rev-ref-2", author: "Tom W.", location: "Leeds", rating: 5, text: "Reliable maintenance contract for our three restaurant sites. Always on time.", date: "2026-04-28" },
    ],
  },
};

export function getServicesByCategory(categoryId: ServiceCategoryId) {
  return services.filter((s) => s.categoryId === categoryId);
}

export function getServiceBySlug(categoryId: ServiceCategoryId, slug: string) {
  return services.find((s) => s.categoryId === categoryId && s.slug === slug);
}
