function prod() {
  return import.meta.env.PROD;
}

export default {
  url: 'https://example.com',
  prod,
};
