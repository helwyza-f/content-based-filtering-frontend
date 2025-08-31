"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, Wand2 } from "lucide-react";

type Props = {
  userId: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    skin_tone: string | null;
    tinggi?: number | null;
    berat?: number | null;
    avatar_url?: string | null;
  } | null;
};

export default function EditProfileClient({ userId, profile }: Props) {
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [closeupPreview, setCloseupPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [skinTone, setSkinTone] = useState(profile?.skin_tone ?? "");
  const [tinggi, setTinggi] = useState(profile?.tinggi ?? 160);
  const [berat, setBerat] = useState(profile?.berat ?? 55);

  const router = useRouter();

  // 🔹 Auto-save ke backend
  const autoSaveProfile = async (updatedData: any) => {
    try {
      const formData = new FormData();
      formData.append("first_name", updatedData.first_name ?? firstName);
      formData.append("last_name", updatedData.last_name ?? lastName);
      formData.append("userId", userId);
      formData.append("gender", updatedData.gender ?? gender);
      formData.append("skin_tone", updatedData.skin_tone ?? skinTone);
      formData.append("tinggi", String(updatedData.tinggi ?? tinggi));
      formData.append("berat", String(updatedData.berat ?? berat));
      if (updatedData.photo) {
        formData.append("image", updatedData.photo);
      }

      await fetch("/api/update-profile", {
        method: "POST",
        body: formData,
      });

      router.refresh();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // 🔹 Upload close-up foto → extract attribute
  // handleFileChange di EditProfileClient.tsx
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setCloseupPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", userId);

      const res = await fetch("/api/upload-closeup", {
        // 🔹 API baru
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setGender(result.gender);
        setSkinTone(result.skin_tone);
        toast.success("Attributes extracted & close-up saved!");

        await autoSaveProfile({
          gender: result.gender,
          skin_tone: result.skin_tone,
        });
      } else {
        toast.error(result.error || "Failed to extract attributes");
      }
    } catch (err) {
      console.error("Error during AI scan:", err);
      toast.error("AI scan failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Generate full-body avatar
  const handleGenerateAvatar = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (photo) formData.append("image", photo);
      formData.append("userId", userId);
      formData.append("gender", gender);
      formData.append("skin_tone", skinTone);
      formData.append("tinggi", String(tinggi));
      formData.append("berat", String(berat));

      const res = await fetch("/api/generate-avatar", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setAvatarPreview(result.avatar_url);
        toast.success("Avatar generated!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to generate avatar");
      }
    } catch (err) {
      console.error("Error generate avatar:", err);
      toast.error("Avatar generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 p-4">
      {/* STEP 1: Upload Close-Up */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Step 1: Upload Close-up Photo</h2>
        <input
          type="file"
          accept="image/*"
          id="avatarUpload"
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="avatarUpload"
          className="cursor-pointer w-32 h-32 mx-auto relative block"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border flex items-center justify-center relative">
            {closeupPreview ? (
              <Image
                src={closeupPreview}
                alt="Closeup Preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Upload className="w-6 h-6" />
                <span className="text-xs">Upload</span>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
        </label>
        {(gender || skinTone) && (
          <div className="bg-muted p-3 rounded-md text-sm space-y-1 text-center">
            <p>
              <span className="font-semibold">Gender:</span> {gender || "-"}
            </p>
            <p>
              <span className="font-semibold">Skin Tone:</span>{" "}
              {skinTone || "-"}
            </p>
          </div>
        )}
      </section>

      {/* STEP 2: Edit Details */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Step 2: Edit Details</h2>
        <div>
          <Label>First Name</Label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={(e) => autoSaveProfile({ first_name: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={(e) => autoSaveProfile({ last_name: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <Label>Tinggi (cm)</Label>
          <Input
            type="number"
            value={tinggi}
            onChange={(e) => setTinggi(Number(e.target.value))}
            onBlur={() => autoSaveProfile({ tinggi })}
            disabled={loading}
          />
        </div>
        <div>
          <Label>Berat (kg)</Label>
          <Input
            type="number"
            value={berat}
            onChange={(e) => setBerat(Number(e.target.value))}
            onBlur={() => autoSaveProfile({ berat })}
            disabled={loading}
          />
        </div>
      </section>

      {/* STEP 3: Generate Full Avatar */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Step 3: Generate Avatar</h2>
        <Button
          onClick={handleGenerateAvatar}
          disabled={loading}
          className="flex items-center gap-2 w-full"
        >
          <Wand2 className="w-4 h-4" />
          Generate Full-body Avatar
        </Button>

        {avatarPreview && (
          <>
            <div className="relative w-full max-w-sm mx-auto aspect-[9/12] rounded-lg overflow-hidden shadow">
              <Image
                src={avatarPreview}
                alt="Generated Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => router.push("/profile")}>Next</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
