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
