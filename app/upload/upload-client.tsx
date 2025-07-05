"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function UploadClient() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!photo) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", photo);

    try {
      const res = await fetch("/api/extract-attributes", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      const { gender, skin_tone } = result;

      router.push(`/catalog`);
    } catch (err) {
      alert("Failed to extract attributes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="rounded-xl max-h-80 object-cover"
        />
      )}
      <Button onClick={handleSubmit} disabled={!photo || loading}>
        {loading ? "Processing..." : "Analyze with AI"}
      </Button>
    </div>
  );
}
