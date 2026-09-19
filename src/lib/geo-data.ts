/**
 * Comprehensive Indian States & Agricultural Districts Dataset.
 * Standardized for crop yield modeling, weather geocoding, and APMC Mandi tracking.
 */

export interface StateGeoData {
  name: string;
  districts: string[];
}

export const INDIAN_STATES_AND_DISTRICTS: StateGeoData[] = [
  {
    name: 'Gujarat',
    districts: [
      'Surat',
      'Ahmedabad',
      'Rajkot',
      'Vadodara',
      'Junagadh',
      'Anand',
      'Mehsana',
      'Bhavnagar',
      'Jamnagar',
      'Gandhinagar',
      'Kutch',
      'Banaskantha',
      'Amreli',
      'Bharuch',
      'Navsari',
      'Patan',
      'Porbandar',
      'Surendranagar',
      'Sabarkantha',
      'Kheda',
      'Dahod',
      'Panchmahal',
      'Valsad',
      'Gir Somnath',
      'Botad',
      'Morbi',
      'Aravalli'
    ]
  },
  {
    name: 'Maharashtra',
    districts: [
      'Pune',
      'Nashik',
      'Nagpur',
      'Aurangabad (Chhatrapati Sambhaji Nagar)',
      'Kolhapur',
      'Solapur',
      'Amravati',
      'Ahmednagar',
      'Satara',
      'Sangli',
      'Jalgaon',
      'Latur',
      'Nanded',
      'Akola',
      'Dhule',
      'Thane',
      'Mumbai',
      'Wardha',
      'Yavatmal',
      'Buldhana',
      'Parbhani',
      'Beed',
      'Osmanabad (Dharashiv)',
      'Chandrapur',
      'Gondia',
      'Bhandara',
      'Ratnagiri',
      'Sindhudurg'
    ]
  },
  {
    name: 'Punjab',
    districts: [
      'Ludhiana',
      'Amritsar',
      'Jalandhar',
      'Patiala',
      'Bathinda',
      'Hoshiarpur',
      'Mohali (SAS Nagar)',
      'Firozpur',
      'Sangrur',
      'Gurdaspur',
      'Pathankot',
      'Mansa',
      'Fazilka',
      'Moga',
      'Barnala',
      'Faridkot',
      'Fatehgarh Sahib',
      'Kapurthala',
      'Rupnagar',
      'Sri Muktsar Sahib',
      'Tarn Taran',
      'Malerkotla'
    ]
  },
  {
    name: 'Haryana',
    districts: [
      'Karnal',
      'Hisar',
      'Ambala',
      'Rohtak',
      'Panipat',
      'Sirsa',
      'Sonipat',
      'Yamunanagar',
      'Kurukshetra',
      'Bhiwani',
      'Fatehabad',
      'Jind',
      'Kaithal',
      'Gurugram',
      'Faridabad',
      'Rewari',
      'Palwal',
      'Jhajjar',
      'Mahendragarh',
      'Nuh',
      'Panchkula',
      'Charkhi Dadri'
    ]
  },
  {
    name: 'Madhya Pradesh',
    districts: [
      'Indore',
      'Bhopal',
      'Ujjain',
      'Jabalpur',
      'Gwalior',
      'Sagar',
      'Dewas',
      'Ratlam',
      'Hoshangabad (Narmadapuram)',
      'Sehore',
      'Khandwa',
      'Khargone',
      'Dhar',
      'Mandsaur',
      'Neemuch',
      'Vidisha',
      'Chhindwara',
      'Rewa',
      'Satna',
      'Morena',
      'Bhind',
      'Shivpuri',
      'Guna',
      'Betul',
      'Hardoi',
      'Burhanpur',
      'Barwani',
      'Shajapur'
    ]
  },
  {
    name: 'Uttar Pradesh',
    districts: [
      'Lucknow',
      'Kanpur',
      'Varanasi',
      'Agra',
      'Prayagraj (Allahabad)',
      'Meerut',
      'Bareilly',
      'Aligarh',
      'Moradabad',
      'Saharanpur',
      'Gorakhpur',
      'Ayodhya (Faizabad)',
      'Jhansi',
      'Muzaffarnagar',
      'Mathura',
      'Budaun',
      'Barabanki',
      'Sitapur',
      'Lakhimpur Kheri',
      'Hardoi',
      'Bijnor',
      'Bulandshahr',
      'Shahjahanpur',
      'Farrukhabad',
      'Etawah',
      'Mainpuri',
      'Pilibhit',
      'Rampur',
      'Unnao',
      'Banda',
      'Mirzapur',
      'Ghazipur',
      'Jaunpur'
    ]
  },
  {
    name: 'Rajasthan',
    districts: [
      'Jaipur',
      'Jodhpur',
      'Kota',
      'Udaipur',
      'Bikaner',
      'Ajmer',
      'Alwar',
      'Sriganganagar',
      'Bharatpur',
      'Bhilwara',
      'Sikar',
      'Pali',
      'Chittorgarh',
      'Nagaur',
      'Hanumangarh',
      'Tonk',
      'Jhunjhunu',
      'Barmer',
      'Jalore',
      'Banswara',
      'Churu',
      'Dausa',
      'Sawai Madhopur',
      'Dholpur',
      'Karauli',
      'Baran',
      'Bundi',
      'Jhalawar'
    ]
  },
  {
    name: 'Karnataka',
    districts: [
      'Bengaluru Urban',
      'Bengaluru Rural',
      'Mandya',
      'Dharwad',
      'Belagavi',
      'Mysuru',
      'Shivamogga',
      'Tumakuru',
      'Hassan',
      'Davangere',
      'Ballari',
      'Vijayapura',
      'Kalaburagi',
      'Bagalkote',
      'Chitradurga',
      'Kolar',
      'Chikkamagaluru',
      'Udupi',
      'Dakshina Kannada',
      'Uttara Kannada',
      'Haveri',
      'Gadag',
      'Koppal',
      'Raichur',
      'Yadgir',
      'Bidar',
      'Chamarajanagar',
      'Ramanagara',
      'Chikkaballapura',
      'Kodagu'
    ]
  },
  {
    name: 'Tamil Nadu',
    districts: [
      'Coimbatore',
      'Madurai',
      'Thanjavur',
      'Salem',
      'Tiruchirappalli',
      'Erode',
      'Tirunelveli',
      'Dindigul',
      'Vellore',
      'Cuddalore',
      'Villupuram',
      'Kanchipuram',
      'Dharmapuri',
      'Theni',
      'Namakkal',
      'Thiruvarur',
      'Nagapattinam',
      'Pudukkottai',
      'Sivaganga',
      'Virudhunagar',
      'Ramanathapuram',
      'Thoothukudi',
      'Tiruppur',
      'Krishnagiri',
      'Tiruvannamalai',
      'Chengalpattu',
      'Tenkasi',
      'Karur',
      'Perambalur',
      'Ariyalur'
    ]
  },
  {
    name: 'Andhra Pradesh',
    districts: [
      'Guntur',
      'Vijayawada (NTR)',
      'Visakhapatnam',
      'Kurnool',
      'Nellore',
      'Kakinada',
      'Tirupati',
      'Anantapur',
      'Eluru',
      'Kadapa (YSR)',
      'Ongole (Prakasam)',
      'Srikakulam',
      'Vizianagaram',
      'East Godavari (Rajahmundry)',
      'West Godavari (Bhimavaram)',
      'Chittoor',
      'Nandyal',
      'Annamayya',
      'Palnadu',
      'Bapatla',
      'Konaseema'
    ]
  },
  {
    name: 'Telangana',
    districts: [
      'Hyderabad',
      'Warangal',
      'Karimnagar',
      'Nizamabad',
      'Khammam',
      'Nalgonda',
      'Mahabubnagar',
      'Siddipet',
      'Adilabad',
      'Suryapet',
      'Jagtial',
      'Kamareddy',
      'Mancherial',
      'Peddapalli',
      'Sangareddy',
      'Medak',
      'Rangareddy',
      'Vikarabad',
      'Wanaparthy',
      'Nagarkurnool',
      'Bhadradri Kothagudem'
    ]
  },
  {
    name: 'West Bengal',
    districts: [
      'Purba Bardhaman (Burdwan)',
      'Paschim Bardhaman',
      'Hooghly',
      'Nadia',
      'Murshidabad',
      'North 24 Parganas',
      'South 24 Parganas',
      'Bankura',
      'Birbhum',
      'Malda',
      'Paschim Medinipur',
      'Purba Medinipur',
      'Jalpaiguri',
      'Darjeeling',
      'Alipurduar',
      'Cooch Behar',
      'Uttar Dinajpur',
      'Dakshin Dinajpur',
      'Howrah',
      'Kolkata',
      'Purulia'
    ]
  },
  {
    name: 'Bihar',
    districts: [
      'Patna',
      'Gaya',
      'Bhagalpur',
      'Muzaffarpur',
      'Darbhanga',
      'Purnia',
      'Rohtas',
      'Samastipur',
      'Nalanda',
      'Vaishali',
      'Begusarai',
      'Katihar',
      'Bhojpur (Ara)',
      'Saran (Chhapra)',
      'East Champaran (Motihari)',
      'West Champaran (Bettiah)',
      'Madhubani',
      'Sitamarhi',
      'Siwan',
      'Gopalganj',
      'Saharsa',
      'Madhepura',
      'Supaul',
      'Araria',
      'Kishanganj',
      'Buxar',
      'Banka',
      'Munger',
      'Khagaria',
      'Jamui',
      'Nawada',
      'Aurangabad',
      'Jehanabad'
    ]
  },
  {
    name: 'Kerala',
    districts: [
      'Palakkad',
      'Alappuzha',
      'Kochi (Ernakulam)',
      'Thrissur',
      'Kottayam',
      'Kozhikode',
      'Wayanad',
      'Idukki',
      'Kollam',
      'Thiruvananthapuram',
      'Malappuram',
      'Kannur',
      'Kasaragod',
      'Pathanamthitta'
    ]
  },
  {
    name: 'Odisha',
    districts: [
      'Khurda (Bhubaneswar)',
      'Cuttack',
      'Bargarh',
      'Sambalpur',
      'Balasore',
      'Ganjam',
      'Puri',
      'Bhadrak',
      'Koraput',
      'Bolangir',
      'Kalahandi',
      'Mayurbhanj',
      'Jajpur',
      'Kendujhar (Keonjhar)',
      'Dhenkanal',
      'Angul',
      'Sundargarh',
      'Nayagarh',
      'Jagatsinghpur',
      'Kendrapara'
    ]
  },
  {
    name: 'Assam',
    districts: [
      'Kamrup Metropolitan (Guwahati)',
      'Dibrugarh',
      'Cachar (Silchar)',
      'Jorhat',
      'Nagaon',
      'Tinsukia',
      'Sonitpur (Tezpur)',
      'Barpeta',
      'Dhubri',
      'Golaghat',
      'Sivasagar',
      'Lakhimpur',
      'Darrang',
      'Goalpara',
      'Nalbari',
      'Kamrup Rural',
      'Karimganj',
      'Hailakandi',
      'Kokrajhar',
      'Bongaigaon'
    ]
  },
  {
    name: 'Chhattisgarh',
    districts: [
      'Raipur',
      'Bilaspur',
      'Durg',
      'Rajnandgaon',
      'Janjgir-Champa',
      'Bastar',
      'Korba',
      'Raigarh',
      'Dhamtari',
      'Mahasamund',
      'Kanker',
      'Kabirdham (Kawardha)',
      'Bemetara',
      'Balod',
      'Baloda Bazar',
      'Surguja',
      'Surajpur',
      'Balrampur'
    ]
  },
  {
    name: 'Jharkhand',
    districts: [
      'Ranchi',
      'East Singhbhum (Jamshedpur)',
      'Dhanbad',
      'Bokaro',
      'Hazaribagh',
      'Deoghar',
      'Giridih',
      'Dumka',
      'Palamu',
      'Ramgarh',
      'Koderma',
      'Chatra',
      'Garhwa',
      'West Singhbhum (Chaibasa)',
      'Seraikela Kharsawan',
      'Lohardaga',
      'Gumla',
      'Simdega',
      'Godda',
      'Sahebganj',
      'Pakur',
      'Jamtara'
    ]
  },
  {
    name: 'Himachal Pradesh',
    districts: [
      'Shimla',
      'Kangra',
      'Mandi',
      'Kullu',
      'Solan',
      'Sirmaur',
      'Chamba',
      'Una',
      'Hamirpur',
      'Bilaspur',
      'Kinnaur',
      'Lahaul and Spiti'
    ]
  },
  {
    name: 'Uttarakhand',
    districts: [
      'Dehradun',
      'Haridwar',
      'Udham Singh Nagar',
      'Nainital',
      'Almora',
      'Pauri Garhwal',
      'Tehri Garhwal',
      'Chamoli',
      'Rudraprayag',
      'Uttarkashi',
      'Pithoragarh',
      'Champawat',
      'Bageshwar'
    ]
  }
];

export const ALL_STATE_NAMES = INDIAN_STATES_AND_DISTRICTS.map((s) => s.name);

export function getDistrictsForState(stateName: string): string[] {
  const found = INDIAN_STATES_AND_DISTRICTS.find(
    (s) => s.name.toLowerCase() === (stateName || '').toLowerCase()
  );
  return found ? found.districts : INDIAN_STATES_AND_DISTRICTS[0].districts;
}

export function parseLocationString(locationStr: string): { state: string; district: string } {
  if (!locationStr) return { state: 'Gujarat', district: 'Surat' };
  const parts = locationStr.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    const district = parts[0];
    const stateCandidate = parts[1];
    const matchedState = ALL_STATE_NAMES.find(
      (s) => s.toLowerCase() === stateCandidate.toLowerCase()
    );
    return {
      state: matchedState || stateCandidate || 'Gujarat',
      district: district || 'Surat',
    };
  }
  const single = parts[0];
  const isState = ALL_STATE_NAMES.find((s) => s.toLowerCase() === single.toLowerCase());
  if (isState) {
    return { state: isState, district: getDistrictsForState(isState)[0] };
  }
  return { state: 'Gujarat', district: single || 'Surat' };
}
