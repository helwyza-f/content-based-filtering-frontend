"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const genders = ["Boys", "Girls", "Men", "Unisex", "Women"];

const seasons = ["Fall", "Spring", "Summer", "Winter"];
const usages = [
  "Casual",
  "Ethnic",
  "Formal",
  "Home",
  "Party",
  "Smart Casual",
  "Sports",
  "Travel",
];

type Props = {
  onChange: (filters: Record<string, string>) => void;
};

export default function FilterBar({ onChange }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0); // To reset <Select> components

  const handleChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onChange(updated);
  };

  const handleReset = () => {
    setFilters({});
    onChange({});
    setResetKey((prev) => prev + 1); // Force reset
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select
          key={`gender-${resetKey}`}
          onValueChange={(val) => handleChange("gender", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            {genders.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* <Select
          key={`category-${resetKey}`}
          onValueChange={(val) => handleChange("masterCategory", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Master Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        <Select
          key={`season-${resetKey}`}
          onValueChange={(val) => handleChange("season", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          key={`usage-${resetKey}`}
          onValueChange={(val) => handleChange("usage", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Usage (Style)" />
          </SelectTrigger>
          <SelectContent>
            {usages.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>

      <div className="flex justify-center"></div>
    </div>
  );
}
