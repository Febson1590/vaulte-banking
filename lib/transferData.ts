// ─────────────────────────────────────────────────────────────
//  Vaulte — Global Bank Transfer Data & Helpers
//  Contains: Global bank directory (US ABA + international SWIFT),
//            fee structures, verification simulation,
//            routing number / SWIFT validation
// ─────────────────────────────────────────────────────────────

// ─── Bank Entry ──────────────────────────────────────────────
export interface BankEntry {
  name:           string;
  shortName:      string;
  city:           string;
  country:        string;
  countryCode:    string;   // ISO 3166-1 alpha-2
  countryFlag:    string;   // Emoji flag
  routingNumber?: string;   // ABA routing — US banks only
  swiftCode?:     string;   // SWIFT/BIC — international transfers
  state?:         string;   // US banks only
  logo?:          string;   // Emoji fallback (legacy)
}

// ─── United States ───────────────────────────────────────────
export const US_BANKS: BankEntry[] = [
  // Major National Banks
  { routingNumber: "021000021", name: "JPMorgan Chase Bank",             shortName: "Chase",          city: "Columbus",       state: "OH", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "CHASUS33" },
  { routingNumber: "026009593", name: "Bank of America",                 shortName: "BofA",            city: "Charlotte",      state: "NC", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "BOFAUS3N" },
  { routingNumber: "121000248", name: "Wells Fargo Bank",                shortName: "Wells Fargo",     city: "San Francisco",  state: "CA", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "WFBIUS6S" },
  { routingNumber: "021001088", name: "Citibank",                        shortName: "Citi",            city: "Sioux Falls",    state: "SD", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "CITIUS33" },
  { routingNumber: "091000019", name: "U.S. Bank",                       shortName: "US Bank",         city: "Minneapolis",    state: "MN", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "USBKUS44" },
  { routingNumber: "022000020", name: "HSBC Bank USA",                   shortName: "HSBC USA",        city: "Buffalo",        state: "NY", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "MRMDUS33" },
  { routingNumber: "021302567", name: "TD Bank USA",                     shortName: "TD Bank",         city: "Wilmington",     state: "DE", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "NRTHUS33" },
  { routingNumber: "065000090", name: "Capital One Bank",                shortName: "Capital One",     city: "McLean",         state: "VA", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "HIBKUS44" },
  { routingNumber: "071000013", name: "BMO Harris Bank",                 shortName: "BMO Harris",      city: "Chicago",        state: "IL", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "HATRUS44" },
  { routingNumber: "122105155", name: "Charles Schwab Bank",             shortName: "Schwab Bank",     city: "Reno",           state: "NV", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "SCHBUS66" },
  // Regional Banks
  { routingNumber: "044000037", name: "KeyBank National Association",    shortName: "KeyBank",         city: "Cleveland",      state: "OH", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "KEYBUS33" },
  { routingNumber: "053000219", name: "Truist Bank",                     shortName: "Truist",          city: "Charlotte",      state: "NC", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "SNTRUS3A" },
  { routingNumber: "042000314", name: "Fifth Third Bank",                shortName: "Fifth Third",     city: "Cincinnati",     state: "OH", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "FTBCUS3C" },
  { routingNumber: "071921891", name: "Northern Trust Company",          shortName: "Northern Trust",  city: "Chicago",        state: "IL", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "CNORUS44" },
  { routingNumber: "021200025", name: "Santander Bank USA",              shortName: "Santander USA",   city: "Boston",         state: "MA", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "BSCHUSXX" },
  { routingNumber: "011900254", name: "Citizens Bank",                   shortName: "Citizens",        city: "Providence",     state: "RI", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "CTZIUS33" },
  { routingNumber: "073000228", name: "Regions Bank",                    shortName: "Regions",         city: "Birmingham",     state: "AL", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "UPNBUS44" },
  { routingNumber: "031100089", name: "PNC Bank",                        shortName: "PNC",             city: "Pittsburgh",     state: "PA", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "PNCCUS33" },
  { routingNumber: "124303120", name: "Zions Bancorporation",            shortName: "Zions Bank",      city: "Salt Lake City", state: "UT", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "ZFNBUS55" },
  { routingNumber: "101089742", name: "Commerce Bank",                   shortName: "Commerce Bank",   city: "Kansas City",    state: "MO", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "CBKCUS44" },
  { routingNumber: "053100300", name: "First Horizon Bank",              shortName: "First Horizon",   city: "Memphis",        state: "TN", country: "United States", countryCode: "US", countryFlag: "🇺🇸" },
  // Credit Unions & Online Banks
  { routingNumber: "256074974", name: "Navy Federal Credit Union",       shortName: "Navy Federal",    city: "Vienna",         state: "VA", country: "United States", countryCode: "US", countryFlag: "🇺🇸" },
  { routingNumber: "314089681", name: "USAA Federal Savings Bank",       shortName: "USAA",            city: "San Antonio",    state: "TX", country: "United States", countryCode: "US", countryFlag: "🇺🇸" },
  { routingNumber: "321180379", name: "Alliant Credit Union",            shortName: "Alliant CU",      city: "Chicago",        state: "IL", country: "United States", countryCode: "US", countryFlag: "🇺🇸" },
  { routingNumber: "231372691", name: "Ally Bank",                       shortName: "Ally Bank",       city: "Sandy",          state: "UT", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "ALGRUS33" },
  { routingNumber: "084015767", name: "Chime (The Bancorp Bank)",        shortName: "Chime",           city: "San Francisco",  state: "CA", country: "United States", countryCode: "US", countryFlag: "🇺🇸" },
  { routingNumber: "021214891", name: "Marcus by Goldman Sachs",         shortName: "Marcus GS",       city: "New York",       state: "NY", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "GSCMUS33" },
  { routingNumber: "124085244", name: "SoFi Bank",                       shortName: "SoFi",            city: "San Francisco",  state: "CA", country: "United States", countryCode: "US", countryFlag: "🇺🇸" },
  { routingNumber: "021000128", name: "Goldman Sachs Bank USA",          shortName: "Goldman Sachs",   city: "New York",       state: "NY", country: "United States", countryCode: "US", countryFlag: "🇺🇸", swiftCode: "GSCMUS33" },
];

