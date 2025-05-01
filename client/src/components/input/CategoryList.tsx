import React from "react";
import { categories } from "@/utils/categories";

interface CategoryListProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Property Category
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((item) => {
          const Icon = item.icon;
          const isSelected =
            selectedCategory === item.label;

          return (
            <div
              key={item.label}
              onClick={() => onCategoryChange(item.label)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer
                border transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }
              `}
            >
              <Icon
                size={24}
                className={
                  isSelected
                    ? "text-primary"
                    : "text-gray-500"
                }
              />
              <span className="mt-2 text-sm font-medium">
                {item.displayName}
              </span>
            </div>
          );
        })}
      </div>
      {/* Hidden input to store the value for form submission */}
      <input
        type="hidden"
        name="category"
        value={selectedCategory}
      />
    </div>
  );
};

export default CategoryList;
