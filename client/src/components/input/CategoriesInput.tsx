import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/utils/categories";

const name = "category";

function CategoriesInput({
  defaultValue,
  onChange,
}: {
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const handleValueChange = (value: string) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="mb-2">
      <Label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Property Category
      </Label>
      <Select
        defaultValue={defaultValue || categories[0].label}
        name={name}
        onValueChange={handleValueChange}
        required
      >
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <SelectItem
                key={item.label}
                value={item.label}
              >
                <span className="flex items-center gap-2">
                  <Icon size={18} />
                  {item.displayName}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CategoriesInput;
