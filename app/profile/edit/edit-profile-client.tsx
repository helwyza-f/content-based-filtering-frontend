"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

type Props = {
  userId: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    skin_tone: string | null;
    avatar_url?: string | null;
  } | null;
};

export default function EditProfileClient({ userId, profile }: Props) {
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [skinTone, setSkinTone] = useState(profile?.skin_tone ?? "");

  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("userId", userId);
      if (photo) {
        formData.append("image", photo);
      }

      const res = await fetch("/api/update-profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update profile");

      router.push("/profile");
    } catch (err) {
      alert("Update failed");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
  if (!photo) {
    toast.warning("Please select a photo first.");
    return;
  }

  setScanLoading(true);

  const formData = new FormData();
  formData.append("image", photo);

  try {
    const res = await fetch("/api/extract-attributes", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      setGender(result.gender);
      setSkinTone(result.skin_tone);
      toast.success("Attributes extracted successfully!");
    } else {
      toast.error(result.error || "Failed to extract attributes");
    }
  } catch (err) {
    console.error("Error during AI scan:", err);
    toast.error("AI scan failed. Please try again.");
  } finally {
    setScanLoading(false);
  }
};



  return (
    <div className="max-w-xl mx-auto space-y-6 p-4">
      <div className="text-center space-y-2">
        {preview && (
          <div className="w-40 h-40 mx-auto relative">
            <Image
              src={preview}
              alt="Profile Preview"
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
        )}
      </div>

      <div>
        <Label>First Name</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <Label>Last Name</Label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>

      <div>
        <Label>Upload Photo</Label>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleScan}
          disabled={!photo || scanLoading}
        >
          {scanLoading ? "Scanning..." : "Scan with AI"}
        </Button>
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {(gender || skinTone) && (
        <div className="bg-muted p-4 rounded-md">
          <p>
            <span className="font-semibold">Gender:</span> {gender || "-"}
          </p>
          <p>
            <span className="font-semibold">Skin Tone:</span> {skinTone || "-"}
          </p>
        </div>
      )}
    </div>
  );
}
