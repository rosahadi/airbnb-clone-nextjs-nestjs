/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Home } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import CountriesInput from "@/components/input/CountriesInput";
import CategoryList from "@/components/host/CategoryList";
import {
  PropertyError,
  PropertyFormUnion,
} from "@/types/property";

interface BasicInfoTabProps<T extends PropertyFormUnion> {
  isVisible: boolean;
  form: UseFormReturn<T>;
  errors: PropertyError | null;
  navigateTab: () => void;
}

const BasicInfoTab = <T extends PropertyFormUnion>({
  isVisible,
  form,
  errors,
  navigateTab,
}: BasicInfoTabProps<T>) => {
  if (!isVisible) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Home className="text-primary" size={24} />
        <h2 className="text-xl font-semibold">
          Tell us about your place
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name={"name" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Give your place a catchy name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {errors?.name && (
                <p className="text-sm font-medium text-destructive">
                  {errors.name}
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"tagline" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input
                  placeholder="A short description to attract guests"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {errors?.tagline && (
                <p className="text-sm font-medium text-destructive">
                  {errors.tagline}
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <FormField
          control={form.control}
          name={"price" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per night (USD)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    min="1"
                    className="pl-8"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
              {errors?.price && (
                <p className="text-sm font-medium text-destructive">
                  {errors.price}
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"country" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <CountriesInput
                  defaultValue={field.value}
                  onChange={(country: string) =>
                    field.onChange(country)
                  }
                />
              </FormControl>
              <FormMessage />
              {errors?.country && (
                <p className="text-sm font-medium text-destructive">
                  {errors.country}
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      <div className="mt-6">
        <FormField
          control={form.control}
          name={"category" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategoryList
                  selectedCategory={field.value}
                  onCategoryChange={(category: string) =>
                    field.onChange(category)
                  }
                />
              </FormControl>
              <FormMessage />
              {errors?.category && (
                <p className="text-sm font-medium text-destructive">
                  {errors.category}
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      <div className="mt-6">
        <FormField
          control={form.control}
          name={"description" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell potential guests what makes your place special"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {errors?.description && (
                <p className="text-sm font-medium text-destructive">
                  {errors.description}
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          onClick={navigateTab}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Next: Property Details
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoTab;
