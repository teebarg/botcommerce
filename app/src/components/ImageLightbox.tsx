import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ImageLightboxProps {
    image: string | null;
    onClose: () => void;
}

const ImageLightbox = ({ image, onClose }: ImageLightboxProps) => {
    return (
        <AnimatePresence>
            {image && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={onClose}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 text-background/70 hover:text-background transition-colors">
                        <X className="w-6 h-6" />
                    </button>

                    <motion.img
                        src={image}
                        alt="Product detail"
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default ImageLightbox;