// ─── International Banks ─────────────────────────────────────
const INTL_BANKS: BankEntry[] = [
  // ── United Kingdom
  { name: "Barclays Bank",                shortName: "Barclays",          city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "BARCGB22" },
  { name: "HSBC UK",                      shortName: "HSBC UK",           city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "MIDLGB22" },
  { name: "Lloyds Bank",                  shortName: "Lloyds",            city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "LOYDGB21" },
  { name: "NatWest Bank",                 shortName: "NatWest",           city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "NWBKGB2L" },
  { name: "Santander UK",                 shortName: "Santander UK",      city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "ABBYGB2L" },
  { name: "Standard Chartered UK",        shortName: "Std Chartered",     city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "SCBLGB2L" },
  { name: "Monzo Bank",                   shortName: "Monzo",             city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "MONZGB2L" },
  { name: "Starling Bank",                shortName: "Starling",          city: "London",         country: "United Kingdom",  countryCode: "GB", countryFlag: "🇬🇧", swiftCode: "SRLGGB3L" },
  // ── Germany
  { name: "Deutsche Bank",                shortName: "Deutsche Bank",     city: "Frankfurt",      country: "Germany",         countryCode: "DE", countryFlag: "🇩🇪", swiftCode: "DEUTDEDB" },
  { name: "Commerzbank",                  shortName: "Commerzbank",       city: "Frankfurt",      country: "Germany",         countryCode: "DE", countryFlag: "🇩🇪", swiftCode: "COBADEBB" },
  { name: "DZ Bank",                      shortName: "DZ Bank",           city: "Frankfurt",      country: "Germany",         countryCode: "DE", countryFlag: "🇩🇪", swiftCode: "GENODEFF" },
  { name: "ING Germany",                  shortName: "ING Germany",       city: "Frankfurt",      country: "Germany",         countryCode: "DE", countryFlag: "🇩🇪", swiftCode: "INGBDEBB" },
  { name: "Sparkasse Berlin",             shortName: "Sparkasse",         city: "Berlin",         country: "Germany",         countryCode: "DE", countryFlag: "🇩🇪", swiftCode: "BELADEBE" },
  { name: "N26 Bank",                     shortName: "N26",               city: "Berlin",         country: "Germany",         countryCode: "DE", countryFlag: "🇩🇪", swiftCode: "NTSBDEB1" },
  // ── France
  { name: "BNP Paribas",                  shortName: "BNP Paribas",       city: "Paris",          country: "France",          countryCode: "FR", countryFlag: "🇫🇷", swiftCode: "BNPAFRPP" },
  { name: "Crédit Agricole",              shortName: "Crédit Agricole",   city: "Paris",          country: "France",          countryCode: "FR", countryFlag: "🇫🇷", swiftCode: "AGRIFRPP" },
  { name: "Société Générale",             shortName: "SocGen",            city: "Paris",          country: "France",          countryCode: "FR", countryFlag: "🇫🇷", swiftCode: "SOGEFRPP" },
  { name: "Crédit Mutuel",                shortName: "Crédit Mutuel",     city: "Strasbourg",     country: "France",          countryCode: "FR", countryFlag: "🇫🇷", swiftCode: "CMCIFRPP" },
  // ── Switzerland
  { name: "UBS",                          shortName: "UBS",               city: "Zurich",         country: "Switzerland",     countryCode: "CH", countryFlag: "🇨🇭", swiftCode: "UBSWCHZH" },
  { name: "Credit Suisse",                shortName: "Credit Suisse",     city: "Zurich",         country: "Switzerland",     countryCode: "CH", countryFlag: "🇨🇭", swiftCode: "CRESCHZZ" },
  { name: "Julius Bär",                   shortName: "Julius Bär",        city: "Zurich",         country: "Switzerland",     countryCode: "CH", countryFlag: "🇨🇭", swiftCode: "BAERCHGG" },
  { name: "PostFinance",                  shortName: "PostFinance",       city: "Bern",           country: "Switzerland",     countryCode: "CH", countryFlag: "🇨🇭", swiftCode: "POFICHBE" },
  // ── Netherlands
  { name: "ING Bank",                     shortName: "ING",               city: "Amsterdam",      country: "Netherlands",     countryCode: "NL", countryFlag: "🇳🇱", swiftCode: "INGBNL2A" },
  { name: "ABN AMRO",                     shortName: "ABN AMRO",          city: "Amsterdam",      country: "Netherlands",     countryCode: "NL", countryFlag: "🇳🇱", swiftCode: "ABNANL2A" },
  { name: "Rabobank",                     shortName: "Rabobank",          city: "Utrecht",        country: "Netherlands",     countryCode: "NL", countryFlag: "🇳🇱", swiftCode: "RABONL2U" },
  // ── Spain
  { name: "Banco Santander",              shortName: "Santander ES",      city: "Santander",      country: "Spain",           countryCode: "ES", countryFlag: "🇪🇸", swiftCode: "BSCHESMMXXX" },
  { name: "BBVA Spain",                   shortName: "BBVA",              city: "Madrid",         country: "Spain",           countryCode: "ES", countryFlag: "🇪🇸", swiftCode: "BBVAESMM" },
  { name: "CaixaBank",                    shortName: "CaixaBank",         city: "Valencia",       country: "Spain",           countryCode: "ES", countryFlag: "🇪🇸", swiftCode: "CAIXESBB" },
  // ── Italy
  { name: "UniCredit",                    shortName: "UniCredit",         city: "Milan",          country: "Italy",           countryCode: "IT", countryFlag: "🇮🇹", swiftCode: "UNCRITMM" },
  { name: "Intesa Sanpaolo",              shortName: "Intesa",            city: "Turin",          country: "Italy",           countryCode: "IT", countryFlag: "🇮🇹", swiftCode: "BCITITM1" },
  // ── Canada
  { name: "Royal Bank of Canada",         shortName: "RBC",               city: "Toronto",        country: "Canada",          countryCode: "CA", countryFlag: "🇨🇦", swiftCode: "ROYCCAT2" },
  { name: "TD Canada Trust",              shortName: "TD Canada",         city: "Toronto",        country: "Canada",          countryCode: "CA", countryFlag: "🇨🇦", swiftCode: "TDOMCATTTOR" },
  { name: "Scotiabank",                   shortName: "Scotiabank",        city: "Toronto",        country: "Canada",          countryCode: "CA", countryFlag: "🇨🇦", swiftCode: "NOSCCATT" },
  { name: "Bank of Montreal (BMO)",       shortName: "BMO",               city: "Montreal",       country: "Canada",          countryCode: "CA", countryFlag: "🇨🇦", swiftCode: "BOFMCAM2" },
  { name: "Canadian Imperial Bank (CIBC)",shortName: "CIBC",              city: "Toronto",        country: "Canada",          countryCode: "CA", countryFlag: "🇨🇦", swiftCode: "CIBCCATT" },
  // ── Australia
  { name: "Commonwealth Bank of Australia",shortName: "CommBank",         city: "Sydney",         country: "Australia",       countryCode: "AU", countryFlag: "🇦🇺", swiftCode: "CTBAAU2S" },
  { name: "ANZ Bank",                     shortName: "ANZ",               city: "Melbourne",      country: "Australia",       countryCode: "AU", countryFlag: "🇦🇺", swiftCode: "ANZBAU3M" },
  { name: "Westpac",                      shortName: "Westpac",           city: "Sydney",         country: "Australia",       countryCode: "AU", countryFlag: "🇦🇺", swiftCode: "WPACAU2S" },
  { name: "National Australia Bank",      shortName: "NAB",               city: "Melbourne",      country: "Australia",       countryCode: "AU", countryFlag: "🇦🇺", swiftCode: "NATAAU33" },
  // ── Japan
  { name: "MUFG Bank (Mitsubishi UFJ)",   shortName: "MUFG",              city: "Tokyo",          country: "Japan",           countryCode: "JP", countryFlag: "🇯🇵", swiftCode: "BOTKJPJT" },
  { name: "Sumitomo Mitsui Banking",      shortName: "SMBC",              city: "Tokyo",          country: "Japan",           countryCode: "JP", countryFlag: "🇯🇵", swiftCode: "SMBCJPJT" },
  { name: "Mizuho Bank",                  shortName: "Mizuho",            city: "Tokyo",          country: "Japan",           countryCode: "JP", countryFlag: "🇯🇵", swiftCode: "MHCBJPJT" },
  // ── China
  { name: "ICBC (Industrial & Commercial Bank)", shortName: "ICBC",       city: "Beijing",        country: "China",           countryCode: "CN", countryFlag: "🇨🇳", swiftCode: "ICBKCNBJ" },
  { name: "Bank of China",                shortName: "BoC",               city: "Beijing",        country: "China",           countryCode: "CN", countryFlag: "🇨🇳", swiftCode: "BKCHCNBJ" },
  { name: "China Construction Bank",      shortName: "CCB",               city: "Beijing",        country: "China",           countryCode: "CN", countryFlag: "🇨🇳", swiftCode: "PCBCCNBJ" },
  { name: "Agricultural Bank of China",   shortName: "ABC China",         city: "Beijing",        country: "China",           countryCode: "CN", countryFlag: "🇨🇳", swiftCode: "ABOCCNBJ" },
  // ── India
  { name: "State Bank of India",          shortName: "SBI",               city: "Mumbai",         country: "India",           countryCode: "IN", countryFlag: "🇮🇳", swiftCode: "SBININBB" },
  { name: "HDFC Bank",                    shortName: "HDFC",              city: "Mumbai",         country: "India",           countryCode: "IN", countryFlag: "🇮🇳", swiftCode: "HDFCINBB" },
  { name: "ICICI Bank",                   shortName: "ICICI",             city: "Mumbai",         country: "India",           countryCode: "IN", countryFlag: "🇮🇳", swiftCode: "ICICINBB" },
  { name: "Axis Bank",                    shortName: "Axis Bank",         city: "Mumbai",         country: "India",           countryCode: "IN", countryFlag: "🇮🇳", swiftCode: "AXISINBB" },
  { name: "Kotak Mahindra Bank",          shortName: "Kotak",             city: "Mumbai",         country: "India",           countryCode: "IN", countryFlag: "🇮🇳", swiftCode: "KKBKINBB" },
  // ── Singapore
  { name: "DBS Bank",                     shortName: "DBS",               city: "Singapore",      country: "Singapore",       countryCode: "SG", countryFlag: "🇸🇬", swiftCode: "DBSSSGSG" },
  { name: "OCBC Bank",                    shortName: "OCBC",              city: "Singapore",      country: "Singapore",       countryCode: "SG", countryFlag: "🇸🇬", swiftCode: "OCBCSGSG" },
  { name: "United Overseas Bank (UOB)",   shortName: "UOB",               city: "Singapore",      country: "Singapore",       countryCode: "SG", countryFlag: "🇸🇬", swiftCode: "UOVBSGSG" },
  // ── Hong Kong
  { name: "HSBC Hong Kong",               shortName: "HSBC HK",           city: "Hong Kong",      country: "Hong Kong",       countryCode: "HK", countryFlag: "🇭🇰", swiftCode: "HSBCHKHH" },
  { name: "Hang Seng Bank",               shortName: "Hang Seng",         city: "Hong Kong",      country: "Hong Kong",       countryCode: "HK", countryFlag: "🇭🇰", swiftCode: "HASEHKHH" },
  { name: "Bank of China (Hong Kong)",    shortName: "BOCHK",             city: "Hong Kong",      country: "Hong Kong",       countryCode: "HK", countryFlag: "🇭🇰", swiftCode: "BKCHHKHH" },
  // ── UAE
  { name: "Emirates NBD",                 shortName: "Emirates NBD",      city: "Dubai",          country: "UAE",             countryCode: "AE", countryFlag: "🇦🇪", swiftCode: "EBILAEAD" },
  { name: "First Abu Dhabi Bank",         shortName: "FAB",               city: "Abu Dhabi",      country: "UAE",             countryCode: "AE", countryFlag: "🇦🇪", swiftCode: "NBADAEAA" },
  { name: "Abu Dhabi Commercial Bank",    shortName: "ADCB",              city: "Abu Dhabi",      country: "UAE",             countryCode: "AE", countryFlag: "🇦🇪", swiftCode: "ADCBAEAA" },
  { name: "Mashreq Bank",                 shortName: "Mashreq",           city: "Dubai",          country: "UAE",             countryCode: "AE", countryFlag: "🇦🇪", swiftCode: "BOMLAEAD" },
  // ── Saudi Arabia
  { name: "Al Rajhi Bank",                shortName: "Al Rajhi",          city: "Riyadh",         country: "Saudi Arabia",    countryCode: "SA", countryFlag: "🇸🇦", swiftCode: "RJHISARI" },
  { name: "Saudi National Bank (SNB)",    shortName: "SNB",               city: "Riyadh",         country: "Saudi Arabia",    countryCode: "SA", countryFlag: "🇸🇦", swiftCode: "NCBKSAJE" },
  { name: "Riyad Bank",                   shortName: "Riyad Bank",        city: "Riyadh",         country: "Saudi Arabia",    countryCode: "SA", countryFlag: "🇸🇦", swiftCode: "RIBLSARI" },
  // ── South Africa
  { name: "Standard Bank South Africa",   shortName: "Standard Bank SA",  city: "Johannesburg",   country: "South Africa",    countryCode: "ZA", countryFlag: "🇿🇦", swiftCode: "SBZAZAJJ" },
  { name: "First National Bank (FNB)",    shortName: "FNB",               city: "Johannesburg",   country: "South Africa",    countryCode: "ZA", countryFlag: "🇿🇦", swiftCode: "FIRNZAJJ" },
  { name: "ABSA Bank",                    shortName: "ABSA",              city: "Johannesburg",   country: "South Africa",    countryCode: "ZA", countryFlag: "🇿🇦", swiftCode: "ABSAZAJJ" },
  { name: "Nedbank",                      shortName: "Nedbank",           city: "Johannesburg",   country: "South Africa",    countryCode: "ZA", countryFlag: "🇿🇦", swiftCode: "NEDNZAJJ" },
  // ── Nigeria
  { name: "Guaranty Trust Bank (GTBank)", shortName: "GTBank",            city: "Lagos",          country: "Nigeria",         countryCode: "NG", countryFlag: "🇳🇬", swiftCode: "GTBINGLA" },
  { name: "Zenith Bank",                  shortName: "Zenith Bank",       city: "Lagos",          country: "Nigeria",         countryCode: "NG", countryFlag: "🇳🇬", swiftCode: "ZEIBNGLA" },
  { name: "Access Bank",                  shortName: "Access Bank",       city: "Lagos",          country: "Nigeria",         countryCode: "NG", countryFlag: "🇳🇬", swiftCode: "ABNGNGLA" },
  { name: "First Bank of Nigeria",        shortName: "First Bank NG",     city: "Lagos",          country: "Nigeria",         countryCode: "NG", countryFlag: "🇳🇬", swiftCode: "FBNINGLA" },
  { name: "United Bank for Africa (UBA)", shortName: "UBA",               city: "Lagos",          country: "Nigeria",         countryCode: "NG", countryFlag: "🇳🇬", swiftCode: "UNAFNGLA" },
  // ── Kenya
  { name: "Equity Bank Kenya",            shortName: "Equity Bank",       city: "Nairobi",        country: "Kenya",           countryCode: "KE", countryFlag: "🇰🇪", swiftCode: "EQBLKENA" },
  { name: "KCB Bank",                     shortName: "KCB",               city: "Nairobi",        country: "Kenya",           countryCode: "KE", countryFlag: "🇰🇪", swiftCode: "KCBLKENX" },
  { name: "Co-operative Bank of Kenya",   shortName: "Co-op Bank",        city: "Nairobi",        country: "Kenya",           countryCode: "KE", countryFlag: "🇰🇪", swiftCode: "COKEKENA" },
  // ── Ghana
  { name: "Ghana Commercial Bank",        shortName: "GCB Bank",          city: "Accra",          country: "Ghana",           countryCode: "GH", countryFlag: "🇬🇭", swiftCode: "GHCBGHAC" },
  { name: "Ecobank Ghana",                shortName: "Ecobank GH",        city: "Accra",          country: "Ghana",           countryCode: "GH", countryFlag: "🇬🇭", swiftCode: "ECOCGHAC" },
  // ── Brazil
  { name: "Banco Bradesco",               shortName: "Bradesco",          city: "São Paulo",      country: "Brazil",          countryCode: "BR", countryFlag: "🇧🇷", swiftCode: "BBDEBRSP" },
  { name: "Itaú Unibanco",                shortName: "Itaú",              city: "São Paulo",      country: "Brazil",          countryCode: "BR", countryFlag: "🇧🇷", swiftCode: "ITAUBRSP" },
  { name: "Banco do Brasil",              shortName: "Banco do Brasil",   city: "Brasília",       country: "Brazil",          countryCode: "BR", countryFlag: "🇧🇷", swiftCode: "BRASBRRJ" },
  { name: "Nubank",                       shortName: "Nubank",            city: "São Paulo",      country: "Brazil",          countryCode: "BR", countryFlag: "🇧🇷", swiftCode: "NUBABRSP" },
  // ── Mexico
  { name: "BBVA México",                  shortName: "BBVA México",       city: "Mexico City",    country: "Mexico",          countryCode: "MX", countryFlag: "🇲🇽", swiftCode: "BCMRMXMM" },
  { name: "Citibanamex",                  shortName: "Banamex",           city: "Mexico City",    country: "Mexico",          countryCode: "MX", countryFlag: "🇲🇽", swiftCode: "BNMXMXMM" },
  { name: "Banorte",                      shortName: "Banorte",           city: "Monterrey",      country: "Mexico",          countryCode: "MX", countryFlag: "🇲🇽", swiftCode: "MENOMXMT" },
  // ── Sweden
  { name: "Nordea Bank Sweden",           shortName: "Nordea",            city: "Stockholm",      country: "Sweden",          countryCode: "SE", countryFlag: "🇸🇪", swiftCode: "NDEASESS" },
  { name: "Handelsbanken",                shortName: "Handelsbanken",     city: "Stockholm",      country: "Sweden",          countryCode: "SE", countryFlag: "🇸🇪", swiftCode: "HANDSESS" },
  { name: "Swedbank",                     shortName: "Swedbank",          city: "Stockholm",      country: "Sweden",          countryCode: "SE", countryFlag: "🇸🇪", swiftCode: "SWEDSESS" },
  // ── Ireland
  { name: "Bank of Ireland",              shortName: "Bank of Ireland",   city: "Dublin",         country: "Ireland",         countryCode: "IE", countryFlag: "🇮🇪", swiftCode: "BOFIIE2D" },
  { name: "Allied Irish Banks (AIB)",     shortName: "AIB",               city: "Dublin",         country: "Ireland",         countryCode: "IE", countryFlag: "🇮🇪", swiftCode: "AIBKIE2D" },
  // ── Portugal
  { name: "Caixa Geral de Depósitos",     shortName: "CGD",               city: "Lisbon",         country: "Portugal",        countryCode: "PT", countryFlag: "🇵🇹", swiftCode: "CGDIPTPL" },
  { name: "Millennium BCP",               shortName: "Millennium BCP",    city: "Lisbon",         country: "Portugal",        countryCode: "PT", countryFlag: "🇵🇹", swiftCode: "BCOMPTPL" },
  // ── Belgium
  { name: "BNP Paribas Fortis",           shortName: "BNP Fortis",        city: "Brussels",       country: "Belgium",         countryCode: "BE", countryFlag: "🇧🇪", swiftCode: "GEBABEBB" },
  { name: "KBC Bank",                     shortName: "KBC",               city: "Brussels",       country: "Belgium",         countryCode: "BE", countryFlag: "🇧🇪", swiftCode: "KREDBEBB" },
  // ── Poland
  { name: "PKO Bank Polski",              shortName: "PKO BP",            city: "Warsaw",         country: "Poland",          countryCode: "PL", countryFlag: "🇵🇱", swiftCode: "BPKOPLPW" },
  { name: "Bank Pekao",                   shortName: "Pekao",             city: "Warsaw",         country: "Poland",          countryCode: "PL", countryFlag: "🇵🇱", swiftCode: "PKOPPLPW" },
  // ── Turkey
  { name: "Ziraat Bankası",               shortName: "Ziraat",            city: "Ankara",         country: "Turkey",          countryCode: "TR", countryFlag: "🇹🇷", swiftCode: "TCZBTR2A" },
  { name: "Garanti BBVA",                 shortName: "Garanti",           city: "Istanbul",       country: "Turkey",          countryCode: "TR", countryFlag: "🇹🇷", swiftCode: "TGBATRIS" },
  // ── New Zealand
  { name: "ANZ New Zealand",              shortName: "ANZ NZ",            city: "Auckland",       country: "New Zealand",     countryCode: "NZ", countryFlag: "🇳🇿", swiftCode: "ANZBNZ22" },
  { name: "Westpac New Zealand",          shortName: "Westpac NZ",        city: "Auckland",       country: "New Zealand",     countryCode: "NZ", countryFlag: "🇳🇿", swiftCode: "WPACNZ2W" },
  // ── South Korea
  { name: "KB Kookmin Bank",              shortName: "KB Bank",           city: "Seoul",          country: "South Korea",     countryCode: "KR", countryFlag: "🇰🇷", swiftCode: "CZNBKRSE" },
  { name: "KEB Hana Bank",                shortName: "Hana Bank",         city: "Seoul",          country: "South Korea",     countryCode: "KR", countryFlag: "🇰🇷", swiftCode: "KOEXKRSE" },
  { name: "Shinhan Bank",                 shortName: "Shinhan",           city: "Seoul",          country: "South Korea",     countryCode: "KR", countryFlag: "🇰🇷", swiftCode: "SHBKKRSE" },
  // ── Malaysia
  { name: "Maybank",                      shortName: "Maybank",           city: "Kuala Lumpur",   country: "Malaysia",        countryCode: "MY", countryFlag: "🇲🇾", swiftCode: "MBBEMYKL" },
  { name: "CIMB Bank",                    shortName: "CIMB",              city: "Kuala Lumpur",   country: "Malaysia",        countryCode: "MY", countryFlag: "🇲🇾", swiftCode: "CIBBMYKL" },
];

