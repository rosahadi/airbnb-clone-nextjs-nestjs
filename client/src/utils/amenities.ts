import { IconType } from "react-icons";
import {
  FiCloud,
  FiTruck,
  FiZap,
  FiWind,
  FiSun,
  FiCoffee,
  FiFeather,
  FiAirplay,
  FiTrello,
  FiBox,
  FiAnchor,
  FiDroplet,
  FiMapPin,
  FiSunrise,
  FiSunset,
  FiMusic,
  FiHeadphones,
  FiFilm,
  FiTv,
  FiWifi,
  FiShield,
  FiCamera,
  FiGlobe,
  FiBatteryCharging,
  FiSmile,
} from "react-icons/fi";

export type Amenity = {
  name: string;
  icon: IconType;
  selected: boolean;
};

export const amenities: Amenity[] = [
  {
    name: "wifi signal from a nearby beehive",
    icon: FiWifi,
    selected: false,
  },
  {
    name: "fire pit with a mind of its own",
    icon: FiZap,
    selected: false,
  },
  {
    name: "cloud storage (real clouds)",
    icon: FiCloud,
    selected: false,
  },
  {
    name: "squirrel valet service",
    icon: FiTruck,
    selected: false,
  },
  {
    name: "natural air conditioning (open field)",
    icon: FiBox,
    selected: false,
  },
  {
    name: "espresso brewed over campfire",
    icon: FiCoffee,
    selected: false,
  },
  {
    name: "sun-powered shower (may vary by season)",
    icon: FiFeather,
    selected: false,
  },
  {
    name: "fancy log chairs",
    icon: FiSun,
    selected: false,
  },
  {
    name: "music provided by birds",
    icon: FiMusic,
    selected: false,
  },
  {
    name: "bed made of ethically sourced leaves",
    icon: FiAnchor,
    selected: false,
  },
  {
    name: "first aid kit (signed by a scout leader)",
    icon: FiTv,
    selected: false,
  },
  {
    name: "charging rock (solar-enhanced)",
    icon: FiBatteryCharging,
    selected: false,
  },
  {
    name: "moonlit movie projector (just imagine)",
    icon: FiFilm,
    selected: false,
  },
  {
    name: "sunrise hammock experience",
    icon: FiSunrise,
    selected: false,
  },
  {
    name: "fireflies as night lamps",
    icon: FiDroplet,
    selected: false,
  },
  {
    name: "grill blessed by forest spirits",
    icon: FiWind,
    selected: false,
  },
  {
    name: "breeze-powered kitchenette",
    icon: FiAirplay,
    selected: false,
  },
  {
    name: "tree stump picnic lounge",
    icon: FiMapPin,
    selected: false,
  },
  {
    name: "forest-approved utensils (sticks)",
    icon: FiHeadphones,
    selected: false,
  },
  {
    name: "emotional support squirrel",
    icon: FiSmile,
    selected: false,
  },
  {
    name: "panoramic forest photo zone",
    icon: FiCamera,
    selected: false,
  },
  {
    name: "global wildlife access",
    icon: FiGlobe,
    selected: false,
  },
  {
    name: "bear-repellent charm (probably fake)",
    icon: FiShield,
    selected: false,
  },
  {
    name: "camp heating system (aka campfire)",
    icon: FiTrello,
    selected: false,
  },
  {
    name: "natural light electricity",
    icon: FiSunset,
    selected: false,
  },
];

export const conservativeAmenities: Amenity[] = [
  { name: "wifi", icon: FiWifi, selected: false },
  { name: "fire pit", icon: FiZap, selected: false },
  { name: "cloud storage", icon: FiCloud, selected: false },
  { name: "parking", icon: FiTruck, selected: false },
  {
    name: "air conditioning",
    icon: FiBox,
    selected: false,
  },
  {
    name: "coffee machine",
    icon: FiCoffee,
    selected: false,
  },
  { name: "hot shower", icon: FiFeather, selected: false },
  { name: "outdoor seating", icon: FiSun, selected: false },
  {
    name: "natural soundscape",
    icon: FiMusic,
    selected: false,
  },
  { name: "bed linens", icon: FiAnchor, selected: false },
  { name: "first aid kit", icon: FiTv, selected: false },
  {
    name: "charging station",
    icon: FiBatteryCharging,
    selected: false,
  },
  { name: "movie setup", icon: FiFilm, selected: false },
  { name: "hammock", icon: FiSunrise, selected: false },
  { name: "lanterns", icon: FiDroplet, selected: false },
  { name: "bbq grill", icon: FiWind, selected: false },
  { name: "kitchenette", icon: FiAirplay, selected: false },
  { name: "picnic table", icon: FiMapPin, selected: false },
  {
    name: "cooking utensils",
    icon: FiHeadphones,
    selected: false,
  },
  { name: "staff on site", icon: FiSmile, selected: false },
  { name: "photo spot", icon: FiCamera, selected: false },
  {
    name: "international guests",
    icon: FiGlobe,
    selected: false,
  },
  { name: "security", icon: FiShield, selected: false },
  { name: "heating", icon: FiTrello, selected: false },
  { name: "solar power", icon: FiSunset, selected: false },
];
