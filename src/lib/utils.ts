export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
    }).format(amount).replace(/\s?MAD$/, '').trim() + ' DH';
};

export const formatCompactCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
        return (amount / 1000000).toFixed(1).replace('.', ',') + 'M DH';
    }
    if (Math.abs(amount) >= 1000) {
        return (amount / 1000).toFixed(1).replace('.', ',') + 'K DH';
    }
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' DH';
};

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
};
