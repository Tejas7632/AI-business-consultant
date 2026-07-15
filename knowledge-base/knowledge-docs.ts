/**
 * RAG Knowledge Base — Domain-specific knowledge documents
 * These structured documents are chunked and embedded for semantic retrieval.
 * In production, these are replaced by Watson Discovery collections.
 */

export interface KnowledgeDocument {
  id: string;
  domain: string;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  lastUpdated?: string;
}

// ── Market Research Knowledge ──────────────────────────────────────────────────
export const MARKET_RESEARCH_DOCS: KnowledgeDocument[] = [
  {
    id: "mr-001",
    domain: "market-research",
    title: "How to Size Your Total Addressable Market (TAM)",
    tags: ["TAM", "SAM", "SOM", "market sizing", "top-down", "bottom-up"],
    content: `Total Addressable Market (TAM) sizing approaches:
    
TOP-DOWN APPROACH: Start with industry-wide revenue data from analyst reports (Gartner, IDC, 
Forrester, Statista) and narrow down by your target segment. Example: Global SaaS market = 
$237B (2024). SMB HR software segment = 12% = ~$28B TAM.

BOTTOM-UP APPROACH: (Number of potential customers) × (Average Contract Value). 
More accurate for B2B. Example: 500,000 SMBs in target geography × $1,200/year ACV = $600M TAM.

SAM (Serviceable Addressable Market): The portion of TAM you can realistically reach with 
your current business model and channels. Typically 10-30% of TAM.

SOM (Serviceable Obtainable Market): Realistic market share in Year 1-3. 
Early-stage: target 0.5-2% of SAM. 

KEY MARKET RESEARCH SOURCES:
- IBISWorld, Statista, Grand View Research (paid industry reports)
- US Census Business Patterns, OECD stats (free government data)
- Google Trends, SEMrush (digital demand signals)
- LinkedIn Sales Navigator (B2B addressable accounts)
- Crunchbase, PitchBook (venture-backed company analysis)
- Primary research: 50-100 customer interviews minimum

MARKET GROWTH INDICATORS TO MONITOR:
- CAGR (Compound Annual Growth Rate) — industry average: 8-15% for tech sectors
- Net Promoter Score of incumbent solutions (unhappy customers = opportunity)
- Search volume trends for problem keywords
- VC investment trends in the space (rising investment = validation)`,
    source: "IBM watsonx Knowledge Base — Market Research Framework v2.1",
    lastUpdated: "2024-01-15",
  },
  {
    id: "mr-002",
    domain: "market-research",
    title: "Customer Persona Development Framework",
    tags: ["customer persona", "ICP", "demographics", "psychographics", "buyer journey"],
    content: `IDEAL CUSTOMER PROFILE (ICP) FRAMEWORK:

FIRMOGRAPHIC DATA (B2B):
- Company size: 10-500 employees (SMB sweet spot for most SaaS)
- Industry verticals (2-3 primary, 2-3 secondary)
- Geography: Start with 1-2 countries/regions
- Tech stack: Compatible with your integration requirements
- Budget: Annual software spend $50K-$500K

DEMOGRAPHIC DATA (B2C):
- Age: Primary 25-44, Secondary 18-24 / 45-60
- Income: Middle to upper-middle class ($50K-$150K household income)
- Education: College-educated professionals
- Location: Urban + suburban tier-1 and tier-2 cities

PSYCHOGRAPHIC PROFILE:
- Pain points: Top 3 problems they face daily
- Goals: Professional and personal aspirations
- Fears: What keeps them up at night
- Watering holes: Where they consume content (LinkedIn, Reddit, conferences)
- Buying triggers: Events that initiate purchase consideration

BUYER JOURNEY STAGES:
1. Awareness (recognizing the problem)
2. Consideration (evaluating solutions)
3. Decision (selecting vendor)
4. Retention (ongoing value delivery)
5. Advocacy (referrals and word-of-mouth)`,
    source: "IBM watsonx Knowledge Base — Customer Research Framework v1.8",
    lastUpdated: "2024-02-10",
  },
];

