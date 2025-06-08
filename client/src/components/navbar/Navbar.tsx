"use client";
import Logo from "./Logo";
import NavSearch from "./NavSearch";
import Container from "../Container";
import LinksDropdown from "./LinksDropdown";
import { User } from "@/types/user";

interface NavbarProps {
  currentUser?: User | null;
}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <div className="fixed w-full bg-white z-10 shadow-sm">
      <div className="py-4 border-b-[1px]">
        <Container>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <Logo />
            </div>

            <div className="hidden lg:block flex-1 max-w-[34.4rem] mx-auto px-2">
              <NavSearch />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="lg:hidden">
                <NavSearch />
              </div>

              <LinksDropdown />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Navbar;
