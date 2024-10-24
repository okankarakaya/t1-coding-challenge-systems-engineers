import Kafka from 'node-rdkafka';
import { toTradeMessage } from './transformation';

let buyVolume = 0;
let sellVolume = 0;
export function getOpenPosition() {
    return buyVolume - sellVolume
}

const consumer = new Kafka.KafkaConsumer({
    'group.id': 'frontend-service',
    'metadata.broker.list': 'kafka:9092'
}, {});

consumer.connect({}, (err, metaData) => {
    if (err) {
        console.error('Error connecting to Kafka:', err);
        return;
    }

    console.log('Connected to Kafka:', metaData);
});

consumer.on('ready', () => {
    consumer.subscribe(['trades']);
    consumer.consume();
}).on('data', (data) => {
    if (!data.value) {
        throw new Error('Invalid message');
    }

    const message = JSON.parse(data.value.toString());
    if (message.messageType !== 'trades') {
        return;
    }

    const tradeMessage = toTradeMessage(message);
    if (tradeMessage.tradeType === 'BUY') {
        buyVolume += tradeMessage.volume
    } else if (tradeMessage.tradeType === 'SELL') {
        sellVolume += tradeMessage.volume;
    } else {
        throw new Error('Invalid trade type');
    }
});