// ─── Combined global directory ────────────────────────────────
export const GLOBAL_BANKS: BankEntry[] = [...US_BANKS, ...INTL_BANKS];

// ─── Build lookup map: routing number → bank entry (US only) ─
export const ROUTING_LOOKUP: Record<string, BankEntry> = {};
for (const bank of US_BANKS) {
  if (bank.routingNumber) ROUTING_LOOKUP[bank.routingNumber] = bank;
}

// ─── Routing Number Validation ───────────────────────────────
// ABA routing number checksum: 3×d1 + 7×d2 + d3 + 3×d4 + 7×d5 + d6 + 3×d7 + 7×d8 + d9 ≡ 0 (mod 10)
export function validateRoutingNumber(routing: string): { valid: boolean; message?: string } {
  const clean = routing.replace(/\D/g, "");
  if (clean.length !== 9) {
    return { valid: false, message: "Routing number must be exactly 9 digits." };
  }
  const d = clean.split("").map(Number);
  const checksum = 3 * d[0] + 7 * d[1] + d[2] +
                   3 * d[3] + 7 * d[4] + d[5] +
                   3 * d[6] + 7 * d[7] + d[8];
  if (checksum % 10 !== 0) {
    return { valid: false, message: "Invalid routing number. Please double-check." };
  }
  return { valid: true };
}

