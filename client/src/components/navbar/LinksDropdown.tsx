"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { links } from "@/utils/links";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  SignOutLink,
} from "../auth/AuthBtnLink";
import { useAuth } from "@/stores/authStore";
import Avatar from "../Avatar";

function LinksDropdown() {
  const { user } = useAuth();
  const isAdminUser = user?.roles?.includes("ADMIN");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 pl-3 pr-2 rounded-full border border-gray-300 hover:shadow-md transition-all"
        >
          <Menu className="h-4 w-4" />
          <Avatar src="" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 mt-2 p-2 rounded-xl shadow-lg"
        align="end"
        sideOffset={5}
      >
        <SignedOut>
          <DropdownMenuItem
            asChild
            className="py-3 cursor-pointer focus:bg-gray-100 w-full"
          >
            <SignInButton mode="modal">
              <span className="font-medium w-full text-left">
                Log in
              </span>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="py-3 cursor-pointer focus:bg-gray-100"
          >
            <SignUpButton mode="modal">
              <span className="font-medium w-full text-left">
                Sign up
              </span>
            </SignUpButton>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem className="py-3 cursor-pointer focus:bg-gray-100">
            <Link href="/help" className="w-full text-left">
              Help
            </Link>
          </DropdownMenuItem>
        </SignedOut>
        <SignedIn>
          <div className="pb-2">
            <DropdownMenuItem className="py-3 cursor-pointer font-medium focus:bg-gray-100">
              <Link href="/profile" className="w-full">
                {user?.name || "Profile"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 cursor-pointer focus:bg-gray-100">
              <Link href="/trips" className="w-full">
                Trips
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 cursor-pointer focus:bg-gray-100">
              <Link href="/wishlists" className="w-full">
                Wishlists
              </Link>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="my-1" />
          {isAdminUser && (
            <>
              <DropdownMenuItem className="py-3 cursor-pointer focus:bg-gray-100">
                <Link href="/admin" className="w-full">
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
            </>
          )}
          <div className="pt-1">
            {links.map((link) => {
              if (link.label === "admin" && !isAdminUser)
                return null;
              if (
                ["profile", "trips", "wishlists"].includes(
                  link.label
                )
              )
                return null;
              return (
                <DropdownMenuItem
                  key={link.href}
                  className="py-2 cursor-pointer focus:bg-gray-100"
                >
                  <Link
                    href={link.href}
                    className="capitalize w-full"
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            asChild
            className="py-3 cursor-pointer focus:bg-gray-100"
          >
            <div className="w-full">
              <SignOutLink />
            </div>
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LinksDropdown;
