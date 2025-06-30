import Kafka from 'node-rdkafka'
import { savePnLResult, saveTradeMessage, getTradesInWindow } from './db'
import { toMarketMessage, toTradeMessage, TradeMessage, MarketMessage } from './utils'
import { registerKafkaConsumer, setupShutdownHooks } from './kafkaShutdown'

const consumer = new Kafka.KafkaConsumer({
    'group.id': 'calculation-service',
    'metadata.broker.list': process.env.KAFKA_BROKER || 'kafka:9092',
    'enable.auto.commit': false,
}, {})

registerKafkaConsumer(consumer)
setupShutdownHooks()

consumer.connect()

consumer
    .on('ready', () => {
        consumer.subscribe(['market', 'trades'])
        consumer.consume()
    })
    .on('data', async (data) => {
        if (!data.value) return

        const rawMessage = data.value.toString()

        try {
            const parsed = JSON.parse(rawMessage)
            switch (parsed.messageType) {
                case 'trades':
                    await handleTradeMessage(toTradeMessage(parsed))
                    break

                case 'market':
                    await handleMarketMessage(toMarketMessage(parsed))
                    break

                default:
                    console.warn('Unknown messageType:', parsed.messageType)
            }

            consumer.commitMessage(data)
        } catch (err) {
            console.error('Raw:', rawMessage)
        }
    })
    .on('event.error', (err) => {
        console.error('Kafka consumer error:', err)
    })

async function handleTradeMessage(trade: TradeMessage) {
    await saveTradeMessage(trade)
}

async function handleMarketMessage(market: MarketMessage) {
    const tradesInWindow = await getTradesInWindow(market.startTime, market.endTime)

    let buyVolume = 0
    let sellVolume = 0

    for (const trade of tradesInWindow) {
        if (trade.tradeType === 'BUY') buyVolume += trade.volume
        else if (trade.tradeType === 'SELL') sellVolume += trade.volume
    }

    const matchedVolume = Math.min(buyVolume, sellVolume)
    const pnl = (market.sellPrice - market.buyPrice) * matchedVolume

    const result = {
        startTime: market.startTime,
        endTime: market.endTime,
        buyPrice: market.buyPrice,
        sellPrice: market.sellPrice,
        buyVolume,
        sellVolume,
        pnl,
        calculatedAt: new Date(),
    }

    try {
        await savePnLResult(result)
    } catch (err) {
        console.error('Error saving PnL to DB:', err)
    }
} 