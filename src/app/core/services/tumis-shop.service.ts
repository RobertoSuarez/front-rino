import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

export interface TumisOffer {
  id: number;
  tumisAmount: number;
  mulluCost: number;
  isPromotion: boolean;
  promotionLabel?: string;
  discount?: number;
  description: string;
}

export interface BuyTumisRequest {
  offerId: number;
}

export interface TumisTransaction {
  id: number;
  userId: number;
  resourceType: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
}

export interface TumisTransactionResponse {
  success: boolean;
  message: string;
  transaction: TumisTransaction;
  userBalance: {
    tumis: number;
    mullu: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TumisShopService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las ofertas disponibles de Tumis
   */
  getOffers(): Observable<ApiResponse<TumisOffer[]>> {
    return this.http.get<ApiResponse<TumisOffer[]>>(
      `${this.apiUrl}/tumis-shop/offers`
    );
  }

  /**
   * Compra Tumis usando Mullu
   */
  buyTumis(request: BuyTumisRequest): Observable<ApiResponse<TumisTransactionResponse>> {
    return this.http.post<ApiResponse<TumisTransactionResponse>>(
      `${this.apiUrl}/tumis-shop/buy`,
      request
    );
  }
}