// ── Funding Options Knowledge ──────────────────────────────────────────────────
export const FUNDING_DOCS: KnowledgeDocument[] = [
  {
    id: "fund-001",
    domain: "funding-options",
    title: "Startup Funding Stages and Sources",
    tags: ["angel", "VC", "seed", "series-a", "crowdfunding", "bootstrapping", "grants"],
    content: `STARTUP FUNDING LADDER:

PRE-SEED ($50K - $500K):
- Founder savings and family/friends (FFF round)
- Angel investors: HNIs (High Net Worth Individuals) writing $25K-$100K checks
- Pre-seed funds: Hustle Fund, 1517 Fund, Precursor Ventures
- Accelerators providing capital: Y Combinator ($500K for 7%), Techstars ($20K for 6%)
- Government grants: Non-dilutive, ideal for deep tech/research-heavy startups

SEED ($500K - $3M):
- Seed-stage VCs: First Round Capital, True Ventures, SV Angel, Sequoia Scout
- Angel syndicates: AngelList, Republic, Wefunder
- Revenue-based financing: Clearco, Pipe, Lighter Capital (for SaaS with $10K+ MRR)
- Convertible notes: Simple, defers valuation; typical cap $5-10M, discount 15-20%
- SAFE (Simple Agreement for Future Equity): Y Combinator standard, founder-friendly

SERIES A ($3M - $15M):
- Tier-1 VCs: Sequoia, Andreessen Horowitz, Accel, Bessemer
- Requirements: $1-3M ARR, strong unit economics, proven PMF, 18-month runway

ALTERNATIVE FUNDING:
- Crowdfunding: Kickstarter (rewards), Indiegogo (hardware), Republic (equity)
- Corporate VC: Salesforce Ventures, Google Ventures, Intel Capital
- Debt financing: SVB Startup Banking, Brex, Mercury (fintech-friendly banks)
- ICO/Token (Web3): Only for blockchain-native products

INDIA-SPECIFIC FUNDING:
- SIDBI Fund of Funds: ₹10,000 Cr corpus for startups
- National Innovation Foundation (NIF): Grants for grassroots innovators
- iCreate: International Centre for Entrepreneurship and Technology
- Sequoia Surge (Southeast Asia + India): $1-2M pre-seed
- Blume Ventures, Nexus VP, Matrix Partners India: Early-stage India VCs`,
    source: "IBM watsonx Knowledge Base — Startup Funding Guide v3.2",
    lastUpdated: "2024-03-01",
  },
  {
    id: "fund-002",
    domain: "funding-options",
    title: "Pitch Deck and Investor Relations Best Practices",
    tags: ["pitch deck", "investor", "term sheet", "due diligence", "valuation"],
    content: `WINNING PITCH DECK STRUCTURE (10-12 slides):
1. Cover — Company name, tagline, founder contact
2. Problem — Specific pain, quantified, relatable story
3. Solution — Product demo or screenshot, clear value proposition
4. Market Size — TAM/SAM/SOM with sources
5. Product — Key features, technology differentiator, roadmap
6. Traction — Revenue, users, growth rate, key partnerships
7. Business Model — How you make money, unit economics
8. Go-to-Market — Customer acquisition channels and costs
9. Competition — Honest matrix, your defensible moat
10. Team — Relevant experience, domain expertise, advisors
11. Financials — 3-year P&L projection, key assumptions
12. The Ask — Amount, use of funds, milestones to next round

VALUATION BENCHMARKS (2024):
- Pre-revenue (pre-seed): $1-5M post-money
- MVP + early customers: $3-8M post-money
- $100K MRR (seed): $5-15M post-money
- $1M ARR (Series A): $10-30M post-money
- Rule of thumb: 5-10x ARR multiple for SaaS at seed stage

DUE DILIGENCE CHECKLIST:
- Cap table (clean, no complex structures)
- IP ownership agreements (all founders assigned IP to company)
- Customer contracts (no auto-termination clauses)
- Financial statements (last 24 months)
- Technical architecture documentation
- Employment agreements and ESOP pool (10-15% for Series A)`,
    source: "IBM watsonx Knowledge Base — Investor Relations Framework v2.0",
    lastUpdated: "2024-01-28",
  },
];

