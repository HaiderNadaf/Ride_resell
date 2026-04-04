const BASE_URL = (
  process.env.EXPO_PUBLIC_LOCATION_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL_location ||
  "https://markhet-internal-ngfs.onrender.com"
).replace(/\/$/, "");

const API = (path: string) => {
  if (!BASE_URL || !BASE_URL.startsWith("http")) {
    throw new Error("Invalid location API URL");
  }
  return `${BASE_URL}${path}`;
};

const unique = (items: Array<string | undefined | null>) =>
  Array.from(
    new Set(items.map((item) => item?.trim()).filter(Boolean) as string[]),
  );

const extractList = async (response: Response): Promise<string[]> => {
  try {
    if (!response.ok) {
      console.error(`Location API error: ${response.status}`);
      return [];
    }

    const json = await response.json();
    const data = json?.data?.data ?? json?.data ?? json;

    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return (
            item.name ||
            item.state ||
            item.district ||
            item.taluk ||
            item.village ||
            item.title ||
            ""
          );
        }
        return "";
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to parse location data:", error);
    return [];
  }
};

export async function fetchIndiaStates(): Promise<string[]> {
  if (!BASE_URL) return [];
  const response = await fetch(API("/newlocations/states"));
  if (!response.ok) return [];
  return extractList(response);
}

export async function fetchIndiaDistricts(state: string): Promise<string[]> {
  if (!BASE_URL) return [];
  const response = await fetch(
    API(`/newlocations/districts?state=${encodeURIComponent(state)}`),
  );
  if (!response.ok) return [];
  return extractList(response);
}

export async function fetchIndiaTalukas(
  state: string,
  district: string,
): Promise<string[]> {
  if (!BASE_URL) return [];
  const response = await fetch(
    API(
      `/newlocations/taluks?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`,
    ),
  );
  if (!response.ok) return [];
  return extractList(response);
}

export async function fetchIndiaVillages(
  state: string,
  district: string,
  taluk: string,
): Promise<string[]> {
  if (!BASE_URL) return [];
  const response = await fetch(
    API(
      `/newlocations/villages?state=${encodeURIComponent(state)}&district=${encodeURIComponent(
        district,
      )}&taluk=${encodeURIComponent(taluk)}`,
    ),
  );
  if (!response.ok) return [];
  return extractList(response);
}

export async function lookupIndiaPincode(
  pincode: string,
): Promise<IndiaPincodeLookup | null> {
  const trimmed = pincode.trim();
  if (!/^\d{6}$/.test(trimmed)) return null;

  const response = await fetch(
    `https://api.postalpincode.in/pincode/${encodeURIComponent(trimmed)}`,
  );
  const json = await response.json();
  const root = Array.isArray(json) ? json[0] : json;
  const offices = Array.isArray(root?.PostOffice) ? root.PostOffice : [];

  if (!offices.length || String(root?.Status || "").toLowerCase() === "error") {
    return null;
  }

  const first = offices[0];
  const talukOptions = unique(
    offices.map(
      (office: any) => office.Division || office.Name || office.Region,
    ),
  );
  const areaOptions = unique(offices.map((office: any) => office.Name));

  return {
    state: first.State?.trim() || "",
    district: first.District?.trim() || "",
    talukOptions: talukOptions.length ? talukOptions : areaOptions,
    areaOptions,
  };
}
