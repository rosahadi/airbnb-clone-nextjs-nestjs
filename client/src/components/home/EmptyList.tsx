import Link from "next/link";
import { Button } from "../ui/button";
import { HiOutlineEmojiSad } from "react-icons/hi";

function EmptyList({
  heading = "No properties found",
  message = "Try adjusting your search or filters",
  btnText = "Back to home",
}: {
  heading?: string;
  message?: string;
  btnText?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 text-gray-400">
        <HiOutlineEmojiSad size={64} />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {heading}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      <Button
        asChild
        className="capitalize bg-primary hover:bg-primary-hover text-white"
        size="lg"
      >
        <Link href="/">{btnText}</Link>
      </Button>
    </div>
  );
}

export default EmptyList;
