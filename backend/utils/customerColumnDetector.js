const detectCustomerColumns = (headers) => {
  const map = {};

  headers.forEach(h => {
    const key = h.toLowerCase().replace(/[\s_]/g, "");

    // name
    if (
      key.includes("name") ||
      key.includes("customer") ||
      key.includes("client")
    ) map.name = h;

    // mobile / phone
    if (
      key.includes("mobile") ||
      key.includes("phone") ||
      key.includes("contact") ||
      key.includes("number")
    ) map.mobile = h;

    // email
    if (
      key.includes("email") ||
      key.includes("mail") ||
      key.includes("gmail")
    ) map.email = h;
  });

  return map;
};

module.exports = detectCustomerColumns;