// Lookup bank by routing number (exact match from US directory)
export function lookupBank(routing: string): BankEntry | null {
  const clean = routing.replace(/\D/g, "");
  return ROUTING_LOOKUP[clean] ?? null;
}

// ─── Global Bank Search ──────────────────────────────────────
// Searches US + international banks by name, shortName, city,
// country, routing number, or SWIFT/BIC code.
export function searchBanks(query: string): BankEntry[] {
  if (!query.trim()) return GLOBAL_BANKS.slice(0, 10);
  const q = query.toLowerCase();
  const results = GLOBAL_BANKS.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.shortName.toLowerCase().includes(q) ||
    b.city.toLowerCase().includes(q) ||
    b.country.toLowerCase().includes(q) ||
    (b.routingNumber ?? "").startsWith(q) ||
    (b.swiftCode ?? "").toLowerCase().startsWith(q) ||
    b.countryCode.toLowerCase() === q
  );
  // Prioritise names/shortNames that start with the query
  results.sort((a, b) => {
    const aFirst = a.name.toLowerCase().startsWith(q) || a.shortName.toLowerCase().startsWith(q) ? 0 : 1;
    const bFirst = b.name.toLowerCase().startsWith(q) || b.shortName.toLowerCase().startsWith(q) ? 0 : 1;
    return aFirst - bFirst;
  });
  return results.slice(0, 10);
}

