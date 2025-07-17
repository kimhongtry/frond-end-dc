// components/EditUserDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestUser } from "@/lib/api/user-api";
import type { IUser } from "@/types/user-type";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
}

const EditUserDialog = ({ isOpen, onClose, user }: EditUserDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    user_name: "",
    email: "",
  });
  const { UPDATE_USER } = requestUser();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      requestUser().UPDATE_USER(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        user_name: user.user_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!user) return;
    mutate({ id: user.id, data: formData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
          />
          <Input
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            placeholder="Username"
          />
          <Input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
