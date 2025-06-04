type NavLink = {
  href: string;
  label: string;
};

export const links: NavLink[] = [
  { href: "/", label: "home" },
  { href: "/favorites", label: "favorites" },
  { href: "/trips", label: "your trips" },
  {
    href: "/host/reservations",
    label: "your reservations",
  },
  { href: "/host/create", label: "Airbnb your home" },
  { href: "/host/listings", label: "manage listings" },
  { href: "/admin", label: "admin" },
  { href: "/profile", label: "profile" },
];