// ── Government Schemes Knowledge ───────────────────────────────────────────────
export const GOVERNMENT_SCHEMES_DOCS: KnowledgeDocument[] = [
  {
    id: "gov-001",
    domain: "government-schemes",
    title: "India Startup Ecosystem — Government Programs",
    tags: ["DPIIT", "Startup India", "AIM", "SIDBI", "MUDRA", "tax exemption", "India"],
    content: `INDIA GOVERNMENT STARTUP PROGRAMS (2024):

STARTUP INDIA (DPIIT):
- DPIIT Recognition: Register at startupindia.gov.in, enables tax benefits
- Section 80-IAC: 3-year income tax exemption (eligible for 10 years from incorporation)
- Section 56(2)(viib): Angel tax exemption for recognized startups
- Self-certification: 9 labor laws + 3 environmental laws
- Fast-track patent examination: 80% fee reduction, expedited processing (30-day target)
- Fund of Funds: ₹10,000 Cr for SEBI-registered AIFs investing in startups

ATAL INNOVATION MISSION (AIM):
- Atal Incubation Centers (AICs): ₹10 Cr grant for incubator setup
- Atal New India Challenges: ₹1-3 Cr for solving national challenges
- ATL (Atal Tinkering Labs): School-level STEM innovation

MSME SCHEMES:
- MUDRA Loans: ₹10L-₹10Cr under Shishu/Kishor/Tarun categories
- CGTMSE: Collateral-free loans up to ₹2 Cr
- ZED Certification: Quality + productivity scheme
- SFURTI: Traditional industries cluster development

STATE-LEVEL PROGRAMS:
- Kerala Startup Mission (KSUM): Best state startup ecosystem
- T-Hub Hyderabad: Largest innovation hub in Asia
- Karnataka Startup Policy: Bengaluru startup incentives
- Maharashtra Innovation Hub: Pune + Mumbai ecosystem

KEY CONTACTS:
- startupindia.gov.in — DPIIT registration portal
- aim.gov.in — Atal Innovation Mission applications
- sidbi.in — SIDBI Startup Mitra portal
- msme.gov.in — MSME scheme applications`,
    source: "IBM watsonx Knowledge Base — India Government Schemes v4.1",
    lastUpdated: "2024-04-10",
  },
  {
    id: "gov-002",
    domain: "government-schemes",
    title: "US & Global Government Startup Support Programs",
    tags: ["SBIR", "STTR", "SBA", "NSF", "EU Horizon", "EIC Accelerator", "grants", "USA"],
    content: `UNITED STATES GOVERNMENT PROGRAMS:

SBIR/STTR (Small Business Innovation Research/Technology Transfer):
- Phase I: Up to $256,000 for feasibility study (6 months)
- Phase II: Up to $1.7M for full R&D (2 years)
- Open to US-based small businesses with <500 employees
- Agencies: NSF, NIH, DOD, DOE, NASA, USDA
- Application portal: sbir.gov

SBA (Small Business Administration):
- 7(a) Loan: Up to $5M at competitive rates
- 504 Loan: Up to $5.5M for real estate/equipment
- Microloan: Up to $50,000 for very early-stage
- SCORE mentorship: Free business mentoring nationwide

EU/EUROPEAN PROGRAMS:
- EIC Accelerator: Up to €2.5M grant + €15M equity investment
- Horizon Europe: €95.5B fund for R&D and innovation (2021-2027)
- European Investment Fund (EIF): VC fund-of-funds
- InnovFin: Financing for innovative companies

UK PROGRAMS:
- Innovate UK: Grants and loans for innovative businesses
- SEIS/EIS: Tax relief for investors (50%/30% income tax relief)
- British Business Bank: £12.5B in programs for small businesses

SINGAPORE/ASIA:
- Enterprise Development Grant (EDG): Up to 50% of qualifying costs
- Startup SG Founder: S$30,000 grant for first-time founders
- InnoHub by Enterprise Singapore`,
    source: "IBM watsonx Knowledge Base — Global Government Programs v2.5",
    lastUpdated: "2024-03-15",
  },
];

