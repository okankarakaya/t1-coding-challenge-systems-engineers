export type TradeMessage = {
    messageType: 'trades'
    tradeType: 'BUY' | 'SELL'
    volume: number
    time: Date
}

export type MarketMessage = {
    messageType: 'market'
    buyPrice: number
    sellPrice: number
    startTime: Date
    endTime: Date
}

export interface PnLResult {
    startTime: Date
    endTime: Date
    buyPrice: number
    sellPrice: number
    buyVolume: number
    sellVolume: number
    pnl: number
    calculatedAt: Date
}

export function toMarketMessage(raw: any): MarketMessage {
    return {
        messageType: raw.messageType,
        buyPrice: parseFloat(raw.buyPrice),
        sellPrice: parseFloat(raw.sellPrice),
        startTime: new Date(raw.startTime),
        endTime: new Date(raw.endTime)
    }
}

export function toTradeMessage(raw: any): TradeMessage {
    return {
        messageType: raw.messageType,
        tradeType: raw.tradeType,
        volume: parseFloat(raw.volume),
        time: new Date(raw.time)
    }
}