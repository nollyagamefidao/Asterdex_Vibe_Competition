/**
 * ASTERDEX SIMPLE API CLIENT (FIXED)
 * Uses standard API key/secret authentication
 */

const https = require('https');
const crypto = require('crypto');

class AsterDexSimpleClient {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = 'fapi.asterdex.com';
  }

  /**
   * Make API request
   */
  async request(method, path, params = {}, requiresAuth = true) {
    return new Promise((resolve, reject) => {
      if (requiresAuth) {
        params.timestamp = Date.now();
      }

      // Build query string BEFORE signing
      const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      // Generate signature if auth required
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

      const options = {
        hostname: this.baseUrl,
        port: 443,
        method: method.toUpperCase(),
        headers: {}
      };

      if (requiresAuth) {
        options.headers['X-MBX-APIKEY'] = this.apiKey;
      }

      if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
        fullPath += '?' + finalQueryString;
      } else {
        // POST/PUT - send in body
        body = finalQueryString;
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      options.path = fullPath;

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: data
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

  /**
   * Test connectivity
   */
  async ping() {
    return await this.request('GET', '/fapi/v1/ping', {}, false);
  }

  /**
   * Get server time
   */
  async getServerTime() {
    return await this.request('GET', '/fapi/v1/time', {}, false);
  }

  /**
   * Get exchange info
   */
  async getExchangeInfo() {
    return await this.request('GET', '/fapi/v1/exchangeInfo', {}, false);
  }

  /**
   * Get ticker price (no auth needed)
   */
  async getTicker(symbol) {
    return await this.request('GET', '/fapi/v1/ticker/price', { symbol }, false);
  }

  /**
   * Get 24hr ticker
   */
  async get24hrTicker(symbol) {
    return await this.request('GET', '/fapi/v1/ticker/24hr', { symbol }, false);
  }

  /**
   * Get account balance (requires auth)
   */
  async getBalance() {
    return await this.request('GET', '/fapi/v2/balance', {}, true);
  }

  /**
   * Get account info (requires auth)
   */
  async getAccount() {
    return await this.request('GET', '/fapi/v2/account', {}, true);
  }

  /**
   * Get positions (requires auth)
   */
  async getPositions() {
    return await this.request('GET', '/fapi/v2/positionRisk', {}, true);
  }

  /**
   * Place order (requires auth)
   */
  async placeOrder(params) {
    return await this.request('POST', '/fapi/v1/order', params, true);
  }

  /**
   * Get open orders
   */
  async getOpenOrders(symbol = null) {
    const params = symbol ? { symbol } : {};
    return await this.request('GET', '/fapi/v1/openOrders', params, true);
  }

  /**
   * Cancel order
   */
  async cancelOrder(symbol, orderId) {
    return await this.request('DELETE', '/fapi/v1/order', { symbol, orderId }, true);
  }

  /**
   * Get order status
   */
  async getOrder(symbol, orderId) {
    return await this.request('GET', '/fapi/v1/order', { symbol, orderId }, true);
  }

  /**
   * Set leverage
   */
  async setLeverage(symbol, leverage) {
    return await this.request('POST', '/fapi/v1/leverage', { symbol, leverage }, true);
  }

  /**
   * Set margin type
   */
  async setMarginType(symbol, marginType) {
    return await this.request('POST', '/fapi/v1/marginType', { symbol, marginType }, true);
  }
}

module.exports = AsterDexSimpleClient;