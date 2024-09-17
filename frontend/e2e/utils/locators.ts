import { Page, Locator } from "@playwright/test";

export async function getSelectedOptionText(page: Page, select: Locator) {
    const slug = await select.elementHandle();
    return await page.evaluate(
        (opts) => {
            if (!opts || !opts[0]) {
                return "";
            }
            const select = opts[0] as HTMLSelectElement;
            return select.options[select.selectedIndex].textContent;
        },
        [slug]
    );
}
