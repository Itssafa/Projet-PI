export class DateUtil {
  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static getTimeAgo(date: string | Date): string {
    const now = new Date().getTime();
    const past = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
    const diff = now - past;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 30) return `Il y a ${days}j`;
    
    return this.formatDate(date);
  }

  static isExpired(date: string | Date): boolean {
    const expireDate = typeof date === 'string' ? new Date(date) : date;
    return expireDate.getTime() < new Date().getTime();
  }

  static getDaysUntilExpiry(date: string | Date): number {
    const expireDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = expireDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}