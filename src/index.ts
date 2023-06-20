export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";
export type ServicePrices = { [key in ServiceType]: number };
export type ServicePackage = {
    includes: ServiceType[];
    priceReduction: number;
};

export interface PriceList {
    year: ServiceYear;
    prices: ServicePrices;
}

const priceCatalog: PriceList[] = [
    {
        year: 2020,
        prices: {
            Photography: 1700,
            VideoRecording: 1700,
            BlurayPackage: 300,
            TwoDayEvent: 400,
            WeddingSession: 600
        }
    },
    {
        year: 2021,
        prices: {
            Photography: 1800,
            VideoRecording: 1800,
            BlurayPackage: 300,
            TwoDayEvent: 400,
            WeddingSession: 600
        }
    },
    {
        year: 2022,
        prices: {
            Photography: 1900,
            VideoRecording: 1900,
            BlurayPackage: 300,
            TwoDayEvent: 400,
            WeddingSession: 600
        }
    }
];

export class Discount {
    constructor(
        public name: string,
        public includedServices: ServiceType[],
        public forYear: ServiceYear,
        public discountValue: number
    ) { }

    canApply(selectedServices: ServiceType[], selectedYear: ServiceYear): boolean {
        return (
            selectedYear === this.forYear &&
            this.includedServices.every(service => selectedServices.includes(service))
        );
    }
}

export class DiscountCalculator {
    private discounts: Discount[] = [
        new Discount("PhotographyVideoRecording", ["Photography", "VideoRecording"], 2020, 1200),
        new Discount("PhotographyVideoRecording", ["Photography", "VideoRecording"], 2021, 1300),
        new Discount("PhotographyVideoRecording", ["Photography", "VideoRecording"], 2022, 1300),
        new Discount("WeddingAndPhotography", ["Photography", "WeddingSession"], 2020, 300),
        new Discount("WeddingAndPhotography", ["Photography", "WeddingSession"], 2021, 300),
        new Discount("WeddingAndPhotography", ["Photography", "WeddingSession"], 2022, 600),
        new Discount("WeddingVideo", ["VideoRecording", "WeddingSession"], 2020, 300),
        new Discount("WeddingVideo", ["VideoRecording", "WeddingSession"], 2021, 300),
        new Discount("WeddingVideo", ["VideoRecording", "WeddingSession"], 2022, 300),
        new Discount("VideoPhotoWedding", ["VideoRecording", "Photography", "WeddingSession"], 2020, 1500),
        new Discount("VideoPhotoWedding", ["VideoRecording", "Photography", "WeddingSession"], 2021, 1600),
        new Discount("VideoPhotoWedding", ["VideoRecording", "Photography", "WeddingSession"], 2022, 1900)
    ];

    constructor(public selectedServices: ServiceType[], public selectedYear: ServiceYear) { }

    calculate(price: number): number {
        const applicableDiscounts = this.selectDiscounts();
        if (applicableDiscounts.length === 0) {
            return price;
        }
        const bestDiscount = Math.max(...applicableDiscounts.map(discount => discount.discountValue));
        return price - bestDiscount;
    }

    private selectDiscounts(): Discount[] {
        return this.discounts.filter(discount => {
            return discount.forYear === this.selectedYear && discount.canApply(this.selectedServices, this.selectedYear);
        });
    }
}

export const indexRemoveAdditionalService = (services: ServiceType[], toRemove: ServiceType): number => {
    const containsPhotoRelatedServices = services.includes("TwoDayEvent");
    const containsVideo = services.includes("VideoRecording");
    if (toRemove === "Photography" && containsPhotoRelatedServices && !containsVideo) {
        return services.indexOf("TwoDayEvent");
    }
    return -1;
};

export const canSelect = (services: ServiceType[], selectedService: ServiceType): boolean => {
    return !services.includes("VideoRecording") && selectedService === "BlurayPackage";
};

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
): ServiceType[] => {
    switch (action.type) {
        case "Select":
            if (canSelect(previouslySelectedServices, action.service)) {
                return [...previouslySelectedServices];
            }
            return Array.from(new Set([...previouslySelectedServices, action.service]));
        case "Deselect":
            let result = [...previouslySelectedServices];
            const additionalIndex = indexRemoveAdditionalService(result, action.service);
            if (additionalIndex > -1) {
                result.splice(additionalIndex, 1);
            }
            const index = result.indexOf(action.service);
            if (index > -1) {
                result.splice(index, 1);
            }
            return result;
        default:
            return previouslySelectedServices;
    }
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear): { basePrice: number; finalPrice: number } => {
    if (selectedServices.length === 0) {
        return { basePrice: 0, finalPrice: 0 };
    }
    const calculator = new DiscountCalculator(selectedServices, selectedYear);
    const priceList = priceCatalog.find(price => price.year === selectedYear);
    let basePrice = 0;
    let finalPrice = 0;

    selectedServices.forEach(service => {
        basePrice += priceList.prices[service];
    });

    finalPrice = calculator.calculate(basePrice);

    return { basePrice, finalPrice };
};