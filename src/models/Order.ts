import { Schema, model, models, Types } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Types.ObjectId, default: null },
    name: { type: String, required: true },
    image: String,
    size: String,
    color: String,
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AddressSnapshotSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    region: String,
    postalCode: String,
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Types.ObjectId, ref: "User", default: null },
    guestEmail: { type: String, default: null },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: AddressSnapshotSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "KES" },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "pesapal"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    pesapalOrderTrackingId: { type: String, default: null },
    paymentMethodDetail: { type: String, default: null },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);



// import { Schema, model, models, Types } from "mongoose";

// const OrderItemSchema = new Schema(
//   {
//     product: { type: Types.ObjectId, ref: "Product", required: true },
//     variantId: { type: Types.ObjectId, default: null },
//     name: { type: String, required: true },
//     image: String,
//     size: String,
//     color: String,
//     sku: { type: String, required: true },
//     price: { type: Number, required: true },
//     quantity: { type: Number, required: true, min: 1 },
//   },
//   { _id: false }
// );

// const AddressSnapshotSchema = new Schema(
//   {
//     fullName: { type: String, required: true },
//     line1: { type: String, required: true },
//     line2: String,
//     city: { type: String, required: true },
//     region: String,
//     postalCode: String,
//     country: { type: String, required: true },
//     phone: { type: String, required: true },
//   },
//   { _id: false }
// );

// const OrderSchema = new Schema(
//   {
//     orderNumber: { type: String, required: true, unique: true },
//     user: { type: Types.ObjectId, ref: "User", default: null },
//     guestEmail: { type: String, default: null },
//     items: { type: [OrderItemSchema], required: true },
//     shippingAddress: { type: AddressSnapshotSchema, required: true },
//     subtotal: { type: Number, required: true },
//     shippingFee: { type: Number, default: 0 },
//     couponCode: { type: String, default: null },
//     discountAmount: { type: Number, default: 0 },
//     total: { type: Number, required: true },
//     currency: { type: String, default: "KES" },

//     paymentMethod: {
//   type: String,
//   enum: ["cash_on_delivery", "pesapal"],
//   required: true,
// },
// paymentStatus: {
//   type: String,
//   enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
//   default: "pending",
// },
// pesapalOrderTrackingId: { type: String, default: null },
// paymentMethodDetail: { type: String, default: null },

//     // paymentMethod: {
//     //   type: String,
//     //   enum: ["cash_on_delivery", "card", "mpesa", "airtel_money"],
//     //   required: true,
//     // },
//     // paymentStatus: {
//     //   type: String,
//     //   enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
//     //   default: "pending",
//     // },

//     orderStatus: {
//       type: String,
//       enum: [
//         "pending", "confirmed", "processing", "packed",
//         "shipped", "delivered", "cancelled", "returned",
//       ],
//       default: "pending",
//     },
//     notes: String,
//   },
//   { timestamps: true }
// );

// export default models.Order || model("Order", OrderSchema);