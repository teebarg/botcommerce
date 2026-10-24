import { BagIcon, FacebookIcon, InstagramIcon, MailIcon, TelegramIcon, TikTokIcon, WhatsAppIcon } from "@/components/card/icons";
import { ActionLink, GhostLink, SocialRow } from "@/components/card/links";
import { useTikTokBrowser } from "@/hooks/useTikTokBrowser";
import { useConfig } from "@/providers/store-provider";
import { APP_URL } from "@/utils";
import { seo } from "@/utils/seo";
import { createFileRoute } from "@tanstack/react-router";

const whatsappMessage = "Hi, I saw you on TikTok and I would like to order.";

export const Route = createFileRoute("/card")({
    head: ({ match }) => {
        const config = match.context.config;
        const shopName = config.shop_name;
        return {
            meta: [
                ...seo({
                    title: `${shopName} · Order now`,
                    description: config.shop_description,
                    url: `${APP_URL}/card`,
                    image: `${APP_URL}/brand.jpg`,
                }),
            ],
        };
    },
    component: LinkPage,
});

function LinkPage() {
    const { shop_name, shop_description, facebook, instagram, tiktok, telegram, whatsapp, frontend_host, shop_email } = useConfig();
    const inTikTok = useTikTokBrowser();
    return (
        <main className="flex min-h-dvh justify-center px-4 pt-[calc(var(--sat)+16px)]">
            <div className="flex w-full max-w-[440px] flex-col gap-3">
                {/* TikTok's browser blocks app hand-off: tell people how to get out of it */}
                {inTikTok && (
                    <p role="note" className="rounded-2xl border border-border bg-muted px-4 py-3 text-[13px] leading-snug">
                        <span className="font-medium">Button not opening the app?</span> Tap the <span className="font-medium">⋯</span> menu at the
                        top of the screen, then <span className="font-medium">Open in browser</span>.
                    </p>
                )}
                {/* Business card */}
                <section className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-14 flex-none items-center justify-center rounded-2xl bg-accent font-display text-[28px] font-bold text-accent-foreground">
                            TH
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <h1 className="truncate font-display text-2xl leading-[1.1] font-bold">{shop_name}</h1>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{shop_description}</p>
                        </div>
                    </div>

                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="size-2 flex-none rounded-full bg-emerald-500" />
                        Online now · replies in 2mins
                    </p>

                    <dl className="grid grid-cols-3 gap-2 border-t border-line pt-2.5">
                        {[
                            { value: "[2k+]", label: "orders delivered" },
                            { value: "[4.9/5]", label: "customer rating" },
                            { value: "[24h]", label: "dispatch time" },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col gap-0.5">
                                <dt className="order-2 text-xs text-muted-foreground">{s.label}</dt>
                                <dd className="font-display text-xl font-semibold">{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Main actions: straight into the chat apps */}
                <ActionLink
                    brand="whatsapp"
                    href={
                        inTikTok
                            ? `whatsapp://send?phone=${whatsapp}&text=${encodeURIComponent(whatsappMessage)}`
                            : `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
                    }
                    icon={WhatsAppIcon}
                    title="Order on WhatsApp"
                    hint="Fastest way to buy."
                />
                <ActionLink
                    brand="telegram"
                    href={telegram}
                    icon={TelegramIcon}
                    title="Order on Telegram"
                    hint="Prefer Telegram? Message us there."
                />
                <GhostLink href={frontend_host} icon={BagIcon}>
                    Browse the store
                </GhostLink>

                <h2 className="mt-2 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Follow and stay in touch</h2>
                <nav aria-label="Social media" className="divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-card">
                    <SocialRow href={`https://www.tiktok.com/@${tiktok}`} icon={TikTokIcon} label="Follow on TikTok" handle={`@${tiktok}`} />
                    <SocialRow
                        href={`https://www.instagram.com/${instagram}`}
                        icon={InstagramIcon}
                        label="Follow on Instagram"
                        handle={`@${instagram}`}
                    />
                    <SocialRow href={`https://www.facebook.com/${facebook}`} icon={FacebookIcon} label="Follow on Facebook" handle={`/${facebook}`} />
                    <SocialRow href={`mailto:${shop_email}`} icon={MailIcon} label="Email us" handle={shop_email} />
                </nav>

                {/* <p className="mt-2 text-center text-xs leading-snug text-muted-foreground">Nationwide delivery</p> */}
            </div>
        </main>
    );
}
