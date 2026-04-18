export interface PropertyOwnerJson {
  name: string;
  phone: string;
  whatsapp: string;
}

export interface PropertyFeaturesJson {
  water: boolean;
  electricity: boolean;
  wifi: boolean;
  parking: boolean;
  security: boolean;
  kitchen: boolean;
}

export interface PropertyJson {
  id: string;
  title: string;
  type: "room" | "studio" | "apartment";
  style: "simple" | "modern";
  furnished: "furnished" | "unfurnished";
  price: number;
  location: string;
  neighborhood: string;
  description: string;
  images: string[];
  features: PropertyFeaturesJson;
  owner: PropertyOwnerJson;
  views: number;
  contacts: number;
  createdAt: string;
  isFeatured: boolean;
}

export interface UserJson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "visitor" | "user" | "owner";
  avatar?: string;
}
