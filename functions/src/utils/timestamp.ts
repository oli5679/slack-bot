export const timestamp = () => {
    const now = new Date();
    const seconds = Math.floor(now.getTime() / 1000);
    const microseconds = Number(process.hrtime.bigint() % BigInt(1e6));
    return `${seconds}.${String(microseconds).padStart(6, "0")}`;
};