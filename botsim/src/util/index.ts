import { nanoid } from "nanoid"

export function nextId(): string {
    return nanoid(6)
}
