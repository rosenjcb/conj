export const parseError = (e) => {
  if (!e || !e.response || !e.response.data)
    return "Could not connect. Please try again later.";
  const response = e.response.data;
  if (response.coercion === "malli") {
    return response.errors.map((err) => err.message).join("\n");
  } else {
    console.log(response);
    return response;
  }
};
