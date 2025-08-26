"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    // role?: string | null; // <- kalau nanti mau dipakai tinggal uncomment
  };
  avatarUrl: string | null;
};

export default function ProfileClient({ id, profile, avatarUrl }: Props) {
  console.log(id);
  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {avatarUrl && (
            <div className="w-28 h-28 rounded-full overflow-hidden mx-auto">
              <Image
                src={avatarUrl}
                alt="Profile Image"
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-gray-700 capitalize">
              Gender: {profile.gender || "-"}
            </p>
            <p className="text-gray-700 capitalize">
              Skin Tone: {profile.skin_tone || "-"}
            </p>
            <p className="text-gray-700">
              Tinggi: {profile.tinggi ? `${profile.tinggi} cm` : "-"}
            </p>
            <p className="text-gray-700">
              Berat: {profile.berat ? `${profile.berat} kg` : "-"}
            </p>
            {/* <p className="text-gray-700">Role: {profile.role || "user"}</p> */}
          </div>
          <div className="text-center">
            <Link href="/profile/edit">
              <Button>Edit Profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
