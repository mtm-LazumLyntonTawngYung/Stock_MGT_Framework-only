export interface Product {
   id: string;
   categoryId: string;
   categoryName: string;
   itemDescription: string;
   quantityPerUnit: number;
   unitPrice: number;
   discountAmount: number;
   price: number;
   price_1st: number;
   price_2nd: number;
   price_3rd: number;
   openingQty: number;
   closingQty: number;
   purchaseQty1st: number;
   purchaseQty2nd: number;
   purchaseQty3rd: number;
   usedQty1stWeek: number;
   usedQty2ndWeek: number;
   usedQty3rdWeek: number;
   usedQty4thWeek: number;
   usedQty5thWeek: number;
   minimumThreshold?: number;
   checkedWeek1?: boolean;
   checkedWeek2?: boolean;
   checkedWeek3?: boolean;
   checkedWeek4?: boolean;
   checkedWeek5?: boolean;
     quantityPerUnit1st?: number;
     quantityPerUnit2nd?: number;
     quantityPerUnit3rd?: number;
     unitPrice1st?: number;
     unitPrice2nd?: number;
     unitPrice3rd?: number;
     discountAmount1st?: number;
     discountAmount2nd?: number;
     discountAmount3rd?: number;
     purchaseDate1st?: string;
     purchaseDate2nd?: string;
     purchaseDate3rd?: string;
   }

export const defaultProducts: Product[] = [
   {
     id: "1",
     categoryId: "2",
     categoryName: "Premier Coffee Original 3 in 1",
     itemDescription: "Premier Coffee Original 3 in 1",
     quantityPerUnit: 1,
     unitPrice: 0,
     discountAmount: 0,
     price: 0,
     price_1st: 0,
     price_2nd: 0,
     price_3rd: 0,
     openingQty: 6,
     closingQty: 25,
     purchaseQty1st: 32,
     purchaseQty2nd: 0,
     purchaseQty3rd: 0,
     usedQty1stWeek: 3,
     usedQty2ndWeek: 4,
     usedQty3rdWeek: 6,
     usedQty4thWeek: 4,
     usedQty5thWeek: 3,
     minimumThreshold: 5,
   },
   {
     id: "2",
     categoryId: "3",
     categoryName: "Premier Coffee Expresso",
     itemDescription: "Premier Coffee Expresso",
     quantityPerUnit: 1,
     unitPrice: 0,
     discountAmount: 0,
     price: 0,
     price_1st: 0,
     price_2nd: 0,
     price_3rd: 0,
     openingQty: 0,
     closingQty: 0,
     purchaseQty1st: 0,
     purchaseQty2nd: 0,
     purchaseQty3rd: 0,
     usedQty1stWeek: 0,
     usedQty2ndWeek: 0,
     usedQty3rdWeek: 0,
     usedQty4thWeek: 0,
     usedQty5thWeek: 0,
     minimumThreshold: 10,
   },
   {
     id: "3",
     categoryId: "4",
     categoryName: "Premier Coffee 2 plus 1",
     itemDescription: "Premier Coffee 2 plus 1",
     quantityPerUnit: 1,
     unitPrice: 0,
     discountAmount: 0,
     price: 0,
     price_1st: 0,
     price_2nd: 0,
     price_3rd: 0,
     openingQty: 7,
     closingQty: 12,
     purchaseQty1st: 10,
     purchaseQty2nd: 0,
     purchaseQty3rd: 0,
     usedQty1stWeek: 0,
     usedQty2ndWeek: 0,
     usedQty3rdWeek: 3,
     usedQty4thWeek: 2,
     usedQty5thWeek: 0,
     minimumThreshold: 3,
   },
   {
     id: "4",
     categoryId: "5",
     categoryName: "Sugar",
     itemDescription: "Sugar ( ဝမ်းဗိုက် )",
     quantityPerUnit: 1,
     unitPrice: 0,
     discountAmount: 0,
     price: 0,
     price_1st: 0,
     price_2nd: 0,
     price_3rd: 0,
     openingQty: 22,
     closingQty: 22,
     purchaseQty1st: 0,
     purchaseQty2nd: 0,
     purchaseQty3rd: 0,
     usedQty1stWeek: 0,
     usedQty2ndWeek: 0,
     usedQty3rdWeek: 0,
     usedQty4thWeek: 0,
     usedQty5thWeek: 0,
     minimumThreshold: 15,
   },
   {
     id: "5",
     categoryId: "6",
     categoryName: "Dry Tea",
     itemDescription: "Dry Tea",
     quantityPerUnit: 1,
     unitPrice: 0,
     discountAmount: 0,
     price: 0,
     price_1st: 0,
     price_2nd: 0,
     price_3rd: 0,
     openingQty: 4,
     closingQty: 1,
     purchaseQty1st: 0,
     purchaseQty2nd: 0,
     purchaseQty3rd: 0,
     usedQty1stWeek: 0,
     usedQty2ndWeek: 2,
     usedQty3rdWeek: 1,
     usedQty4thWeek: 0,
     usedQty5thWeek: 0,
     minimumThreshold: 5,
   },
];