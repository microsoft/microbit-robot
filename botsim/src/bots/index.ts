import testBot from "./testBot"
import elecfreakscutebotBot from "./elecfreakscutebotBot"

export const BOTS = {
    [elecfreakscutebotBot.productId]: elecfreakscutebotBot,
    [testBot.productId]: testBot,
}

export const DEFAULT_BOT = testBot.productId
