import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LogoService {
	// No external API needed

	/**
	 * Known company display name → official domain mapping.
	 * Add more entries as needed for complex or accented names.
	 * (Kept for future reference, but not used in avatar generation.)
	 */
	private readonly knownCompanies: Record<string, string> = {
		thales: 'thalesgroup.com',
		'disney and disney plus': 'disney.com',
		disney: 'disney.com',
		cocacola: 'coca-cola.com',
		'coca cola': 'coca-cola.com',
		carrefour: 'carrefour.com',
		spotify: 'spotify.com',
		google: 'google.com',
		apple: 'apple.com',
		microsoft: 'microsoft.com',
		amazon: 'amazon.com',
		netflix: 'netflix.com',
		starbucks: 'starbucks.com',
		nike: 'nike.com',
		adidas: 'adidas.com',
	};

	/**
	 * Normalizes a company name:
	 * - lowercases
	 * - removes accents
	 * - removes special characters except spaces
	 * - collapses multiple spaces
	 */
	private normalize(name: string): string {
		return name
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9\s]/g, '')
			.trim()
			.replace(/\s+/g, ' ');
	}

	/**
	 * Returns the domain for a company name.
	 * Checks known-companies map first, then falls back to guessed domain.
	 * (Kept for compatibility, but not used in avatar generation.)
	 */
	private getDomain(companyName: string): string {
		const normalized = this.normalize(companyName);

		if (this.knownCompanies[normalized]) {
			return this.knownCompanies[normalized];
		}

		return normalized.replace(/\s/g, '') + '.com';
	}

	/**
	 * Generates a data URI containing an SVG avatar for the given company name.
	 * Uses the first letter(s) of the name and a deterministic, vibrant background.
	 */
	getLogoUrl(companyName: string, size: number = 64): string {
		if (!companyName) return '';

		const words = this.normalize(companyName).split(' ').filter(Boolean);
		const firstInitial = words[0]?.charAt(0) ?? '';
		const secondInitial = words.length > 1 ? words[1].charAt(0) : '';
		const initials = (firstInitial + secondInitial).toUpperCase();

		// Vibrant palette (saturated, modern)
		const palette = [
			'#FF5733',
			'#33FF57',
			'#3357FF',
			'#FF33A8',
			'#FFD733',
			'#33FFF5',
			'#FF8C33',
			'#B833FF',
			'#FF3333',
			'#33FFC1',
			'#FF33D4',
			'#D4FF33',
		];
		const hash = this.simpleHash(companyName);
		const baseColor = palette[hash % palette.length];

		// Create a subtle gradient from lighter to base color
		const lighten = (hex: string, amount: number) => {
			const num = parseInt(hex.slice(1), 16);
			const r = Math.min(255, ((num >> 16) & 0xff) + amount);
			const g = Math.min(255, ((num >> 8) & 0xff) + amount);
			const b = Math.min(255, (num & 0xff) + amount);
			return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
		};
		const lightColor = lighten(baseColor, 60);

		// Build SVG with gradient
		const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
                <defs>
                    <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${lightColor}" />
                        <stop offset="100%" stop-color="${baseColor}" />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill="url(#grad${hash})" />
                <text x="50" y="55" text-anchor="middle" dominant-baseline="central"
                      font-family="Arial, sans-serif" font-size="40" font-weight="bold"
                      fill="#f4f6f9">${initials}</text>
            </svg>
        `.trim();

		return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
	}

	/** Simple string hash for deterministic color selection */
	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
		}
		return hash;
	}
}
