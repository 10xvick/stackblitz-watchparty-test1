export const generate = (app, data) => {
  for (let operation in data) {
    const { method, args } = data[operation];
    app[method](...args);
  }
};
