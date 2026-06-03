import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  parentId: z.number().int().positive().nullish(),
  minimumThreshold: z.number().min(0, 'Minimum threshold cannot be negative').nullish(),
  remark: z.string().max(500).nullish(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  minimumThreshold: z.number().min(0).nullish(),
  remark: z.string().max(500).nullish(),
});

export const createMonthSchema = z.object({
  month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2000, 'Invalid year').max(2100, 'Invalid year'),
});

const nonNegativeNumber = z.number().min(0, 'Value cannot be negative');

export const purchaseInfoSchema = z.object({
  purchaseQty: nonNegativeNumber,
  quantityPerUnit: nonNegativeNumber,
  unitPrice: nonNegativeNumber,
  discountAmount: nonNegativeNumber,
  purchasePrice: nonNegativeNumber,
  discountPrice: nonNegativeNumber.optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')),
});

export const createProductSchema = z.object({
  month_id: z.number().int().positive('month_id is required'),
  category_id: z.number().int().positive('category_id is required'),
  opening_qty: nonNegativeNumber,
  closing_qty: nonNegativeNumber.optional(),
  purchase_1st_qty: nonNegativeNumber,
  purchase_2nd_qty: nonNegativeNumber,
  purchase_3rd_qty: nonNegativeNumber,
  used_qty_1st_week: nonNegativeNumber,
  used_qty_2nd_week: nonNegativeNumber,
  used_qty_3rd_week: nonNegativeNumber,
  used_qty_4th_week: nonNegativeNumber,
  used_qty_5th_week: nonNegativeNumber,
  price_1st: nonNegativeNumber.optional(),
  price_2nd: nonNegativeNumber.optional(),
  price_3rd: nonNegativeNumber.optional(),
  unit_price_1st: nonNegativeNumber.optional(),
  unit_price_2nd: nonNegativeNumber.optional(),
  unit_price_3rd: nonNegativeNumber.optional(),
  discount_amount_1st: nonNegativeNumber.optional(),
  discount_amount_2nd: nonNegativeNumber.optional(),
  discount_amount_3rd: nonNegativeNumber.optional(),
  quantity_per_unit_1st: nonNegativeNumber.optional(),
  quantity_per_unit_2nd: nonNegativeNumber.optional(),
  quantity_per_unit_3rd: nonNegativeNumber.optional(),
  purchase_date_1st: z.string().nullish(),
  purchase_date_2nd: z.string().nullish(),
  purchase_date_3rd: z.string().nullish(),
});

export const createPurchaseSchema = z.object({
  category_id: z.number().int().positive('category_id is required'),
  purchase_date: z.string().min(1, 'Purchase date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit_price: nonNegativeNumber,
  purchase_price: nonNegativeNumber,
  discount_price: nonNegativeNumber.optional(),
  discount_amount: nonNegativeNumber.optional(),
  quantity_per_unit: z.number().positive('Quantity per unit must be greater than 0').optional(),
  monthly_stock_id: z.number().int().positive().nullish(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  password: passwordSchema,
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  status: z.enum(['active', 'inactive']),
});

export const weeklyCheckSchema = z.object({
  month_id: z.number().int().positive('month_id is required'),
  category_id: z.number().int().positive('category_id is required'),
  used_qty_1st_week: nonNegativeNumber.default(0),
  used_qty_2nd_week: nonNegativeNumber.default(0),
  used_qty_3rd_week: nonNegativeNumber.default(0),
  used_qty_4th_week: nonNegativeNumber.default(0),
  used_qty_5th_week: nonNegativeNumber.default(0),
  checked_week_1: z.boolean().default(false),
  checked_week_2: z.boolean().default(false),
  checked_week_3: z.boolean().default(false),
  checked_week_4: z.boolean().default(false),
  checked_week_5: z.boolean().default(false),
});

export const productFormSchema = z.object({
  parentId: z.string().min(1, 'Parent category is required'),
  categoryId: z.string().min(1, 'Sub category is required'),
  itemDescription: z.string().min(1, 'Item description is required'),
  openingQty: nonNegativeNumber,
  purchaseQty1st: nonNegativeNumber,
  quantityPerUnit1st: nonNegativeNumber,
  unitPrice1st: nonNegativeNumber,
  discountAmount1st: nonNegativeNumber,
  price1st: nonNegativeNumber,
  purchaseDate1st: z.string().optional().or(z.literal('')),
  purchaseQty2nd: nonNegativeNumber,
  quantityPerUnit2nd: nonNegativeNumber,
  unitPrice2nd: nonNegativeNumber,
  discountAmount2nd: nonNegativeNumber,
  price2nd: nonNegativeNumber,
  purchaseDate2nd: z.string().optional().or(z.literal('')),
  purchaseQty3rd: nonNegativeNumber,
  quantityPerUnit3rd: nonNegativeNumber,
  unitPrice3rd: nonNegativeNumber,
  discountAmount3rd: nonNegativeNumber,
  price3rd: nonNegativeNumber,
  purchaseDate3rd: z.string().optional().or(z.literal('')),
  usedQty1stWeek: nonNegativeNumber,
  usedQty2ndWeek: nonNegativeNumber,
  usedQty3rdWeek: nonNegativeNumber,
  usedQty4thWeek: nonNegativeNumber,
  usedQty5thWeek: nonNegativeNumber,
}).superRefine((data, ctx) => {
  if (data.purchaseQty1st > 0 && data.price1st === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price is required when purchase quantity is provided', path: ['price1st'] });
  }
  if (data.price1st > 0 && data.purchaseQty1st === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Purchase quantity is required when price is provided', path: ['purchaseQty1st'] });
  }
  if (data.purchaseQty2nd > 0 && data.price2nd === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price is required when purchase quantity is provided', path: ['price2nd'] });
  }
  if (data.price2nd > 0 && data.purchaseQty2nd === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Purchase quantity is required when price is provided', path: ['purchaseQty2nd'] });
  }
  if (data.purchaseQty3rd > 0 && data.price3rd === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price is required when purchase quantity is provided', path: ['price3rd'] });
  }
  if (data.price3rd > 0 && data.purchaseQty3rd === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Purchase quantity is required when price is provided', path: ['purchaseQty3rd'] });
  }
});

export const weeklyCheckFormSchema = z.object({
  usedQty1stWeek: nonNegativeNumber,
  usedQty2ndWeek: nonNegativeNumber,
  usedQty3rdWeek: nonNegativeNumber,
  usedQty4thWeek: nonNegativeNumber,
  usedQty5thWeek: nonNegativeNumber,
  checkedWeek1: z.boolean(),
  checkedWeek2: z.boolean(),
  checkedWeek3: z.boolean(),
  checkedWeek4: z.boolean(),
  checkedWeek5: z.boolean(),
});

export const purchaseFormSchema = z.object({
  purchase_date: z.string().min(1, 'Purchase date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit_price: nonNegativeNumber,
  purchase_price: nonNegativeNumber,
  discount_price: nonNegativeNumber.optional(),
  discount_amount: nonNegativeNumber,
  quantity_per_unit: z.number().positive('Quantity per unit must be greater than 0'),
});

export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  status: z.enum(['active', 'inactive']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordApiSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  parentId: z.string(),
  remark: z.string().max(500).optional(),
  minQuantity: z.union([z.literal(''), z.number().min(0, 'Minimum quantity cannot be negative')]),
});
