```tsx
import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  price: number;
  old_price?: number | null;
};

type EmailCampaignPayload = {
  subject: string;
  heading?: string | null;
  intro?: string | null;
  hero_image?: string | null;
  product_ids: number[];
  trust_note?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  eyebrow?: string | null;
  preheader?: string | null;
  urgency_text?: string | null;
  trust_badges?: string[];
};

type Props = {
  products: Product[];
  onSubmit: (payload: EmailCampaignPayload) => Promise<void>;
};

const DEFAULT_CAMPAIGN: EmailCampaignPayload = {
  subject: "",
  heading: "",
  intro: "",
  hero_image: "",
  product_ids: [],
  trust_note: "Nationwide delivery across Nigeria • Secure checkout",
  cta_text: "Shop Now",
  cta_url: "/collections",
  eyebrow: "",
  preheader: "",
  urgency_text: "",
  trust_badges: [
    "Nationwide Delivery",
    "Secure Checkout",
  ],
};

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export function EmailCampaignComposer({
  products,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<EmailCampaignPayload>(DEFAULT_CAMPAIGN);

  const [productSearch, setProductSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  const selectedProducts = useMemo(
    () =>
      form.product_ids
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean) as Product[],
    [form.product_ids, products]
  );

  function updateField<K extends keyof EmailCampaignPayload>(
    field: K,
    value: EmailCampaignPayload[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleProduct(id: number) {
    setForm((current) => {
      const exists = current.product_ids.includes(id);

      return {
        ...current,
        product_ids: exists
          ? current.product_ids.filter((productId) => productId !== id)
          : [...current.product_ids, id],
      };
    });
  }

  function removeProduct(id: number) {
    setForm((current) => ({
      ...current,
      product_ids: current.product_ids.filter(
        (productId) => productId !== id
      ),
    }));
  }

  function updateTrustBadge(index: number, value: string) {
    setForm((current) => {
      const badges = [...(current.trust_badges ?? [])];
      badges[index] = value;

      return {
        ...current,
        trust_badges: badges,
      };
    });
  }

  function addTrustBadge() {
    setForm((current) => ({
      ...current,
      trust_badges: [
        ...(current.trust_badges ?? []),
        "",
      ],
    }));
  }

  function removeTrustBadge(index: number) {
    setForm((current) => ({
      ...current,
      trust_badges: (current.trust_badges ?? []).filter(
        (_, i) => i !== index
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.subject.trim()) {
      return;
    }

    if (form.product_ids.length === 0) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        subject: form.subject.trim(),
        heading: form.heading?.trim() || null,
        intro: form.intro?.trim() || null,
        hero_image: form.hero_image?.trim() || null,
        trust_note: form.trust_note?.trim() || null,
        cta_text: form.cta_text?.trim() || "Shop Now",
        cta_url: form.cta_url?.trim() || "/collections",
        eyebrow: form.eyebrow?.trim() || "",
        preheader: form.preheader?.trim() || "",
        urgency_text: form.urgency_text?.trim() || null,
        trust_badges: (form.trust_badges ?? [])
          .map((badge) => badge.trim())
          .filter(Boolean),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-zinc-50 lg:grid-cols-[minmax(0,1fr)_560px]">

      {/* =========================================================
          EDITOR
      ========================================================== */}
      <main className="border-r border-zinc-200 bg-white">
        <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">
                Email Campaign
              </h1>
              <p className="text-sm text-zinc-500">
                Create a campaign for your customers
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPreview((value) => !value)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 lg:hidden"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl space-y-8 p-6"
        >

          {/* =====================================================
              CAMPAIGN
          ====================================================== */}
          <section>
            <SectionTitle
              title="Campaign"
              description="The main content customers will see in their inbox."
            />

            <div className="space-y-5">
              <Field label="Subject" required>
                <input
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  placeholder="New styles you'll want to wear ✨"
                  className={inputClass}
                  maxLength={120}
                />

                <p className="mt-1 text-right text-xs text-zinc-400">
                  {form.subject.length}/120
                </p>
              </Field>

              <Field
                label="Preheader"
                hint="Short text shown next to the subject in the inbox."
              >
                <input
                  value={form.preheader ?? ""}
                  onChange={(event) =>
                    updateField("preheader", event.target.value)
                  }
                  placeholder="Fresh styles just landed. Discover your next favourite piece."
                  className={inputClass}
                  maxLength={120}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Eyebrow">
                  <input
                    value={form.eyebrow ?? ""}
                    onChange={(event) =>
                      updateField("eyebrow", event.target.value)
                    }
                    placeholder="NEW ARRIVALS"
                    className={inputClass}
                  />
                </Field>

                <Field label="Urgency text">
                  <input
                    value={form.urgency_text ?? ""}
                    onChange={(event) =>
                      updateField("urgency_text", event.target.value)
                    }
                    placeholder="🔥 FLASH SALE — 48 HOURS ONLY"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Heading">
                <input
                  value={form.heading ?? ""}
                  onChange={(event) =>
                    updateField("heading", event.target.value)
                  }
                  placeholder="Your next favourite look is here"
                  className={inputClass}
                />
              </Field>

              <Field label="Intro">
                <textarea
                  value={form.intro ?? ""}
                  onChange={(event) =>
                    updateField("intro", event.target.value)
                  }
                  placeholder="Fresh styles have landed. Discover pieces selected to make getting dressed a little more exciting."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* =====================================================
              HERO
          ====================================================== */}
          <section>
            <SectionTitle
              title="Hero image"
              description="Use a wide editorial image for the top of the email."
            />

            <Field label="Image URL">
              <input
                type="url"
                value={form.hero_image ?? ""}
                onChange={(event) =>
                  updateField("hero_image", event.target.value)
                }
                placeholder="https://cdn.example.com/campaigns/new-arrivals.jpg"
                className={inputClass}
              />
            </Field>

            {form.hero_image && (
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                <img
                  src={form.hero_image}
                  alt=""
                  className="aspect-[2/1] w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </section>

          {/* =====================================================
              PRODUCTS
          ====================================================== */}
          <section>
            <SectionTitle
              title="Products"
              description="Choose the products you want to feature."
            />

            <div className="rounded-xl border border-zinc-200">

              <div className="border-b border-zinc-200 p-3">
                <input
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(event.target.value)
                  }
                  placeholder="Search products..."
                  className={inputClass}
                />
              </div>

              {/* Selected products */}
              {selectedProducts.length > 0 && (
                <div className="border-b border-zinc-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Selected
                    </span>

                    <span className="text-xs text-zinc-400">
                      {selectedProducts.length} products
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 rounded-lg bg-zinc-100 py-1.5 pl-1.5 pr-2"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover"
                          />
                        )}

                        <span className="max-w-32 truncate text-xs font-medium text-zinc-700">
                          {product.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="text-zinc-400 hover:text-zinc-900"
                          aria-label={`Remove ${product.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                {filteredProducts.map((product) => {
                  const selected =
                    form.product_ids.includes(product.id);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex w-full items-center gap-3 border-b border-zinc-100 p-3 text-left last:border-0 hover:bg-zinc-50 ${
                        selected ? "bg-zinc-50" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-zinc-100" />
                        )}

                        {selected && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {product.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900">
                            {formatPrice(product.price)}
                          </span>

                          {product.old_price &&
                            product.old_price > product.price && (
                              <span className="text-xs text-zinc-400 line-through">
                                {formatPrice(product.old_price)}
                              </span>
                            )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    No products found.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =====================================================
              CTA
          ====================================================== */}
          <section>
            <SectionTitle
              title="Call to action"
              description="Where you want customers to go after reading the email."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Button text">
                <input
                  value={form.cta_text ?? ""}
                  onChange={(event) =>
                    updateField("cta_text", event.target.value)
                  }
                  placeholder="Shop Now"
                  className={inputClass}
                />
              </Field>

              <Field label="Destination">
                <input
                  value={form.cta_url ?? ""}
                  onChange={(event) =>
                    updateField("cta_url", event.target.value)
                  }
                  placeholder="/collections/new-arrivals"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* =====================================================
              TRUST
          ====================================================== */}
          <section>
            <SectionTitle
              title="Trust & reassurance"
              description="Small details that help customers feel confident shopping."
            />

            <div className="space-y-5">
              <Field label="Trust note">
                <input
                  value={form.trust_note ?? ""}
                  onChange={(event) =>
                    updateField("trust_note", event.target.value)
                  }
                  placeholder="Nationwide delivery across Nigeria • Secure checkout"
                  className={inputClass}
                />
              </Field>

              <Field label="Trust badges">
                <div className="space-y-2">
                  {(form.trust_badges ?? []).map(
                    (badge, index) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >
                        <input
                          value={badge}
                          onChange={(event) =>
                            updateTrustBadge(
                              index,
                              event.target.value
                            )
                          }
                          placeholder="Nationwide Delivery"
                          className={inputClass}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeTrustBadge(index)
                          }
                          className="shrink-0 rounded-lg border border-zinc-200 px-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={addTrustBadge}
                    className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    + Add trust badge
                  </button>
                </div>
              </Field>
            </div>
          </section>

          {/* =====================================================
              SUBMIT
          ====================================================== */}
          <div className="sticky bottom-0 -mx-6 border-t border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-zinc-500">
                {form.product_ids.length} product
                {form.product_ids.length === 1 ? "" : "s"} selected
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !form.subject.trim() ||
                  form.product_ids.length === 0
                }
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Sending..."
                  : "Send Campaign"}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* =========================================================
          LIVE PREVIEW
      ========================================================== */}
      <aside
        className={`bg-zinc-100 ${
          showPreview ? "block" : "hidden"
        } lg:block`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="border-b border-zinc-200 bg-white px-6 py-4">
            <p className="text-sm font-semibold text-zinc-900">
              Email Preview
            </p>
            <p className="text-xs text-zinc-500">
              Approximate customer view
            </p>
          </div>

          <div className="p-5">
            <div className="mx-auto max-w-[600px] overflow-hidden rounded-xl bg-white shadow-sm">

              {/* Email header */}
              <div className="border-b border-zinc-100 px-5 py-6 text-center">
                <a
                  href="#"
                  className="text-xl font-bold tracking-[0.15em] text-zinc-900"
                >
                  YOUR STORE
                </a>
              </div>

              {/* Hero */}
              {form.hero_image && (
                <img
                  src={form.hero_image}
                  alt=""
                  className="aspect-[2/1] w-full object-cover"
                />
              )}

              {/* Content */}
              <div className="px-7 py-8 text-center">
                {form.eyebrow && (
                  <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-zinc-500">
                    {form.eyebrow}
                  </p>
                )}

                {form.urgency_text && (
                  <div className="mb-5 rounded-md bg-zinc-900 px-3 py-2 text-[10px] font-bold text-white">
                    {form.urgency_text}
                  </div>
                )}

                <h2 className="text-3xl font-bold leading-tight text-zinc-900">
                  {form.heading || "Your campaign heading"}
                </h2>

                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  {form.intro ||
                    "Your campaign introduction will appear here."}
                </p>

                <a
                  href="#"
                  className="mt-6 inline-block bg-zinc-900 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
                >
                  {form.cta_text || "Shop Now"}
                </a>
              </div>

              {/* Products */}
              {selectedProducts.length > 0 && (
                <div className="bg-zinc-50 p-3">
                  <p className="mb-4 text-center text-[10px] font-bold tracking-[0.2em] text-zinc-500">
                    SHOP THE EDIT
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="overflow-hidden bg-white"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="aspect-[3/4] w-full object-cover"
                          />
                        ) : (
                          <div className="aspect-[3/4] bg-zinc-100" />
                        )}

                        <div className="p-3">
                          <p className="truncate text-xs font-semibold text-zinc-900">
                            {product.name}
                          </p>

                          <div className="mt-1">
                            <span className="text-xs font-bold text-zinc-900">
                              {formatPrice(product.price)}
                            </span>

                            {product.old_price &&
                              product.old_price >
                                product.price && (
                                <span className="ml-1 text-[10px] text-zinc-400 line-through">
                                  {formatPrice(
                                    product.old_price
                                  )}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="px-5 py-8 text-center">
                <a
                  href="#"
                  className="inline-block bg-zinc-900 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
                >
                  {form.cta_text || "Shop Now"}
                </a>
              </div>

              {/* Trust */}
              {form.trust_note && (
                <div className="border-y border-zinc-100 bg-zinc-50 px-5 py-4 text-center">
                  <p className="text-[10px] text-zinc-500">
                    {form.trust_note}
                  </p>
                </div>
              )}

              {/* Trust badges */}
              {(form.trust_badges ?? []).length > 0 && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-5 py-5">
                  {(form.trust_badges ?? [])
                    .filter(Boolean)
                    .map((badge, index) => (
                      <span
                        key={index}
                        className="text-[9px] font-medium text-zinc-500"
                      >
                        ✓ {badge}
                      </span>
                    ))}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-zinc-100 px-5 py-7 text-center">
                <p className="text-[10px] text-zinc-400">
                  Shop &nbsp;·&nbsp; About &nbsp;·&nbsp; Contact
                  &nbsp;·&nbsp; FAQs
                </p>

                <p className="mt-4 text-[9px] leading-4 text-zinc-400">
                  You received this email because you signed up
                  to receive updates.
                </p>

                <a
                  href="#"
                  className="mt-2 inline-block text-[9px] text-zinc-500 underline"
                >
                  Unsubscribe
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* =============================================================
   SMALL UI COMPONENTS
============================================================= */

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-zinc-900">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-800">
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>

        {hint && (
          <span className="hidden text-xs text-zinc-400 sm:block">
            {hint}
          </span>
        )}
      </div>

      {children}

      {hint && (
        <p className="mt-1 text-xs text-zinc-400 sm:hidden">
          {hint}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

