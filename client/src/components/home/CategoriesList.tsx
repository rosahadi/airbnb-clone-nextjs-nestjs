import { categories } from "@/utils/categories";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Link from "next/link";

function CategoriesList({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  const searchTerm = search ? `&search=${search}` : "";

  return (
    <section>
      <ScrollArea className="py-6 -mx-4 px-4">
        <div className="flex gap-x-8">
          {categories.map((item) => {
            const isActive = item.label === category;
            return (
              <Link
                key={item.label}
                href={`/?category=${item.label}${searchTerm}`}
                className="min-w-[80px]"
              >
                <article
                  className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "text-primary border-b-2 border-primary pb-2"
                      : "text-gray-500 hover:text-gray-900 pb-2 hover:border-b-2 hover:border-gray-200"
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 mb-2 ${
                      isActive ? "text-primary" : ""
                    }`}
                  />
                  <p className="capitalize text-xs font-medium">
                    {item.label}
                  </p>
                </article>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default CategoriesList;
