export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  deliveryDays: number;
  isServiceable: boolean;
  cashOnDeliveryAvailable: boolean;
  courierPartner: string;
}

// Representative Indian Postal regions & metro hubs mapping
const PINCODE_ZONES: Record<string, { city: string; state: string; days: number }> = {
  // Metro & Major Cities
  "110001": { city: "New Delhi", state: "Delhi", days: 3 },
  "110002": { city: "Central Delhi", state: "Delhi", days: 3 },
  "122001": { city: "Gurugram", state: "Haryana", days: 3 },
  "201301": { city: "Noida", state: "Uttar Pradesh", days: 3 },
  "400001": { city: "Mumbai", state: "Maharashtra", days: 3 },
  "400050": { city: "Bandra, Mumbai", state: "Maharashtra", days: 3 },
  "411001": { city: "Pune", state: "Maharashtra", days: 4 },
  "560001": { city: "Bengaluru", state: "Karnataka", days: 3 },
  "560034": { city: "Koramangala, Bengaluru", state: "Karnataka", days: 3 },
  "500001": { city: "Hyderabad", state: "Telangana", days: 3 },
  "600001": { city: "Chennai", state: "Tamil Nadu", days: 4 },
  "700001": { city: "Kolkata", state: "West Bengal", days: 4 },
  "380001": { city: "Ahmedabad", state: "Gujarat", days: 4 },
  "302001": { city: "Jaipur", state: "Rajasthan", days: 4 },
  "800001": { city: "Patna", state: "Bihar", days: 4 },
  "834001": { city: "Ranchi", state: "Jharkhand", days: 4 },
  "226001": { city: "Lucknow", state: "Uttar Pradesh", days: 4 },
  "462001": { city: "Bhopal", state: "Madhya Pradesh", days: 4 },
  "682001": { city: "Kochi", state: "Kerala", days: 5 },
  "781001": { city: "Guwahati", state: "Assam", days: 5 },
  "751001": { city: "Bhubaneswar", state: "Odisha", days: 4 },
  "160017": { city: "Chandigarh", state: "Punjab / Haryana", days: 3 },
};

const REGION_PREFIX_MAP: Record<string, { region: string; defaultDays: number }> = {
  "1": { region: "North India (Delhi / NCR / Punjab / Haryana)", defaultDays: 3 },
  "2": { region: "Uttar Pradesh & Uttarakhand", defaultDays: 4 },
  "3": { region: "West India (Rajasthan & Gujarat)", defaultDays: 4 },
  "4": { region: "West & Central (Maharashtra / MP / Goa)", defaultDays: 4 },
  "5": { region: "South India (Karnataka / Andhra / Telangana)", defaultDays: 4 },
  "6": { region: "South India (Tamil Nadu & Kerala)", defaultDays: 5 },
  "7": { region: "East & North East (West Bengal / Assam / Odisha)", defaultDays: 5 },
  "8": { region: "East India (Bihar & Jharkhand)", defaultDays: 4 },
};

export function lookupPincode(pincode: string): PincodeInfo {
  const cleanCode = pincode.trim();
  
  if (!/^\d{6}$/.test(cleanCode)) {
    return {
      pincode: cleanCode,
      city: "",
      state: "",
      deliveryDays: 0,
      isServiceable: false,
      cashOnDeliveryAvailable: false,
      courierPartner: "Delhivery / BlueDart / India Post",
    };
  }

  // Exact match in high-density catalog
  if (PINCODE_ZONES[cleanCode]) {
    const zone = PINCODE_ZONES[cleanCode];
    return {
      pincode: cleanCode,
      city: zone.city,
      state: zone.state,
      deliveryDays: zone.days,
      isServiceable: true,
      cashOnDeliveryAvailable: true,
      courierPartner: "Delhivery / Shiprocket Express",
    };
  }

  // Fallback by zone prefix
  const firstDigit = cleanCode.charAt(0);
  const zoneInfo = REGION_PREFIX_MAP[firstDigit] || { region: "India Domestic", defaultDays: 5 };

  return {
    pincode: cleanCode,
    city: `Serviceable Area (${cleanCode})`,
    state: zoneInfo.region,
    deliveryDays: zoneInfo.defaultDays,
    isServiceable: true,
    cashOnDeliveryAvailable: true,
    courierPartner: "Delhivery / India Post Speed Post",
  };
}

export function calculateShippingFee(subtotal: number, freeShippingThreshold = 699, flatRate = 60): number {
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }
  return flatRate;
}
