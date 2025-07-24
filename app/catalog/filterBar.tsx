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

const usages = [
  "Formal",
  "Casual",
  "Smart Casual",
  "Sports",

];

type Props = {
  onChange: (filters: Record<string, string>) => void;
};

export default function FilterBar({ onChange }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0); // To reset <Select> component

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
    </div>
  );
}
