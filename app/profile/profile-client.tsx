"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    skin_tone: string | null;
    tinggi: number | null;
    berat: number | null;
  };
  avatarUrl: string | null;
};

export default function ProfileClient({ id, profile, avatarUrl }: Props) {
  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {/* Avatar / Full Body Model */}
      {avatarUrl ? (
        <div className="relative w-full max-w-sm mx-auto aspect-[9/12] max-h-[400px] rounded-xl overflow-hidden shadow-md">
          <Image
            src={avatarUrl}
            alt="Profile Avatar"
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto aspect-[9/12] max-h-[400px] rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
          No Avatar
        </div>
      )}

      {/* User Info */}
      <Card className="w-full max-w-sm mx-auto  ">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-600">
              {profile.gender ? `Gender: ${profile.gender}` : "Gender: -"}
            </p>
            <p className="text-gray-600">
              {profile.skin_tone
                ? `Skin Tone: ${profile.skin_tone}`
                : "Skin Tone: -"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-gray-500">Tinggi</p>
              <p className="text-lg font-semibold">
                {profile.tinggi ? `${profile.tinggi} cm` : "-"}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-gray-500">Berat</p>
              <p className="text-lg font-semibold">
                {profile.berat ? `${profile.berat} kg` : "-"}
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link href="/profile/edit">
              <Button className="w-full">Edit Profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
