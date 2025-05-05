import React, { useEffect, useState } from "react";
import { formattedCountries } from "@/utils/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CountriesInput({
  defaultValue,
  onChange,
}: {
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [componentKey, setComponentKey] = useState(
    Date.now()
  );
  const [currentValue, setCurrentValue] = useState(
    defaultValue || ""
  );

  useEffect(() => {
    if (defaultValue && defaultValue !== currentValue) {
      setCurrentValue(defaultValue);
      setComponentKey(Date.now());
    }
  }, [defaultValue, currentValue]);

  const handleValueChange = (value: string) => {
    setCurrentValue(value);
    onChange?.(value);
  };

  // Find the country object for the selected code
  const selectedCountry = formattedCountries.find(
    (c) => c.code === currentValue
  );
  const displayText = selectedCountry
    ? `${selectedCountry.flag} ${selectedCountry.name}`
    : "Select a country";

  return (
    <div className="mb-2" key={componentKey}>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        required
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a country">
            {displayText}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {formattedCountries.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              <span className="flex items-center gap-2">
                {item.flag} {item.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CountriesInput;
