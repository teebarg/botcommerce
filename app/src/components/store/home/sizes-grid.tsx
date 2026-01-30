import LocalizedClientLink from "@/components/ui/link";

const sizes = ["8", "10", "12", "14", "16", "18", "20", "22"];

const SizesGrid = () => {
    return (
        <section className="py-8 px-4 md:px-2">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-4">
                    <h2 className="text-base md:text-3xl font-bold">Shop by Size</h2>
                    {/* <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Find your perfect fit with our size-specific collections</p> */}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                    {sizes?.map((item: string, idx: number) => (
                        <LocalizedClientLink key={idx} href={`/collections?sizes=${item}`}>
                            <div className="w-18 md:w-20 h-18 md:h-20 rounded-full bg-linear-to-br from-primary to-foreground/80 dark:to-accent flex flex-col items-center justify-center text-white font-bold">
                                <span className="text-lg md:text-2xl leading-none">{item}</span>
                                <span className="text-sm md:text-lg leading-none">UK</span>
                            </div>
                        </LocalizedClientLink>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SizesGrid;
