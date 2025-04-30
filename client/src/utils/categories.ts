import { IconType } from "react-icons";
import { MdCabin } from "react-icons/md";
import {
  TbCaravan,
  TbTent,
  TbBuildingCottage,
} from "react-icons/tb";
import {
  GiWoodCabin,
  GiMushroomHouse,
  GiCastle,
  GiTreehouse,
} from "react-icons/gi";
import {
  PiWarehouse,
  PiLighthouse,
  PiVan,
} from "react-icons/pi";
import { GoContainer } from "react-icons/go";
import { FaIgloo } from "react-icons/fa";

export type CategoryLabel =
  | "cabin"
  | "tent"
  | "airstream"
  | "cottage"
  | "container"
  | "caravan"
  | "tiny"
  | "magic"
  | "warehouse"
  | "lodge"
  | "treehouse"
  | "dome"
  | "castle";

type Category = {
  label: CategoryLabel;
  icon: IconType;
  displayName: string;
  description?: string;
};

export const categories: Category[] = [
  {
    label: "cabin",
    icon: MdCabin,
    displayName: "Rustic Cabins",
    description: "Cozy retreats nestled in nature.",
  },
  {
    label: "tent",
    icon: TbTent,
    displayName: "Tents & Glamping",
    description: "Sleep under the stars in style.",
  },
  {
    label: "cottage",
    icon: TbBuildingCottage,
    displayName: "Charming Cottages",
    description: "Quaint homes with countryside vibes.",
  },
  {
    label: "lodge",
    icon: GiWoodCabin,
    displayName: "Mountain Lodges",
    description: "Spacious homes perfect for groups.",
  },
  {
    label: "treehouse",
    icon: GiTreehouse,
    displayName: "Treehouses",
    description: "Elevated stays among the treetops.",
  },
  {
    label: "tiny",
    icon: PiLighthouse,
    displayName: "Tiny Homes",
    description: "Minimalist living in compact spaces.",
  },
  {
    label: "magic",
    icon: GiMushroomHouse,
    displayName: "Fantasy Stays",
    description: "Whimsical homes from storybooks.",
  },
  {
    label: "airstream",
    icon: PiVan,
    displayName: "Airstreams & Vans",
    description: "Retro campers with modern flair.",
  },
  {
    label: "caravan",
    icon: TbCaravan,
    displayName: "Caravans",
    description: "Towable comfort on wheels.",
  },
  {
    label: "container",
    icon: GoContainer,
    displayName: "Container Homes",
    description: "Modern industrial-style homes.",
  },
  {
    label: "warehouse",
    icon: PiWarehouse,
    displayName: "Converted Warehouses",
    description: "Spacious urban-style lofts.",
  },
  {
    label: "dome",
    icon: FaIgloo,
    displayName: "Domes & Igloos",
    description:
      "Unique round structures, perfect for stargazing.",
  },
  {
    label: "castle",
    icon: GiCastle,
    displayName: "Castles",
    description:
      "Live like royalty in these majestic stays.",
  },
];
