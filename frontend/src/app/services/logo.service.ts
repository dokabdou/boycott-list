import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LogoService {
	private readonly TOKEN = 'pk_P72_K-MiRNiZvWYb0jf5yQ';
	private readonly IMAGE_API = 'https://img.logo.dev';

	/**
	 * Known company display name → official domain mapping.
	 * Add more entries as needed for complex or accented names.
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
	 * Checks known‑companies map first, then falls back to guessed domain.
	 */
	private getDomain(companyName: string): string {
		const normalized = this.normalize(companyName);

		if (this.knownCompanies[normalized]) {
			return this.knownCompanies[normalized];
		}

		return normalized.replace(/\s/g, '') + '.com';
	}

	/**
	 * Builds a logo URL from company name using logo.dev image endpoint.
	 */
	getLogoUrl(companyName: string, size: number = 64): string {
		if (!companyName) return '';

		const domain = this.getDomain(companyName);
		return `${this.IMAGE_API}/${domain}?token=${this.TOKEN}&size=${size}&format=webp&retina=true`;
	}
}
