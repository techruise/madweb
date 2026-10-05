import assert from "node:assert/strict";
import { inquirySchema } from "../lib/inquiry-schema";
import { propertySchema, projectSchema } from "../lib/admin/schemas";
const valid = {
  name: "Test visitor",
  phone: "03001234567",
  email: "",
  service: "sale",
  area: "DHA",
  message: "This is a test message.",
  source_page: "/",
  consent: true,
  website: "",
};
assert.equal(inquirySchema.parse(valid).phone, "+923001234567");
for (const phone of ["+923001234567", "923001234567", "0300 1234567"])
  assert(inquirySchema.safeParse({ ...valid, phone }).success);
for (const phone of ["1234", "+15551234567", "030012345678", "92300123456"])
  assert(!inquirySchema.safeParse({ ...valid, phone }).success);
assert(!inquirySchema.safeParse({ ...valid, name: "<script>" }).success);
assert(!inquirySchema.safeParse({ ...valid, consent: false }).success);
assert(
  !inquirySchema.safeParse({ ...valid, source_page: "//untrusted.invalid" })
    .success,
);
assert(
  !inquirySchema.safeParse({ ...valid, message: "x".repeat(2001) }).success,
);
const property = {
  title: "TEST property",
  slug: "test-property",
  description: "Not a real property. Test only.",
  area: "DHA",
  featured: false,
  published: false,
  is_sample: true,
  type: "sale",
  price: null,
  size: null,
  size_unit: "marla",
  bedrooms: null,
  bathrooms: null,
  status: "for sale",
};
assert(propertySchema.safeParse(property).success);
assert(!propertySchema.safeParse({ ...property, role: "admin" }).success);
assert(!propertySchema.safeParse({ ...property, price: -1 }).success);
assert(!projectSchema.safeParse({ ...property, scope: "finishing" }).success);
console.log(
  "PASS: phone normalisation, input bounds, HTML rejection, consent, source page and admin allowlists",
);
