export const handlePromiseError = async (promise: Promise<any>) => {
  try {
    const res = await promise;

    return res;
  } catch (e) {
    return {error: e};
  }
}