const stateToAirports = {
    "Alabama": ["BHM", "HSV", "MGM", "MOB"], // Birmingham, Huntsville, Montgomery, Mobile
    "Alaska": ["ANC", "FAI", "JNU", "SEA"], // Anchorage, Fairbanks, Juneau, plus Seattle (common hub)
    "Arizona": ["PHX", "TUS", "SDL"], // Phoenix, Tucson, Scottsdale (private/charter)
    "Arkansas": ["XNA", "LIT", "FSM"], // Northwest Arkansas, Little Rock, Fort Smith
    "California": ["LAX", "SFO", "SAN", "SJC", "OAK", "SMF", "BUR", "ONT", "SNA", "LGB"], // Major CA airports
    "Colorado": ["DEN", "COS", "GJT"], // Denver, Colorado Springs, Grand Junction
    "Connecticut": ["BDL", "HVN"], // Bradley (Hartford), Tweed New Haven
    "Delaware": ["ILG"], // Wilmington (small, near Philadelphia)
    "District of Columbia": ["DCA", "IAD", "BWI"], // Reagan, Dulles, Baltimore-Washington
    "Florida": ["MIA", "FLL", "TPA", "MCO", "RSW", "JAX", "PBI"], // Miami, Fort Lauderdale, Tampa, Orlando, Southwest Florida, Jacksonville, Palm Beach
    "Georgia": ["ATL", "SAV", "AGS", "MCN"], // Atlanta, Savannah, Augusta, Macon
    "Hawaii": ["HNL", "OGG", "KOA", "LIH"], // Honolulu, Maui, Kona, Lihue
    "Idaho": ["BOI", "IDA"], // Boise, Idaho Falls
    "Illinois": ["ORD", "MDW", "SPI", "RFD"], // O’Hare, Midway, Springfield, Rockford
    "Indiana": ["IND", "SBN"], // Indianapolis, South Bend
    "Iowa": ["DSM", "CID", "MLI"], // Des Moines, Cedar Rapids, Moline
    "Kansas": ["ICT", "MCI", "FOE"], // Wichita, Kansas City, Topeka
    "Kentucky": ["CVG", "SDF", "LEX"], // Cincinnati/Northern KY, Louisville, Lexington
    "Louisiana": ["MSY", "BTR", "LFT"], // New Orleans, Baton Rouge, Lafayette
    "Maine": ["PWM", "BGR"], // Portland, Bangor
    "Maryland": ["BWI", "MTN"], // Baltimore-Washington, Martin State
    "Massachusetts": ["BOS", "ORH", "EWB"], // Boston Logan, Worcester, New Bedford
    "Michigan": ["DTW", "GRR", "MBS", "AZO"], // Detroit, Grand Rapids, Saginaw, Kalamazoo
    "Minnesota": ["MSP", "DLH", "RST"], // Minneapolis-St Paul, Duluth, Rochester
    "Mississippi": ["JAN", "GPT"], // Jackson, Gulfport
    "Missouri": ["STL", "MCI", "SGF"], // St. Louis, Kansas City, Springfield
    "Montana": ["BIL", "GTF", "MSO"], // Billings, Great Falls, Missoula
    "Nebraska": ["OMA", "LNK"], // Omaha, Lincoln
    "Nevada": ["LAS", "RNO"], // Las Vegas, Reno
    "New Hampshire": ["MHT", "CON"], // Manchester, Concord (small)
    "New Jersey": ["EWR", "ACY", "TTN"], // Newark, Atlantic City, Trenton-Mercer
    "New Mexico": ["ABQ", "SRR"], // Albuquerque, Santa Rosa (small)
    "New York": ["JFK", "LGA", "EWR", "BUF", "ROC", "SYR", "ALB"], // JFK, LaGuardia, Newark, Buffalo, Rochester, Syracuse, Albany
    "North Carolina": ["CLT", "RDU", "GSO", "ILM"], // Charlotte, Raleigh-Durham, Greensboro, Wilmington
    "North Dakota": ["FAR", "GFK"], // Fargo, Grand Forks
    "Ohio": ["CLE", "CMH", "CVG", "DAY"], // Cleveland, Columbus, Cincinnati, Dayton
    "Oklahoma": ["OKC", "TUL"], // Oklahoma City, Tulsa
    "Oregon": ["PDX", "EUG"], // Portland, Eugene
    "Pennsylvania": ["PHL", "PIT", "AVP", "MDT"], // Philadelphia, Pittsburgh, Wilkes-Barre/Scranton, Harrisburg
    "Rhode Island": ["PVD"], // Providence
    "South Carolina": ["CHS", "GSP", "CAE"], // Charleston, Greenville-Spartanburg, Columbia
    "South Dakota": ["FSD", "RAP"], // Sioux Falls, Rapid City
    "Tennessee": ["BNA", "MEM", "CHA"], // Nashville, Memphis, Chattanooga
    "Texas": ["DFW", "IAH", "AUS", "SAT", "DAL", "HOU"], // Dallas-Fort Worth, Houston, Austin, San Antonio, Dallas Love, Houston Hobby
    "Utah": ["SLC", "PVU"], // Salt Lake City, Provo (small)
    "Vermont": ["BTV"], // Burlington
    "Virginia": ["DCA", "ORF", "RIC"], // Reagan, Norfolk, Richmond
    "Washington": ["SEA", "GEG", "PDX"], // Seattle, Spokane, Portland (nearby)
    "West Virginia": ["CRW", "HTS"], // Charleston, Huntington
    "Wisconsin": ["MKE", "MSN", "GRB"], // Milwaukee, Madison, Green Bay
    "Wyoming": ["JAC"], // Jackson Hole
  };
  
  export default stateToAirports;
  