// ─── Account Number Validation ───────────────────────────────
export function validateAccountNumber(acct: string): { valid: boolean; message?: string } {
  const clean = acct.replace(/\D/g, "");
  if (clean.length < 4 || clean.length > 17) {
    return { valid: false, message: "Account number must be 4–17 digits." };
  }
  return { valid: true };
}

// Mask account number for display: ••••• 4821
export function maskAccountNumber(acct: string): string {
  const clean = acct.replace(/\D/g, "");
  if (clean.length <= 4) return `••••• ${clean}`;
  return `••••• ${clean.slice(-4)}`;
}

// ─── Transfer Fee Structure ──────────────────────────────────
export interface FeeInfo {
  fee: number;
  feeLabel: string;
  deliveryTime: string;
  deliveryLabel: string;
}

export function getTransferFees(type: "internal_vaulte" | "ach" | "wire", amount: number): FeeInfo {
  switch (type) {
    case "internal_vaulte":
      return { fee: 0, feeLabel: "Free", deliveryTime: "instant", deliveryLabel: "Instant" };
    case "ach":
      return { fee: 0, feeLabel: "Free", deliveryTime: "1–3 business days", deliveryLabel: "1–3 Business Days" };
    case "wire":
      return { fee: 15, feeLabel: "$15.00", deliveryTime: "same day", deliveryLabel: "Same Business Day" };
  }
}