// ── Legal Requirements Knowledge ───────────────────────────────────────────────
export const LEGAL_DOCS: KnowledgeDocument[] = [
  {
    id: "legal-001",
    domain: "legal-requirements",
    title: "Startup Legal Structure and Incorporation Guide",
    tags: ["incorporation", "LLC", "corporation", "private limited", "legal structure", "founder agreement"],
    content: `BUSINESS ENTITY COMPARISON:

INDIA:
- Private Limited Company (Pvt Ltd): Best for VC-funded startups
  • Separate legal entity, limited liability
  • Min 2 directors, 2 shareholders
  • Incorporation cost: ₹10,000-₹25,000 (including MCA fees)
  • Compliance: Annual ROC filing, board meetings, statutory audit
  • Timeline: 7-15 days via SPICe+ portal (mca.gov.in)

- One Person Company (OPC): For solo founders, easy compliance
  • Single shareholder + director allowed
  • Cannot raise equity funding easily

- LLP (Limited Liability Partnership): For professional services
  • Not ideal for VC funding (cannot issue equity shares)
  • Lower compliance burden than Pvt Ltd

USA:
- Delaware C-Corporation: Industry standard for VC-backed startups
  • Most VCs require Delaware incorporation
  • Cost: $90 state fee + $500-2,000 registered agent + legal fees
  • Stripe Atlas: $500 all-in incorporation

- LLC: Better for bootstrapped/lifestyle businesses
  • Pass-through taxation, simpler compliance
  • Cannot issue preferred stock (VC requirement)

CRITICAL LEGAL DOCUMENTS FOR STARTUPS:
1. Founders' Agreement: Vesting schedule (4-year, 1-year cliff), IP assignment, 
   roles, dispute resolution, exit provisions
2. Employee IP Assignment Agreement: All team members must sign
3. NDA (Non-Disclosure Agreement): Mutual NDAs with vendors/partners
4. Terms of Service + Privacy Policy: Required before any user data collection
5. Advisor Agreement: 0.1-0.5% equity over 2-year vesting for advisors
6. SAFE/Convertible Note: Standard early funding instruments`,
    source: "IBM watsonx Knowledge Base — Startup Legal Framework v3.0",
    lastUpdated: "2024-02-20",
  },
  {
    id: "legal-002",
    domain: "legal-requirements",
    title: "Data Privacy, IP, and Regulatory Compliance",
    tags: ["GDPR", "CCPA", "patent", "trademark", "copyright", "data privacy", "compliance"],
    content: `INTELLECTUAL PROPERTY PROTECTION:

PATENTS:
- Provisional Patent Application: File early to establish priority date ($320 USPTO fee)
- Full Utility Patent: 18-24 months, $10,000-$15,000 with attorney
- India Patent: ₹4,000-₹8,000 filing fee, 2-4 years for grant
- Patent-eligible: Novel inventions, software (in some jurisdictions), processes
- Not eligible: Abstract ideas, laws of nature, mathematical formulas

TRADEMARKS:
- File trademark before public launch
- US: TUSPTO online filing $250-350/class, 8-12 months processing
- India: IPIndia.gov.in, ₹5,000/class for startups, 18-24 months
- Classes: Determine the Nice Classification for your goods/services

DATA PRIVACY COMPLIANCE:
- GDPR (EU): Required if serving EU users; fines up to 4% of global revenue
  • Appoint Data Protection Officer (if processing large-scale personal data)
  • Privacy by Design principles mandatory
  • Data Processing Agreements with all vendors
  
- CCPA (California): Required if >$25M revenue OR >100K California users
  • Right to deletion, opt-out of data sale
  • Privacy Policy must be updated annually

- India DPDP Act 2023: Personal Data Protection, consent framework
  • Data Fiduciary obligations
  • Significant Data Fiduciary designation for large platforms

SECTOR-SPECIFIC REGULATIONS:
- FinTech: RBI guidelines, PCI-DSS, AML/KYC requirements
- HealthTech: HIPAA (US), Clinical Establishments Act (India)
- EdTech: FERPA (US), COPPA for <13 age group
- FoodTech: FSSAI license (India), FDA (US)`,
    source: "IBM watsonx Knowledge Base — Legal Compliance Framework v2.8",
    lastUpdated: "2024-04-01",
  },
];

