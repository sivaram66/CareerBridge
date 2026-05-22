
import { db } from '../config/db.js';
import { targetCompanies } from '../shared/schema.js';

const eliteStartups = [
  "Airbnb", "Stripe", "Coinbase", "Dropbox", "Reddit", "DoorDash", "Instacart",
  "Plaid", "Brex", "Figma", "Notion", "Vercel", "Supabase", "Linear", "Raycast",
  "Scale AI", "OpenAI", "Anthropic", "Hugging Face", "Databricks", "Snowflake",
  "Cloudflare", "Vanta", "Rippling", "Deel", "Gusto", "GitLab", "HashiCorp",
  "Retool", "PostHog", "Sentry", "Netlify", "Algolia", "Auth0", "Twilio",
  "SendGrid", "Robinhood", "Chime", "Revolut", "Monzo", "Spotify", "Netflix",
  "Hulu", "Twitch", "Discord", "Slack", "Zoom", "Atlassian", "Canva", "Miro",
  "Airtable", "Asana", "HubSpot", "Salesforce", "Zendesk", "Intercom", "Shopify",
  "Datadog", "New Relic", "PagerDuty", "GitHub", "Elastic", "Confluent", "MongoDB",
];

// Indian unicorns and major tech companies with known Greenhouse/Lever board tokens
const indianUnicorns = [
  { name: "Razorpay", atsProvider: "lever", boardToken: "razorpay" },
  { name: "CRED", atsProvider: "lever", boardToken: "cred" },
  { name: "Zepto", atsProvider: "greenhouse", boardToken: "zepto" },
  { name: "Groww", atsProvider: "lever", boardToken: "groww" },
  { name: "PhonePe", atsProvider: "greenhouse", boardToken: "phonepe" },
  { name: "BrowserStack", atsProvider: "greenhouse", boardToken: "browserstack" },
  { name: "Freshworks", atsProvider: "greenhouse", boardToken: "freshworks" },
  { name: "Postman", atsProvider: "greenhouse", boardToken: "postman" },
  { name: "Swiggy", atsProvider: "greenhouse", boardToken: "swiggy" },
  { name: "Meesho", atsProvider: "greenhouse", boardToken: "meesho" },
  { name: "Zomato", atsProvider: "greenhouse", boardToken: "zomato" },
  { name: "ShareChat", atsProvider: "greenhouse", boardToken: "sharechat" },
  { name: "Urban Company", atsProvider: "greenhouse", boardToken: "urbancompany" },
  { name: "Unacademy", atsProvider: "greenhouse", boardToken: "unacademy" },
  { name: "Lenskart", atsProvider: "greenhouse", boardToken: "lenskart" },
  { name: "Dream11", atsProvider: "greenhouse", boardToken: "dream11" },
  { name: "Ola", atsProvider: "greenhouse", boardToken: "ola" },
  { name: "CleverTap", atsProvider: "greenhouse", boardToken: "clevertap" },
  { name: "MoEngage", atsProvider: "greenhouse", boardToken: "moengage" },
  { name: "Hasura", atsProvider: "greenhouse", boardToken: "hasura" },
  { name: "Chargebee", atsProvider: "greenhouse", boardToken: "chargebee" },
  { name: "Zoho", atsProvider: "greenhouse", boardToken: "zoho" },
  { name: "InMobi", atsProvider: "greenhouse", boardToken: "inmobi" },
  { name: "Druva", atsProvider: "greenhouse", boardToken: "druva" },
  { name: "Icertis", atsProvider: "greenhouse", boardToken: "icertis" },
  { name: "Darwinbox", atsProvider: "greenhouse", boardToken: "darwinbox" },
  { name: "Whatfix", atsProvider: "greenhouse", boardToken: "whatfix" },
  { name: "LambdaTest", atsProvider: "greenhouse", boardToken: "lambdatest" },
  { name: "RudderStack", atsProvider: "greenhouse", boardToken: "rudderstack" },
  { name: "Wingify", atsProvider: "greenhouse", boardToken: "wingify" },
];

