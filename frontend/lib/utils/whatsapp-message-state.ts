const WHATSAPP_STORAGE_KEY = 'whatsapp_first_message_sent';

export const isFirstWhatsAppMessage = (): boolean => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem(WHATSAPP_STORAGE_KEY) !== 'true';
};

export const markFirstWhatsAppMessageSent = (): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(WHATSAPP_STORAGE_KEY, 'true');
    }
};

export const resetWhatsAppMessageState = (): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(WHATSAPP_STORAGE_KEY);
    }
};
