import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/data";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/create-event")({
  head: () => ({
    meta: [
      { title: "Create an Event — Wanbiz EventPass" },
      {
        name: "description",
        content: "Sell tickets in Naira, run presale campaigns, manage seating and check in guests with QR scanning.",
      },
      { property: "og:title", content: "Create an event on Wanbiz EventPass" },
      { property: "og:description", content: "Set up ticket types, pricing and capacity for your Nigerian event." },
    ],
  }),
  component: CreateEventPage,
});

function CreateEventPage() {
  const { user, isLoading } = useAuth();
  const [ticketRows, setTicketRows] = useState([{ id: 1 }, { id: 2 }]);

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const ticketTypes = ticketRows.map((row) => ({
      name: String(form.get(`ticketName-${row.id}`) ?? ""),
      price: Number(form.get(`ticketPrice-${row.id}`) ?? 0),
      quantity: Number(form.get(`ticketQty-${row.id}`) ?? 0),
    }));
    const requestBody = new FormData();
    requestBody.append("event", JSON.stringify({
      name: form.get("name"),
      category: form.get("category"),
      date: form.get("date"),
      time: form.get("time"),
      venue: form.get("venue"),
      city: form.get("city"),
      description: form.get("description"),
      acceptsTicketPass: form.get("acceptsTicketPass") === "on",
      seatingEnabled: form.get("seatingEnabled") === "on",
      presale: form.get("presale") === "on",
      ticketTypes,
    }));
    const image = form.get("image");
    if (image instanceof File && image.size > 0) requestBody.append("image", image);

    const response = await fetch("/api/events", {
      method: "POST",
      credentials: "same-origin",
      body: requestBody,
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(result.error || "We could not save this event.");
    toast.success("Event draft saved", { description: "Your draft is now stored in your account." });
    formElement.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow="For organizers"
        title="Create an Event"
        description="Set up your event, ticket types and pricing in Naira. Publishing goes live once your organizer account is connected."
      />

      {isLoading ? (
        <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Checking your account…</p>
      ) : !user ? (
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
          <p className="text-sm text-muted-foreground">Sign in or create an account before saving an event draft.</p>
          <div className="flex gap-3">
            <Button asChild><Link to="/register">Create account</Link></Button>
            <Button asChild variant="outline"><Link to="/login">Sign in</Link></Button>
          </div>
        </div>
      ) : (
      <form onSubmit={(event) => void saveDraft(event).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not save event."))} className="mx-auto max-w-4xl space-y-8 px-4 py-10 lg:px-8">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold">Event details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Event name" />
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Field id="date" label="Date" type="date" />
            <Field id="time" label="Start time" type="time" />
            <Field id="venue" label="Venue" />
            <Field id="city" label="City" placeholder="Lagos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={5} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Event image</Label>
            <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" />
            <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP, or AVIF. Maximum 10 MB.</p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Ticket types</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setTicketRows((rows) => [...rows, { id: Date.now() }])}
            >
              Add ticket type
            </Button>
          </div>
          <div className="space-y-4">
            {ticketRows.map((row, index) => (
              <div key={row.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
                <Field id={`ticketName-${row.id}`} label={`Ticket ${index + 1} name`} placeholder="Regular" />
                <Field id={`ticketPrice-${row.id}`} label="Price (₦)" type="number" placeholder="10000" />
                <Field id={`ticketQty-${row.id}`} label="Quantity" type="number" placeholder="500" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold">Event options</h2>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox id="acceptsTicketPass" name="acceptsTicketPass" className="mt-0.5" />
            <span>
              Accept EventPass TicketPass members at this event.
              <span className="mt-0.5 block text-xs text-muted-foreground">
                You decide whether TicketPass membership is accepted — it never grants automatic entry.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox id="seatingEnabled" name="seatingEnabled" className="mt-0.5" />
            <span>
              Enable seating.
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Seats are assigned automatically when guests check in.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox id="presale" name="presale" className="mt-0.5" />
            <span>
              Run a ticket presale sponsorship campaign.
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Supporters buy early and receive tickets after payment verification.
              </span>
            </span>
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold">Payout details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="bankName" label="Bank name" required={false} />
            <Field id="accountNumber" label="Account number" required={false} />
          </div>
          <p className="text-xs text-muted-foreground">
            Payout verification and settlement run through Paystack once the payment integration is switched on.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="bg-gradient-brand text-primary-foreground">
            Save event draft
          </Button>
          <Button type="reset" size="lg" variant="outline">
            Clear form
          </Button>
        </div>
      </form>
      )}
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}
