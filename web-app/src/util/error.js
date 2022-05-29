export const parseError = (e) => {
  const response = e.response.data;
  if(response.coercion === "malli") {
    return response.errors.map(err => err.message).join("\n");
  } else {
    console.log(response);
    return response;
  }
}
