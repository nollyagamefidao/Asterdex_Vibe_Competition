import https from 'https';
import crypto from 'crypto';

interface RequestOptions {
  method: string;
  path: string;
  params?: Record<string, any>;
  requiresAuth?: boolean;
}

interface ApiResponse {
  statusCode: number;
  data: any;
}

export class AsterdexClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = 'fapi.asterdex.com';
  }

  private async request(
    method: string,
    path: string,
    params: Record<string, any> = {},
    requiresAuth: boolean = true
  ): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      if (requiresAuth) {
        params.timestamp = Date.now();
      }

      const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      let finalQueryString = queryString;
      if (requiresAuth) {
        const signature = crypto
          .createHmac('sha256', this.secretKey)
          .update(queryString)
          .digest('hex');
        finalQueryString = queryString + `&signature=${signature}`;
      }

      let fullPath = path;
      let body = '';

      const options: https.RequestOptions = {
        hostname: this.baseUrl,
        port: 443,
        method: method.toUpperCase(),
        headers: {} as Record<string, string>,
      };

      if (requiresAuth) {
        (options.headers as Record<string, string>)['X-MBX-APIKEY'] = this.apiKey;
      }

      if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
        fullPath += '?' + finalQueryString;
      } else {
        body = finalQueryString;
        (options.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
        (options.headers as Record<string, string>)['Content-Length'] = Buffer.byteLength(body).toString();
      }

      options.path = fullPath;

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode || 500,
              data: JSON.parse(data),
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode || 500,
              data: data,
            });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  async ping(): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v1/ping', {}, false);
  }

  async getServerTime(): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v1/time', {}, false);
  }

  async getExchangeInfo(): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v1/exchangeInfo', {}, false);
  }

  async getTicker(symbol: string): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v1/ticker/price', { symbol }, false);
  }

  async get24hrTicker(symbol: string): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v1/ticker/24hr', { symbol }, false);
  }

  async getBalance(): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v2/balance', {}, true);
  }

  async getAccount(): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v2/account', {}, true);
  }

  async getPositions(): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v2/positionRisk', {}, true);
  }

  async placeOrder(params: Record<string, any>): Promise<ApiResponse> {
    return await this.request('POST', '/fapi/v1/order', params, true);
  }

  async getOpenOrders(symbol?: string): Promise<ApiResponse> {
    const params = symbol ? { symbol } : {};
    return await this.request('GET', '/fapi/v1/openOrders', params, true);
  }

  async cancelOrder(symbol: string, orderId: string): Promise<ApiResponse> {
    return await this.request('DELETE', '/fapi/v1/order', { symbol, orderId }, true);
  }

  async getOrder(symbol: string, orderId: string): Promise<ApiResponse> {
    return await this.request('GET', '/fapi/v1/order', { symbol, orderId }, true);
  }

  async setLeverage(symbol: string, leverage: number): Promise<ApiResponse> {
    return await this.request('POST', '/fapi/v1/leverage', { symbol, leverage }, true);
  }

  async setMarginType(symbol: string, marginType: string): Promise<ApiResponse> {
    return await this.request('POST', '/fapi/v1/marginType', { symbol, marginType }, true);
  }
}
