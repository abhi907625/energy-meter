export type SensorData = {
    _id: string,
    temperature: number,
    humidity: number,
    timestamp: string
    _v: number
}

export type responseData = {
    status: number,
    message?: string,
    error?: string
}