// ─── Simulated Recipient Verification ────────────────────────
export type VerificationStatus = "verified" | "name_mismatch" | "unverified";

export interface VerificationResult {
  status:   VerificationStatus;
  label:    string;
  sublabel: string;
  color:    string;
  bg:       string;
  border:   string;
}

interface SeedRecord { recipientName: string; }

// Seeded verification records: key = `${routingNumber}_${last4}`
const SEED_RECORDS: Record<string, SeedRecord> = {
  "021000021_4821": { recipientName: "Sarah Johnson" },
  "021000021_7734": { recipientName: "James Wilson" },
  "121000248_2290": { recipientName: "Emily Chen" },
  "026009593_1122": { recipientName: "Marcus Davis" },
  "031100089_5593": { recipientName: "Olivia Torres" },
  "065000090_8847": { recipientName: "David Kim" },
  "044000037_3361": { recipientName: "Priya Patel" },
  "256074974_7722": { recipientName: "Robert Nguyen" },
  "314089681_9910": { recipientName: "Lauren Scott" },
  "042000314_6630": { recipientName: "Anthony Brown" },
};

export function simulateVerification(
  routingNumber: string,
  accountNumber: string,
  recipientName: string
): VerificationResult {
  const cleanRouting = routingNumber.replace(/\D/g, "");
  const cleanAcct    = accountNumber.replace(/\D/g, "");
  const last4        = cleanAcct.slice(-4);
  const key          = `${cleanRouting}_${last4}`;
  const seed         = SEED_RECORDS[key];

  if (!seed) {
    return { status: "unverified", label: "Unable to Verify", sublabel: "Name confirmation not available. Proceed with caution.", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  }

  const normalize   = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const inputName   = normalize(recipientName);
  const seedName    = normalize(seed.recipientName);

  if (inputName === seedName) {
    return { status: "verified", label: "Name Verified", sublabel: "Recipient name matches bank records.", color: "#059669", bg: "#F0FDF4", border: "#BBF7D0" };
  }

  const inputParts   = inputName.split(" ").filter(Boolean);
  const seedParts    = seedName.split(" ").filter(Boolean);
  const partialMatch = inputParts.some(p => seedParts.includes(p));

  if (partialMatch) {
    return { status: "name_mismatch", label: "Partial Name Match", sublabel: "Some details matched, but full name confirmation failed.", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  }

  return { status: "name_mismatch", label: "Name Not Confirmed", sublabel: "Recipient name did not match bank records. Please verify.", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
}