// ── Revenue Models Knowledge ───────────────────────────────────────────────────
export const REVENUE_MODEL_DOCS: KnowledgeDocument[] = [
  {
    id: "rev-001",
    domain: "revenue-models",
    title: "Startup Revenue Model Playbook",
    tags: ["SaaS", "marketplace", "freemium", "subscription", "unit economics", "LTV", "CAC"],
    content: `PROVEN STARTUP REVENUE MODELS:

1. SUBSCRIPTION (SaaS):
   - Best for: B2B software, tools, platforms
   - Pricing tiers: Freemium → Starter ($X/mo) → Pro ($Y/mo) → Enterprise (custom)
   - Unit Economics targets: LTV:CAC ratio > 3:1, payback period < 12 months
   - Industry benchmarks: Median B2B SaaS CAC $500-$5,000, LTV $2,500-$50,000

2. MARKETPLACE (Take Rate):
   - Best for: Two-sided platforms, service marketplaces
   - Take rate: 5-30% of GMV (Gross Merchandise Value)
   - Examples: Airbnb (3-15%), Etsy (6.5%), Uber (20-25%)
   - Challenge: Cold start problem (must build both sides simultaneously)

3. FREEMIUM:
   - Best for: Consumer apps, developer tools, collaboration software
   - Conversion benchmark: 2-5% free-to-paid is excellent
   - Viral coefficient (K-factor) target: K > 1 for organic growth

4. TRANSACTION / USAGE-BASED:
   - Best for: APIs, cloud services, payment processors
   - Pricing: Per API call, per GB, per transaction
   - Advantage: Scales with customer growth automatically
   - Examples: Stripe (2.9% + $0.30), AWS (consumption-based)

5. ADVERTISING:
   - Best for: High-volume consumer apps, media platforms
   - CPM benchmarks: $1-5 (general), $10-50 (B2B/finance)
   - Requires: 100K+ DAU before meaningful ad revenue

6. ENTERPRISE LICENSING:
   - Best for: Deep tech, data companies, specialized B2B
   - Pricing: Annual contracts $50K-$1M+
   - Requires: Dedicated sales team, longer sales cycles (3-18 months)

UNIT ECONOMICS CALCULATION FRAMEWORK:
- CAC = Total Sales + Marketing Spend ÷ New Customers Acquired
- LTV = ARPU × Gross Margin % ÷ Churn Rate
- Payback Period = CAC ÷ (ARPU × Gross Margin %)
- NRR (Net Revenue Retention): >120% = excellent, >100% = good, <90% = dangerous`,
    source: "IBM watsonx Knowledge Base — Revenue Model Framework v3.5",
    lastUpdated: "2024-03-20",
  },
];

// ── Competitor Analysis Knowledge ──────────────────────────────────────────────
export const COMPETITOR_DOCS: KnowledgeDocument[] = [
  {
    id: "comp-001",
    domain: "competitor-analysis",
    title: "Competitive Intelligence Framework",
    tags: ["competitive analysis", "Porter's Five Forces", "SWOT", "differentiation", "moat"],
    content: `COMPETITIVE ANALYSIS FRAMEWORKS:

PORTER'S FIVE FORCES (for industry attractiveness):
1. Competitive Rivalry: Number and strength of existing competitors
2. Supplier Power: How much leverage suppliers have over pricing
3. Buyer Power: How easily customers can switch to alternatives
4. Threat of Substitutes: Alternative products/services solving the same problem
5. Threat of New Entrants: How easy it is to enter the market

COMPETITIVE MOAT TYPES:
- Network Effects: Value increases with more users (LinkedIn, Airbnb, WhatsApp)
- Switching Costs: High cost to leave (Salesforce CRM, SAP ERP)
- Economies of Scale: Cost advantages at scale (Amazon, Google Cloud)
- Proprietary Technology: Patents, trade secrets, unique algorithms
- Brand/Trust: Years of reputation-building (Apple, IBM, McKinsey)
- Data Moat: Unique dataset that improves product (Palantir, Waze)

COMPETITIVE INTELLIGENCE SOURCES:
- G2, Capterra, Trustpilot: Product reviews and feature comparisons
- SimilarWeb, SEMrush: Traffic and digital marketing intelligence
- LinkedIn: Team size, hiring trends, senior hire announcements
- Crunchbase, PitchBook: Funding history and investor syndicate
- SEC EDGAR: Public company financial filings
- ProductHunt: Product launches and community reception
- Job postings: Reveal strategic priorities (hiring AI engineers = AI focus)
- GitHub: Open-source repos reveal technical choices

BLUE OCEAN STRATEGY — ERRC GRID:
- Eliminate: Factors the industry competes on that should be eliminated
- Reduce: Factors below industry standards
- Raise: Factors above industry standards  
- Create: Factors the industry has never offered`,
    source: "IBM watsonx Knowledge Base — Competitive Intelligence v2.3",
    lastUpdated: "2024-02-14",
  },
];

