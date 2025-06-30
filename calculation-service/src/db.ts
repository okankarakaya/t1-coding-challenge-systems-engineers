// calculation-service/src/db.ts
import { MongoClient, Db } from 'mongodb'
import { PnLResult, TradeMessage } from './utils'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://database:27017'
const DB_NAME = process.env.DB_NAME || 't1_coding_challenge'

let client: MongoClient | null = null

export async function connectToDb(): Promise<Db> {
    if (!client) {
        try {
            client = new MongoClient(MONGO_URL)
            await client.connect()

            const db = client.db(DB_NAME)

            const pnlCollection = db.collection<PnLResult>('pnl_results')
            await pnlCollection.createIndex({ startTime: 1, endTime: 1 }, { unique: true })

            const tradeBuffer = db.collection<TradeMessage>('trades_buffer')
            await tradeBuffer.createIndex({ time: 1 }, { expireAfterSeconds: 600 })

            return db
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error)
            throw error
        }
    }
    return client.db(DB_NAME)
}

export async function savePnLResult(result: PnLResult): Promise<void> {
    const db = await connectToDb()
    await db.collection<PnLResult>('pnl_results').insertOne(result)
}

export async function saveTradeMessage(trade: TradeMessage): Promise<void> {
    const db = await connectToDb()
    await db.collection<TradeMessage>('trades_buffer').insertOne(trade)
}

export async function getTradesInWindow(start: Date, end: Date): Promise<TradeMessage[]> {
    const db = await connectToDb()
    return db
        .collection<TradeMessage>('trades_buffer')
        .find({ time: { $gte: start, $lte: end } })
        .toArray()
}