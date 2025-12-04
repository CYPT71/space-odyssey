export const formatDistance = (d) => {
    const km = Math.round(d / 1000);
    return `${km.toLocaleString()} km`;
};
