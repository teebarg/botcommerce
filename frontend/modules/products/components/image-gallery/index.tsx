import Image from "next/image";

type ImageGalleryProps = {
    images: any[];
};

const ImageGallery = ({ images }: ImageGalleryProps) => {
    return (
        <div className="flex items-start relative">
            <div className="flex flex-col flex-1 sm:mx-16 gap-y-4">
                {images.map((image, index) => {
                    return (
                        <div key={image.id} className="shadow-md relative aspect-[29/34] w-full overflow-hidden bg-default-500" id={image.id}>
                            <Image
                                fill
                                alt={`Product image ${index + 1}`}
                                className="absolute inset-0 rounded-lg"
                                priority={index <= 2 ? true : false}
                                sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                                src={image.url}
                                style={{
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImageGallery;