// ── Risk Management Knowledge ─────────────────────────────────────────────────
export const RISK_DOCS: KnowledgeDocument[] = [
  {
    id: "risk-001",
    domain: "risk-management",
    title: "Startup Risk Assessment Framework",
    tags: ["risk matrix", "mitigation", "market risk", "execution risk", "financial risk"],
    content: `STARTUP RISK CATEGORIES AND MITIGATIONS:

MARKET RISKS:
- Product-Market Fit failure (Probability: High, Impact: Critical)
  Mitigation: Run 50+ customer discovery interviews before building, 
  create MVP in <3 months, measure PMF score (>40% "very disappointed" threshold)

- Market timing risk (entering too early or too late)
  Mitigation: Map technology S-curves, look for "enabling event" (regulation, 
  infrastructure, behavior change) that makes timing right now

EXECUTION RISKS:
- Founder breakup (Probability: Medium, Impact: Critical)
  Mitigation: Clear co-founder agreement, defined roles, equity vesting, 
  board-level dispute resolution mechanism

- Key person dependency
  Mitigation: Document all processes, cross-train team, build redundancy

FINANCIAL RISKS:
- Running out of cash (Probability: High, Impact: Critical)
  Mitigation: Maintain 18-month runway, start fundraising at 12-month runway,
  build 15-20% contingency into all budgets

- Unit economics never becoming positive
  Mitigation: Model unit economics from Day 1, set CAC and LTV targets,
  kill channels that don't achieve 3:1 LTV:CAC within 6 months

COMPETITIVE RISKS:
- Large competitor enters market ("being Google'd")
  Mitigation: Build defensible moat (network effects, data, brand),
  focus on niches incumbents cannot serve profitably

REGULATORY RISKS:
- New regulation disrupts business model
  Mitigation: Engage regulatory consultants early, join industry associations,
  build compliance as a feature (advantage over non-compliant competitors)

RISK SCORING MATRIX:
Score = Probability × Impact
- 9 (High×High): Critical — immediate mitigation required
- 6 (High×Med or Med×High): Serious — mitigation plan needed
- 4 (Med×Med): Moderate — monitor quarterly
- 1-3 (Low×Any): Low — document and accept`,
    source: "IBM watsonx Knowledge Base — Risk Management Framework v2.0",
    lastUpdated: "2024-01-30",
  },
];

// ── Startup Incubators Knowledge ───────────────────────────────────────────────
export const INCUBATOR_DOCS: KnowledgeDocument[] = [
  {
    id: "incub-001",
    domain: "startup-incubators",
    title: "Top Global Startup Accelerators and Incubators",
    tags: ["accelerator", "incubator", "Y Combinator", "Techstars", "500 Startups", "IBM"],
    content: `TOP GLOBAL ACCELERATORS (2024):

Y COMBINATOR (YC) — Mountain View, CA:
- Invests: $500K for 7% equity (standard deal 2024)
- Program: 3-month intensive, batch of ~200 startups
- Demo Day: Access to 1000+ investors
- Alumni network: Airbnb, Stripe, Coinbase, Dropbox, DoorDash
- Application: YC.com — 2x per year (Jan & Jun batches)
- Acceptance rate: ~2%

TECHSTARS — Global (50+ cities):
- Invests: $120K ($20K for 6% equity + $100K convertible note)
- Program: 3-month, mentor-driven program
- Network: 10,000+ mentors, 3,500+ alumni companies
- Focus areas: Mobility, FinTech, Healthcare, Smart Cities

500 STARTUPS — Global:
- Invests: $150K for 6%
- Strong in Southeast Asia, Latin America, Middle East
- Focus: Consumer internet, SaaS, marketplace

IBM ACCELERATOR PROGRAMS:
- IBM Hyper Protect Accelerator: FinTech + HealthTech focus
- IBM LinuxONE Hyper Protect Virtual Servers: Infrastructure for startups
- IBM Startup Program: Access to IBM Cloud credits ($120,000), 
  technical support, go-to-market co-selling
- Apply: ibm.com/partnerworld/startups

INDIA-SPECIFIC ACCELERATORS:
- T-Hub (Hyderabad): Government-backed, 20,000+ sq ft facility
- NASSCOM 10,000 Startups: Largest startup program in India
- Axilor Ventures (Bengaluru): ₹15-20L seed funding
- Venture Catalysts: India's largest angel network
- Social Alpha (Tata Trusts): Social impact startups
- iCreate (Ahmedabad): Government of Gujarat incubator`,
    source: "IBM watsonx Knowledge Base — Incubator Directory v3.1",
    lastUpdated: "2024-04-05",
  },
];

