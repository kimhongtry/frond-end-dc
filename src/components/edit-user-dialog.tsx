import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { id: string; full_name: string; user_name: string; email: string }) => void;
  user: { id: string; full_name: string; user_name: string; email: string } | null;
};

export default function EditUserDialog({ open, onClose, onSave, user }: Props) {
  const [form, setForm] = useState(user);

  if (!form) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
          />
          <Input
            placeholder="Username"
            value={form.user_name}
            onChange={(e) => handleChange("user_name", e.target.value)}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