const myPreviousList = [
  "2iSolutions", "360 Degree Cloud Technologies", "5C Network", "63 moons Technologies",
  "Aabasoft", "AAPNA Infotech", "ABM Knowledgeware", "Absolutdata Analytics",
  "Abzooba", "Accelalpha", "ACCELQ", "Accops Systems", "Accubits Technologies",
  "Acnovate Corporation", "Acropolis Infotech", "Acropetal Technologies",
  "Acqueon", "Actis Technologies", "Acute Informatics", "Acuver Consulting",
  "Adapty", "AdaniConneX", "Adarsh Solutions", "Adea Solutions", "Aditi Consulting",
  "Aequor Technologies", "Aeries Technology Group", "Aethereus", "Affle",
  "AFour Technologies", "AG Technologies", "Aggne", "Agile CRM", "Agile Global Solutions",
  "Agiliad", "Agri10x", "AIS Technolabs", "Akal Information Systems",
  "Algonomy", "Algoworks", "Altezzasys Systems", "Altius", "Altruista Health",
  "Altudo", "Alumnus Software", "Alvaria", "Amantya Technologies", "Amelia", "Ameyo",
  "Amnet Digital", "Amnet Systems", "Ampcus Inc", "Ample Technologies", "AmpleLogic",
  "AmZetta Technologies", "Anaqua", "Anchanto", "Andor Tech", "Angara E-Commerce",
  "AntWorks", "Anunta Tech", "Apar Peopleworld Software", "apna", "Appcino Technologies",
  "Appitsimple Infotek", "Applexus Technologies", "AppsTek", "Apptware",
  "Appventurez", "AppViewX", "Aptos Retail", "Apty", "AQM Technologies",
  "Arcadia", "Areteans", "Aress Software", "Artoon Solutions", "Arya.ag",
  "AspireNXT", "Aspiring Minds", "Atidiv", "Atlan", "ATMECS Inc",
  "Aufait Technologies", "Aujas Cybersecurity", "Auriga IT Consulting",
  "Aurus Inc", "AutoRABIT", "Avataar.Me", "Avanze", "Awign", "Azilen Technologies",
];

// Generate board token from company name
function generateBoardToken(companyName: string): string {
  return companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function seedDatabase() {
  console.log(`🌱 Starting Seeder...`);

  // 1. Seed Indian unicorns with exact known board tokens
  console.log(`\n🇮🇳 Seeding ${indianUnicorns.length} Indian unicorns/major companies...`);
  try {
    await db.insert(targetCompanies)
      .values(indianUnicorns.map(c => ({ ...c, isActive: true })))
      .onConflictDoNothing({ target: targetCompanies.boardToken });
    console.log(`✅ Indian unicorns seeded.`);
  } catch (error: any) {
    console.error(`❌ Indian unicorn seeding failed:`, error.message);
  }

  // 2. Seed global elite startups
  const globalTargets = eliteStartups.map(name => ({
    name,
    atsProvider: 'greenhouse' as const,
    boardToken: generateBoardToken(name),
    isActive: true,
  }));

  console.log(`\n🌐 Seeding ${globalTargets.length} global elite startups...`);
  try {
    await db.insert(targetCompanies)
      .values(globalTargets)
      .onConflictDoNothing({ target: targetCompanies.boardToken });
    console.log(`✅ Global startups seeded.`);
  } catch (error: any) {
    console.error(`❌ Global startup seeding failed:`, error.message);
  }

  // 3. Seed previous Indian company list
  const previousTargets = myPreviousList.map(name => ({
    name,
    atsProvider: 'greenhouse' as const,
    boardToken: generateBoardToken(name),
    isActive: true,
  }));

  console.log(`\n📋 Seeding ${previousTargets.length} additional Indian companies...`);
  try {
    await db.insert(targetCompanies)
      .values(previousTargets)
      .onConflictDoNothing({ target: targetCompanies.boardToken });
    console.log(`✅ Previous list seeded.`);
  } catch (error: any) {
    console.error(`❌ Previous list seeding failed:`, error.message);
  }

  console.log(`\n🏁 Seeder complete! All company targets loaded into Command Center.`);
  process.exit(0);
}

seedDatabase();