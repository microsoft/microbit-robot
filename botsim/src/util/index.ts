import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10)

export function nextId(): string {
    return nanoid()
}
