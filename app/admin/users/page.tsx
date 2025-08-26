"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Search, Pencil, Trash } from "lucide-react";

// ===== Types =====
type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  skin_tone: string | null;
  avatar_url: string | null;
  role: string | null;
};

export default function AdminUsersPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Edit Modal
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // Delete Dialog
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, gender, skin_tone, avatar_url, role"
        )
        .order("first_name", { ascending: true });

      if (error) {
        console.error(error);
        toast.error("Gagal memuat data pengguna");
      } else {
        setUsers((data || []) as User[]);
      }
      setLoading(false);
    };

    // initial fetch
    fetchUsers();

    // optional: realtime subscription (comment out if not using Realtime)
    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          // re-fetch on any change
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
      const roleMatch =
        roleFilter === "all" || (u.role ?? "").toLowerCase() === roleFilter;
      const genderMatch =
        genderFilter === "all" ||
        (u.gender ?? "").toLowerCase() === genderFilter;
      const searchMatch =
        !query ||
        name.includes(query) ||
        (u.role ?? "").toLowerCase().includes(query) ||
        (u.gender ?? "").toLowerCase().includes(query) ||
        (u.skin_tone ?? "").toLowerCase().includes(query);
      return roleMatch && genderMatch && searchMatch;
    });
  }, [users, q, roleFilter, genderFilter]);

  // ===== Handlers =====
  const onOpenEdit = (user: User) => {
    setEditing(user);
    setOpenEdit(true);
  };

  const onSubmitEdit = async (form: Partial<User>) => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      first_name: form.first_name ?? editing.first_name,
      last_name: form.last_name ?? editing.last_name,
      gender: form.gender ?? editing.gender,
      role: form.role ?? editing.role,
      skin_tone: form.skin_tone ?? editing.skin_tone,
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", editing.id);

    if (error) {
      toast.error("Gagal menyimpan perubahan: " + error.message);
    } else {
      toast.success("Perubahan tersimpan");
      setOpenEdit(false);
      setEditing(null);
      // optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id ? ({ ...u, ...payload } as User) : u
        )
      );
    }
    setSaving(false);
  };

  const onOpenDelete = (user: User) => {
    setDeletingUser(user);
    setOpenDelete(true);
  };

  const onConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deletingUser.id);
    if (error) {
      toast.error("Gagal menghapus pengguna: " + error.message);
    } else {
      toast.success("Pengguna dihapus");
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    }
    setDeleting(false);
    setOpenDelete(false);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Users Management</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, role, gender..."
              className="pl-8"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm opacity-70">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="flex flex-col items-center p-4">
              {user.avatar_url ? (
                <div className="relative w-28 h-28 rounded-full overflow-hidden">
                  <Image
                    src={user.avatar_url}
                    alt={user.first_name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 bg-muted rounded-full flex items-center justify-center text-xs">
                  No Avatar
                </div>
              )}
              <CardContent className="text-center mt-3 space-y-1 p-0">
                <p className="font-semibold text-lg">
                  {(user.first_name ?? "").trim()}{" "}
                  {(user.last_name ?? "").trim()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.gender?.toUpperCase() ?? "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.skin_tone?.toUpperCase() ?? "-"}
                </p>
                <p className="text-sm font-medium mt-1">
                  {user.role?.toLocaleUpperCase() ?? "-"}
                </p>
                <div className="mt-2 flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenEdit(user)}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onOpenDelete(user)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredUsers.length === 0 && !loading && (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              Tidak ada pengguna yang cocok dengan filter.
            </div>
          )}
        </div>
      )}

      {/* ===== Edit User Modal ===== */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Ubah data dasar pengguna lalu simpan.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(
                  e.currentTarget as HTMLFormElement
                );
                onSubmitEdit({
                  first_name: String(formData.get("first_name") || ""),
                  last_name: String(formData.get("last_name") || ""),
                  gender: String(formData.get("gender") || ""),
                  role: String(formData.get("role") || ""),
                  skin_tone: String(formData.get("skin_tone") || ""),
                });
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    defaultValue={editing.first_name ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    defaultValue={editing.last_name ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select
                    name="gender"
                    defaultValue={
                      (editing.gender ?? "").toLowerCase() || undefined
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Men">Men</SelectItem>
                      <SelectItem value="Women">Women</SelectItem>
                      {/* <SelectItem value="other">Other</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select
                    name="role"
                    defaultValue={
                      (editing.role ?? "").toLowerCase() || undefined
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 grid gap-2">
                  <Label htmlFor="skin_tone">Skin Tone</Label>
                  <Input
                    id="skin_tone"
                    name="skin_tone"
                    defaultValue={editing.skin_tone ?? ""}
                  />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenEdit(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan
                    </span>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Delete Confirmation ===== */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data pengguna secara permanen. Tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDelete(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
