import { useEffect, useState } from "react"

export function useStream<T>(endpoint: string) {
    const [data, setData] = useState<T>()

    useEffect(() => {
        const source = new EventSource(`http://localhost:3001${endpoint}`)

        source.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data)
                setData(parsed)
            } catch (err) {
                console.error("Failed to parse SSE message:", err)
            }
        }

        source.onerror = (err) => {
            console.error("SSE connection error:", err)
            source.close()
        }

        return () => {
            source.close()
        }
    }, [endpoint])

    return data
}