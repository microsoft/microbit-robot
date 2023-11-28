import { nanoid } from "nanoid"

function getValue(key: string, defaultValue?: string): string | undefined {
    return localStorage.getItem(key) || defaultValue
}

function setValue(key: string, val: string) {
    localStorage.setItem(key, val)
}

function delValue(key: string) {
    localStorage.removeItem(key)
}

function getJsonValue<T>(key: string, defaultValue?: T): T | undefined {
    const value = getValue(key)
    if (value) {
        return JSON.parse(value)
    }
    return defaultValue
}

function setJsonValue(key: string, val: any) {
    setValue(key, JSON.stringify(val))
}
