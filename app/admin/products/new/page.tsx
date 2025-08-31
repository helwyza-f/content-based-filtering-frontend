"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type Attributes = {
  gender: string;
  master_category: string;
  sub_category: string;
  article_type: string;
  base_colour: string;
  season: string;
  usage: string;
  product_display_name: string;
};

export default function OutfitAdminPage() {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAttributes(null);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoadingExtract(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/products/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to extract attributes");
        toast.error(data.error || "Failed to extract attributes");
        return;
      }

      setAttributes(data.attributes);
      toast.success("Attributes extracted successfully!");
    } catch (err) {
      setError("Error extracting attributes");
      toast.error("Error extracting attributes");
    } finally {
      setLoadingExtract(false);
    }
  };

  const handleSave = async () => {
    if (!file || !attributes) return;
    setLoadingSave(true);
    setError(null);

    try {
      const filePath = `products/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) {
        setError("Upload failed: " + uploadError.message);
        toast.error("Upload failed: " + uploadError.message);
        setLoadingSave(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      const { error: dbError } = await supabase.from("products").insert({
        image_link: imageUrl,
        created_at: new Date().toISOString(), // ✅ masukin created_at manual
        ...attributes,
      });

      if (dbError) {
        setError("DB insert failed: " + dbError.message);
        toast.error("DB insert failed: " + dbError.message);
        return;
      }

      toast.success("Outfit saved successfully!");
      setFile(null);
      setPreview(null);
      setAttributes(null);
      router.refresh();
      router.push("/admin/products");
    } catch (err) {
      setError("Error saving outfit");
      toast.error("Error saving outfit");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Outfit Admin</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          {/* Upload button */}
          <div className="flex flex-col gap-2">
            <Label>Upload Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {file ? "Change Image" : "Choose Image"}
            </Button>
          </div>

          {preview && (
            <div className="mt-4 flex justify-center">
              <Image
                src={preview}
                alt="preview"
                width={200}
                height={200}
                className="rounded-lg border"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleExtract}
            disabled={!file || loadingExtract}
            className="flex items-center gap-2"
          >
            {loadingExtract && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingExtract ? "Extracting..." : "Extract Attributes"}
          </Button>

          {attributes && (
            <div className="space-y-2">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={attributes.product_display_name}
                  onChange={(e) =>
                    setAttributes({
                      ...attributes,
                      product_display_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Input
                  value={attributes.gender}
                  onChange={(e) =>
                    setAttributes({ ...attributes, gender: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Master Category</Label>
                <Input
                  value={attributes.master_category}
                  onChange={(e) =>
                    setAttributes({
                      ...attributes,
                      master_category: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Sub Category</Label>
                <Input
                  value={attributes.sub_category}
                  onChange={(e) =>
                    setAttributes({
                      ...attributes,
                      sub_category: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Article Type</Label>
                <Input
                  value={attributes.article_type}
                  onChange={(e) =>
                    setAttributes({
                      ...attributes,
                      article_type: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Base Colour</Label>
                <Input
                  value={attributes.base_colour}
                  onChange={(e) =>
                    setAttributes({
                      ...attributes,
                      base_colour: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Season</Label>
                <Input
                  value={attributes.season}
                  onChange={(e) =>
                    setAttributes({ ...attributes, season: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Usage</Label>
                <Input
                  value={attributes.usage}
                  onChange={(e) =>
                    setAttributes({ ...attributes, usage: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={loadingSave}
                className="flex items-center gap-2"
              >
                {loadingSave && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingSave ? "Saving..." : "Save Outfit"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
