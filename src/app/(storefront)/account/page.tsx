import { getCurrentUser, updateProfileAction } from "@/actions/account.actions";
import { AccountNav } from "@/components/storefront/AccountNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Welcome, {user.name}</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <AccountNav />

      <form action={updateProfileAction} className="max-w-sm flex flex-col gap-4">
        <Input label="Name" name="name" defaultValue={user.name} required />
        <Input
          label="Phone"
          name="phone"
          defaultValue={user.phone ?? ""}
          placeholder="Optional"
        />
        <Button type="submit" size="sm" className="mt-2 self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}