// ── Go-to-Market Knowledge ─────────────────────────────────────────────────────
export const GTM_DOCS: KnowledgeDocument[] = [
  {
    id: "gtm-001",
    domain: "go-to-market",
    title: "Go-to-Market Strategy Playbook",
    tags: ["GTM", "distribution", "growth hacking", "PLG", "SLG", "content marketing", "SEO"],
    content: `GO-TO-MARKET STRATEGY FRAMEWORKS:

PRODUCT-LED GROWTH (PLG):
- Users discover, try, and buy the product themselves
- Examples: Slack, Notion, Figma, Calendly, Zoom
- Best for: B2B tools with viral potential, horizontal SaaS
- Key metrics: Product Qualified Leads (PQLs), activation rate, feature adoption
- Requirements: Freemium or free trial, seamless onboarding (<5 min to value)

SALES-LED GROWTH (SLG):
- Sales reps drive acquisition, demos, and negotiations
- Best for: Enterprise software, complex B2B, high ACV (>$50K/year)
- SDR: Qualifies leads, books demos; AE: Closes deals; CSM: Expands accounts
- CAC: Typically $5,000-$50,000 per enterprise customer

MARKETING-LED GROWTH (SEO/Content):
- Organic search captures high-intent buyers
- SEO timeline: 6-12 months to see significant traffic
- Content types: Blog posts, case studies, comparison pages, calculators
- Benchmark: 50,000+ monthly organic visits → viable content moat

COMMUNITY-LED GROWTH:
- Build engaged community before selling (Developer communities, Slack groups)
- Examples: HashiCorp, dbt Labs, Notion Ambassadors

PARTNERSHIP-LED GROWTH:
- Channel partners, resellers, integration partnerships
- Platform ecosystems: Salesforce AppExchange, Shopify App Store, Slack App Directory

CUSTOMER ACQUISITION CHANNELS (Cost Benchmarks):
- SEO/Content: $50-500 CAC (long-term asset)
- Paid Search (Google Ads): $500-5,000 CAC (B2B)
- LinkedIn Ads: $300-2,000 CAC (B2B, high quality)
- Cold Email Outbound: $100-1,000 CAC (scalable with automation)
- Product Hunt Launch: 1,000-5,000 signups (one-time event)
- App Store Optimization: $1-10 CAC (mobile apps)
- Referral Program: 30-50% lower CAC than paid channels`,
    source: "IBM watsonx Knowledge Base — GTM Strategy Framework v3.3",
    lastUpdated: "2024-03-10",
  },
];

// ── Master Knowledge Base ──────────────────────────────────────────────────────
export const ALL_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  ...MARKET_RESEARCH_DOCS,
  ...FUNDING_DOCS,
  ...GOVERNMENT_SCHEMES_DOCS,
  ...LEGAL_DOCS,
  ...REVENUE_MODEL_DOCS,
  ...COMPETITOR_DOCS,
  ...RISK_DOCS,
  ...INCUBATOR_DOCS,
  ...GTM_DOCS,
];

export const KNOWLEDGE_BASE_META = {
  version: "1.0.0",
  totalDocuments: ALL_KNOWLEDGE_DOCS.length,
  domains: [
    "market-research",
    "funding-options",
    "government-schemes",
    "legal-requirements",
    "revenue-models",
    "competitor-analysis",
    "risk-management",
    "startup-incubators",
    "go-to-market",
  ],
  lastUpdated: "2024-04-15",
};
